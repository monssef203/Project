import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique order number
 */
export function generateOrderNumber() {
  const prefix = 'WS';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().slice(0, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Format price in Moroccan Dirhams
 */
export function formatPrice(price) {
  return `${price.toLocaleString('fr-MA')} DH`;
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number (Moroccan format)
 */
export function isValidPhone(phone) {
  const re = /^(0|\+212)[5-7]\d{8}$/;
  return re.test(phone.replace(/\s/g, ''));
}

/**
 * Paginate results
 */
export function paginate(query, params, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  return { limit, offset, page };
}

/**
 * Calculate order total from items
 */
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Sanitize string input
 */
export function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '').trim();
}
