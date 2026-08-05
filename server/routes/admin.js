import express from 'express';
import db from '../db/database.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(requireAuth);
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Dashboard statistics
 */
router.get('/dashboard', (req, res) => {
  try {
    const stats = {
      totalOrders: db.prepare('SELECT COUNT(*) as count FROM orders').get().count || 0,
      totalRevenue: db.prepare(
        'SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE payment_status = ?'
      ).get('paid').sum || 0,
      totalProducts: db.prepare('SELECT COUNT(*) as count FROM products').get().count || 0,
      totalUsers: db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 0').get().count || 0,
      pendingOrders: db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('pending').count || 0,
      confirmedOrders: db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('confirmed').count || 0,
      lowStock: db.prepare('SELECT COUNT(*) as count FROM products WHERE stock < 5').get().count || 0,
    };

    // Recent orders
    const recentOrders = db.prepare(`
      SELECT o.*, u.name as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `).all();

    // Top selling products - use separate queries
    const topProductsRaw = db.prepare(`
      SELECT product_id, SUM(quantity) as total_sold
      FROM order_items
      GROUP BY product_id
      ORDER BY total_sold DESC
      LIMIT 5
    `).all();

    const topProducts = topProductsRaw.map(item => {
      const product = db.prepare('SELECT name, price FROM products WHERE id = ?').get(item.product_id);
      return {
        name: product ? product.name : 'Unknown',
        price: product ? product.price : 0,
        total_sold: item.total_sold,
      };
    });

    res.json({ stats, monthlyRevenue: [], recentOrders, topProducts });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/admin/orders
 * List all orders with filters
 */
router.get('/orders', (req, res) => {
  try {
    const { status, payment_method, page = 1, limit = 20, search = '' } = req.query;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }
    if (payment_method) {
      conditions.push('o.payment_method = ?');
      params.push(payment_method);
    }
    if (search) {
      conditions.push('(o.order_number LIKE ? OR u.name LIKE ? OR o.guest_email LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `
      SELECT COUNT(*) as total FROM orders o
      LEFT JOIN users u ON o.user_id = u.id ${whereClause}
    `;
    const totalResult = db.prepare(countQuery).get(...params);
    const total = totalResult ? totalResult.total : 0;

    const query = `
      SELECT o.*, u.name as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const orders = db.prepare(query).all(...params, limitNum, offset);

    // Add items summary separately
    const ordersWithSummary = orders.map(o => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(Number(o.id));
      const itemsSummary = items.map(i => `${i.product_name} x${i.quantity}`).join(', ');
      return { ...o, items_summary: itemsSummary };
    });

    res.json({
      orders: ordersWithSummary,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (err) {
    console.error('Admin orders error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/admin/orders/:id
 * Get order details with items
 */
router.get('/orders/:id', (req, res) => {
  try {
    const order = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).get(req.params.id);

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
 * PUT /api/admin/orders/:id/status
 * Update order status
 */
router.put('/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, req.params.id);

    if (status === 'cancelled' && order.status !== 'cancelled') {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      for (const item of items) {
        db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
      }
    }

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT /api/admin/orders/:id/payment
 * Manually update payment status
 */
router.put('/orders/:id/payment', (req, res) => {
  try {
    const { payment_status } = req.body;
    const validPaymentStatuses = ['pending', 'paid', 'failed'];

    if (!validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({ error: 'Statut de paiement invalide' });
    }

    db.prepare('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(payment_status, req.params.id);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/admin/users
 * List all users
 */
router.get('/users', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const totalResult = db.prepare('SELECT COUNT(*) as total FROM users').get();
    const total = totalResult ? totalResult.total : 0;

    const users = db.prepare(
      'SELECT id, email, name, phone, address, city, is_admin, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(limit, offset);

    const userWithOrders = users.map(u => {
      const countResult = db.prepare('SELECT COUNT(*) as count FROM orders WHERE user_id = ?').get(u.id);
      const orderCount = countResult ? countResult.count : 0;
      return { ...u, orderCount };
    });

    res.json({
      users: userWithOrders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/admin/products
 * List products for admin (includes out-of-stock)
 */
router.get('/products', (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(p.name LIKE ? OR p.brand LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const countResult = db.prepare(`SELECT COUNT(*) as total FROM products p ${whereClause}`).get(...params);
    const total = countResult ? countResult.total : 0;

    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const products = db.prepare(query).all(...params, limitNum, offset);

    // Add total_sold for each product
    const productsWithSales = products.map(p => {
      const salesResult = db.prepare(
        'SELECT COALESCE(SUM(quantity), 0) as total_sold FROM order_items WHERE product_id = ?'
      ).get(p.id);
      return { ...p, total_sold: salesResult ? salesResult.total_sold : 0 };
    });

    res.json({
      products: productsWithSales,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (err) {
    console.error('Admin products error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
