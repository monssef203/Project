import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { generateToken } from '../middleware/auth.js';
import { isValidEmail, sanitize } from '../utils/helpers.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, address, city } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, mot de passe et nom sont requis' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (email, password, name, phone, address, city) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(email, hashedPassword, sanitize(name), phone || null, sanitize(address) || null, sanitize(city) || null);

    const user = {
      id: result.lastInsertRowid,
      email,
      name: sanitize(name),
      phone,
      address,
      city,
      is_admin: 0
    };

    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = db.prepare(
      'SELECT id, email, password, name, phone, address, city, is_admin FROM users WHERE email = ?'
    ).get(email);

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        is_admin: user.is_admin
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Non authentifié' });

    const jwt = await import('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'watchstore-secret-key-change-in-production');

    const user = db.prepare(
      'SELECT id, email, name, phone, address, city, is_admin, created_at FROM users WHERE id = ?'
    ).get(decoded.id);

    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Non authentifié' });

    const jwt = await import('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'watchstore-secret-key-change-in-production');

    const { name, phone, address, city } = req.body;
    
    db.prepare(
      'UPDATE users SET name = ?, phone = ?, address = ?, city = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(sanitize(name), phone, sanitize(address), sanitize(city), decoded.id);

    res.json({ message: 'Profil mis à jour' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
