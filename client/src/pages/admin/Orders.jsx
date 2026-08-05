import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';

const statusLabels = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmée', color: 'bg-green-100 text-green-800' },
  processing: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Expédiée', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'Livrée', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

const formatPrice = (price) => new Intl.NumberFormat('fr-MA').format(price) + ' DH';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (filter) params.status = filter;
    if (search) params.search = search;

    api.getAdminOrders(params)
      .then(data => {
        setOrders(data.orders || []);
        setPagination(data.pagination || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter, search, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-900">Gestion des Commandes</h1>
        <Link to="/admin" className="btn-outline text-sm px-4 py-2">← Retour Dashboard</Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher par n° commande, client..."
          className="input-field flex-1 min-w-[200px]"
        />
        <select
          value={filter}
          onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="input-field w-auto"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmée</option>
          <option value="processing">En cours</option>
          <option value="shipped">Expédiée</option>
          <option value="delivered">Livrée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-16"></div>)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">Aucune commande trouvée</p>
        </div>
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">N° Commande</th>
                  <th className="text-left p-4 font-medium text-gray-600">Client</th>
                  <th className="text-left p-4 font-medium text-gray-600">Articles</th>
                  <th className="text-left p-4 font-medium text-gray-600">Total</th>
                  <th className="text-left p-4 font-medium text-gray-600">Paiement</th>
                  <th className="text-left p-4 font-medium text-gray-600">Statut</th>
                  <th className="text-left p-4 font-medium text-gray-600">Date</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const st = statusLabels[order.status] || { label: order.status, color: '' };
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-4">
                        <Link to={`/admin/orders/${order.id}`} className="font-mono text-navy-800 hover:text-gold-600">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="p-4 text-gray-700">{order.user_name || order.guest_email || 'Guest'}</td>
                      <td className="p-4 text-gray-600 max-w-[200px] truncate">{order.items_summary}</td>
                      <td className="p-4 font-medium">{formatPrice(order.total)}</td>
                      <td className="p-4">
                        <span className="text-xs capitalize">
                          {order.payment_method === 'cod' ? '💵 COD' : '💳 Carte'}
                        </span>
                        <br />
                        <span className={`text-xs ${order.payment_status === 'paid' ? 'text-green-600' : order.payment_status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {order.payment_status === 'paid' ? '✓ Payé' : order.payment_status === 'failed' ? '✗ Échoué' : '⏳ En attente'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <Link to={`/admin/orders/${order.id}`} className="text-navy-600 hover:text-navy-800">
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded border border-gray-200 text-sm disabled:opacity-50"
              >
                ← Préc
              </button>
              <span className="px-3 py-2 text-sm text-gray-600">
                Page {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-2 rounded border border-gray-200 text-sm disabled:opacity-50"
              >
                Suiv →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
