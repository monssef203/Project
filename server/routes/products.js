import express from 'express';
import db from '../db/database.js';
import { sanitize } from '../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/products
 * List products with search, filter, pagination
 */
router.get('/', (req, res) => {
  try {
    const {
      search = '',
      brand = '',
      category = '',
      min_price = '',
      max_price = '',
      sort = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 12,
      featured = ''
    } = req.query;

    const conditions = [];
    const params = [];

    // Search filter
    if (search) {
      conditions.push('(products.name LIKE ? OR products.description LIKE ? OR products.brand LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    // Brand filter
    if (brand) {
      conditions.push('products.brand = ?');
      params.push(brand);
    }

    // Category filter
    if (category) {
      conditions.push('products.category_id = ?');
      params.push(category);
    }

    // Price range
    if (min_price) {
      conditions.push('products.price >= ?');
      params.push(Number(min_price));
    }
    if (max_price) {
      conditions.push('products.price <= ?');
      params.push(Number(max_price));
    }

    // Featured filter
    if (featured === '1') {
      conditions.push('products.is_featured = 1');
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Allowed sort columns
    const allowedSorts = ['name', 'price', 'created_at', 'brand'];
    const sortCol = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const { total } = db.prepare(countQuery).get(...params);

    // Get paginated results
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const query = `
      SELECT products.*, categories.name as category_name
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      ${whereClause}
      ORDER BY products.${sortCol} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const products = db.prepare(query).all(...params, limitNum, offset);

    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/products/brands
 * Get all unique brands
 */
router.get('/brands', (req, res) => {
  try {
    const brands = db.prepare(
      'SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL ORDER BY brand'
    ).all();
    res.json(brands.map(b => b.brand));
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/products/categories
 * Get all categories
 */
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    // Add product count
    const categoriesWithCount = categories.map(c => {
      const countResult = db.prepare('SELECT COUNT(*) as product_count FROM products WHERE category_id = ?').get(c.id);
      return { ...c, product_count: countResult ? countResult.product_count : 0 };
    });
    res.json(categoriesWithCount);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/products/:id
 * Get single product by ID
 */
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT products.*, categories.name as category_name
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      WHERE products.id = ?
    `).get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin product routes
/**
 * POST /api/products
 * Create a new product (admin only)
 */
router.post('/', (req, res) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { name, description, price, image, brand, category_id, stock, is_featured } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Nom et prix sont requis' });
    }

    if (price < 0) {
      return res.status(400).json({ error: 'Le prix doit être positif' });
    }

    const result = db.prepare(
      `INSERT INTO products (name, description, price, image, brand, category_id, stock, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      sanitize(name),
      sanitize(description) || null,
      price,
      image || null,
      sanitize(brand) || null,
      category_id || null,
      stock || 0,
      is_featured ? 1 : 0
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT /api/products/:id
 * Update product (admin only)
 */
router.put('/:id', (req, res) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { name, description, price, image, brand, category_id, stock, is_featured } = req.body;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    db.prepare(
      `UPDATE products SET name = ?, description = ?, price = ?, image = ?, brand = ?, 
       category_id = ?, stock = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(
      sanitize(name) || product.name,
      sanitize(description) !== undefined ? description : product.description,
      price !== undefined ? price : product.price,
      image !== undefined ? image : product.image,
      sanitize(brand) !== undefined ? brand : product.brand,
      category_id !== undefined ? category_id : product.category_id,
      stock !== undefined ? stock : product.stock,
      is_featured !== undefined ? (is_featured ? 1 : 0) : product.is_featured,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/products/:id
 * Delete product (admin only)
 */
router.delete('/:id', (req, res) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
