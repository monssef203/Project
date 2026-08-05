const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('watchstore_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('watchstore_token', token);
    } else {
      localStorage.removeItem('watchstore_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('watchstore_token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur serveur');
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  getProfile() {
    return this.request('/auth/me');
  }

  // Products
  getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products?${query}`);
  }

  getProduct(id) {
    return this.request(`/products/${id}`);
  }

  getBrands() {
    return this.request('/products/brands');
  }

  getCategories() {
    return this.request('/products/categories');
  }

  // Orders
  createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: orderData,
    });
  }

  getOrders() {
    return this.request('/orders');
  }

  getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  // Admin
  getDashboard() {
    return this.request('/admin/dashboard');
  }

  getAdminOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/orders?${query}`);
  }

  getAdminOrder(id) {
    return this.request(`/admin/orders/${id}`);
  }

  updateOrderStatus(id, status) {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  updatePaymentStatus(id, payment_status) {
    return this.request(`/admin/orders/${id}/payment`, {
      method: 'PUT',
      body: { payment_status },
    });
  }

  getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${query}`);
  }

  getAdminProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/products?${query}`);
  }

  createProduct(product) {
    return this.request('/products', {
      method: 'POST',
      body: product,
    });
  }

  updateProduct(id, product) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: product,
    });
  }

  deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
export default api;
