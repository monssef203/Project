import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';

const formatPrice = (price) => new Intl.NumberFormat('fr-MA').format(price) + ' DH';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-24"></div>)}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-900">Tableau de Bord</h1>
        <div className="flex gap-2">
          <Link to="/admin/orders" className="btn-outline text-sm px-4 py-2">Commandes</Link>
          <Link to="/admin/products" className="btn-outline text-sm px-4 py-2">Produits</Link>
          <Link to="/admin/users" className="btn-outline text-sm px-4 py-2">Clients</Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-sm text-gray-500">Revenus Total</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">{formatPrice(stats.totalRevenue || 0)}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Commandes</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">{stats.totalOrders || 0}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Produits</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">{stats.totalProducts || 0}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Clients</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">{stats.totalUsers || 0}</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6 border-l-4 border-l-yellow-400">
          <p className="text-sm text-gray-500">En Attente</p>
          <p className="text-xl font-bold text-yellow-600 mt-1">{stats.pendingOrders || 0}</p>
        </div>
        <div className="card p-6 border-l-4 border-l-green-400">
          <p className="text-sm text-gray-500">Confirmées</p>
          <p className="text-xl font-bold text-green-600 mt-1">{stats.confirmedOrders || 0}</p>
        </div>
        <div className="card p-6 border-l-4 border-l-red-400">
          <p className="text-sm text-gray-500">Stock Faible</p>
          <p className="text-xl font-bold text-red-600 mt-1">{stats.lowStock || 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy-800">Commandes Récentes</h2>
            <Link to="/admin/orders" className="text-sm text-navy-600 hover:text-navy-800">Voir tout →</Link>
          </div>
          <div className="space-y-3">
            {(data?.recentOrders || []).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <Link to={`/admin/orders/${order.id}`} className="font-mono text-sm text-navy-800 hover:text-gold-600">
                    {order.order_number}
                  </Link>
                  <p className="text-xs text-gray-500">{order.user_name || order.guest_email || 'Client'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatPrice(order.total)}</p>
                  <span className={`text-xs ${order.status === 'confirmed' ? 'text-green-600' : order.status === 'pending' ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {(!data?.recentOrders || data.recentOrders.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">Aucune commande</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <h2 className="font-semibold text-navy-800 mb-4">Produits les Plus Vendus</h2>
          <div className="space-y-3">
            {(data?.topProducts || []).map((product, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gold-500">#{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-navy-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{formatPrice(product.price)}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-navy-600">{product.total_sold} vendus</span>
              </div>
            ))}
            {(!data?.topProducts || data.topProducts.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">Aucune vente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
