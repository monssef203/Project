import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';

const statusLabels = {
  pending: { label: 'En attente', color: 'badge-warning' },
  confirmed: { label: 'Confirmée', color: 'badge-success' },
  processing: { label: 'En cours', color: 'badge-info' },
  shipped: { label: 'Expédiée', color: 'badge-info' },
  delivered: { label: 'Livrée', color: 'badge-success' },
  cancelled: { label: 'Annulée', color: 'badge-danger' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders()
      .then(data => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-8">Mes Commandes</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">📦</span>
          <h3 className="font-display text-xl text-navy-800 mt-4">Aucune commande</h3>
          <p className="text-gray-500 mt-2">Vous n'avez pas encore passé de commande</p>
          <Link to="/catalog" className="btn-primary mt-6 inline-block">
            Découvrir le Catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const st = statusLabels[order.status] || { label: order.status, color: 'badge-info' };
            return (
              <div key={order.id} className="card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium text-navy-800">
                        {order.order_number}
                      </span>
                      <span className={st.color}>{st.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                    {order.items_summary && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-1">{order.items_summary}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-navy-900">
                      {new Intl.NumberFormat('fr-MA').format(order.total)} DH
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {order.payment_method === 'cod' ? 'Paiement à la livraison' : 'Carte bancaire'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
