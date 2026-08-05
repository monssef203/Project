import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api.js';

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusLabels = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En cours de préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};
const statusColors = {
  pending: 'border-yellow-400 bg-yellow-50',
  confirmed: 'border-green-400 bg-green-50',
  processing: 'border-blue-400 bg-blue-50',
  shipped: 'border-indigo-400 bg-indigo-50',
  delivered: 'border-emerald-400 bg-emerald-50',
  cancelled: 'border-red-400 bg-red-50',
};

const formatPrice = (price) => new Intl.NumberFormat('fr-MA').format(price) + ' DH';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminOrder(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      await api.updateOrderStatus(id, status);
      await loadOrder();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentChange = async (payment_status) => {
    setUpdating(true);
    try {
      await api.updatePaymentStatus(id, payment_status);
      await loadOrder();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="card h-32"></div>
          <div className="card h-64"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-gray-500">Commande non trouvée</p>
        <Link to="/admin/orders" className="btn-primary mt-4 inline-block">Retour aux commandes</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/admin/orders" className="text-sm text-gray-500 hover:text-navy-800">← Commandes</Link>
          <h1 className="font-display text-2xl font-bold text-navy-900 mt-1">Commande {order.order_number}</h1>
        </div>
        <Link to="/admin" className="btn-outline text-sm px-4 py-2">Dashboard</Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="card p-6">
            <h2 className="font-semibold text-navy-800 mb-4">Informations Client</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Nom</p>
                <p className="font-medium">{order.user_name || 'Client Guest'}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium">{order.user_email || order.guest_email}</p>
              </div>
              <div>
                <p className="text-gray-500">Téléphone</p>
                <p className="font-medium">{order.shipping_phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Adresse</p>
                <p className="font-medium">{order.shipping_address}, {order.shipping_city}</p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <p className="text-gray-500">Notes</p>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="card p-6">
            <h2 className="font-semibold text-navy-800 mb-4">Articles ({order.items?.length || 0})</h2>
            <div className="space-y-3">
              {(order.items || []).map(item => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-navy-800">{item.product_name}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.product_price)} × {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatPrice(item.product_price * item.quantity)}</p>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-navy-800">Total</span>
                <span className="text-xl font-bold text-navy-900">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="card p-6">
            <h2 className="font-semibold text-navy-800 mb-4">Statut de la Commande</h2>
            <div className={`p-4 rounded-lg border-l-4 mb-4 ${statusColors[order.status]}`}>
              <p className="font-medium">{statusLabels[order.status]}</p>
              <p className="text-xs text-gray-500 mt-1">
                Créée le {new Date(order.created_at).toLocaleString('fr-FR')}
              </p>
            </div>
            <div className="space-y-2">
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={updating || order.status === status}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    order.status === status
                      ? 'bg-navy-800 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  } disabled:opacity-60`}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div className="card p-6">
            <h2 className="font-semibold text-navy-800 mb-4">Statut Paiement</h2>
            <div className="flex items-center space-x-2 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.payment_status === 'paid' ? '✓ Payé' : order.payment_status === 'failed' ? '✗ Échoué' : '⏳ En attente'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Méthode: {order.payment_method === 'cod' ? 'Paiement à la livraison' : 'Carte bancaire'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePaymentChange('paid')}
                disabled={updating}
                className="flex-1 text-center px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
              >
                Marquer Payé
              </button>
              <button
                onClick={() => handlePaymentChange('pending')}
                disabled={updating}
                className="flex-1 text-center px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
              >
                En Attente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
