import express from 'express';
import db from '../db/database.js';
import { generateOrderNumber, sanitize, isValidEmail, isValidPhone } from '../utils/helpers.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', (req, res) => {
  try {
    const { items, shipping_address, shipping_city, shipping_phone, notes, payment_method, guest_email } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Le panier est vide' });
    }

    if (!payment_method || !['card', 'cod'].includes(payment_method)) {
      return res.status(400).json({ error: 'Méthode de paiement invalide' });
    }

    if (!shipping_address || !shipping_city || !shipping_phone) {
      return res.status(400).json({ error: 'Adresse de livraison complète requise' });
    }

    if (!isValidPhone(shipping_phone)) {
      return res.status(400).json({ error: 'Numéro de téléphone invalide (format: 06XXXXXXXX)' });
    }

    if (!req.user && !guest_email) {
      return res.status(400).json({ error: 'Email requis pour la commande invité' });
    }

    if (guest_email && !isValidEmail(guest_email)) {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }

    // Calculate total and validate stock
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Produit #${item.product_id} non trouvé` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuffisant pour "${product.name}" (${product.stock} disponibles)` });
      }
      total += product.price * item.quantity;
      orderItems.push({ product, quantity: item.quantity });
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const initialStatus = payment_method === 'card' ? 'confirmed' : 'pending';
    const initialPaymentStatus = 'pending';

    const orderResult = db.prepare(
      `INSERT INTO orders (order_number, user_id, guest_email, total, payment_method, 
       shipping_address, shipping_city, shipping_phone, notes, payment_status, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      orderNumber,
      req.user ? req.user.id : null,
      guest_email || null,
      total,
      payment_method,
      sanitize(shipping_address),
      sanitize(shipping_city),
      shipping_phone,
      sanitize(notes) || null,
      initialPaymentStatus,
      initialStatus
    );

    const orderId = Number(orderResult.lastInsertRowid);

    // Insert order items
    for (const { product, quantity } of orderItems) {
      db.prepare(
        'INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity) VALUES (?, ?, ?, ?, ?)'
      ).run(orderId, product.id, product.name, product.price, quantity);
    }

    // Update stock
    for (const item of orderItems) {
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product.id);
    }

    // Process card payment if applicable
    let payment_status = initialPaymentStatus;
    let status = initialStatus;

    if (payment_method === 'card') {
      const paymentSuccess = processCardPayment(total, req.body.card_info);
      if (paymentSuccess) {
        payment_status = 'paid';
        status = 'confirmed';
      } else {
        payment_status = 'failed';
        status = 'cancelled';
      }
      db.prepare('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?')
        .run(payment_status, status, orderId);
    }

    // Fetch complete order
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItemsList = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    const itemsSummary = orderItemsList.map(i => `${i.product_name} x${i.quantity}`).join(', ');
    const orderWithSummary = { ...(order || {}), items_summary: itemsSummary };

    res.status(201).json({ order: orderWithSummary, payment_status, status });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la commande' });
  }
});

/**
 * GET /api/orders
 * Get user's orders (authenticated)
 */
router.get('/', requireAuth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const countResult = db.prepare('SELECT COUNT(*) as total FROM orders WHERE user_id = ?').get(req.user.id);
    const total = countResult ? countResult.total : 0;

    const orders = db.prepare(`
      SELECT orders.*
      FROM orders
      WHERE orders.user_id = ?
      ORDER BY orders.created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, limit, offset);

    // Add items summary
    const ordersWithSummary = orders.map(o => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      const itemsSummary = items.map(i => `${i.product_name} x${i.quantity}`).join(', ');
      return { ...o, items_summary: itemsSummary };
    });

    res.json({
      orders: ordersWithSummary,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/orders/:id
 * Get single order
 */
router.get('/:id', requireAuth, (req, res) => {
  try {
    const order = db.prepare(`
      SELECT * FROM orders WHERE id = ? AND (user_id = ? OR ? = 1)
    `).get(req.params.id, req.user.id, req.user.is_admin || 0);

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(Number(order.id));
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * Simulate card payment processing
 * In production, replace with actual payment gateway (Stripe, etc.)
 */
function processCardPayment(amount, cardInfo) {
  if (!cardInfo) return false;
  const { card_number, expiry, cvv, card_name } = cardInfo;
  if (!card_number || !expiry || !cvv || !card_name) return false;
  if (card_number.replace(/\s/g, '').startsWith('0')) return false;
  return true;
}

export default router;
