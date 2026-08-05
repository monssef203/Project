import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'watchstore-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Middleware: Require authentication
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }

  req.user = decoded;
  next();
}

/**
 * Middleware: Require admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Accès refusé - Droits administrateur requis' });
  }
  next();
}

export { JWT_SECRET };
