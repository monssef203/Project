import { Link, useLocation } from 'react-router-dom';

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="card p-8">
        <span className="text-6xl">✅</span>
        <h1 className="font-display text-3xl font-bold text-navy-900 mt-6">
          Commande Confirmée !
        </h1>
        <p className="text-gray-600 mt-4">
          Merci pour votre commande. Vous recevrez un email de confirmation.
        </p>

        {order && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">N° Commande</span>
                <span className="font-mono font-medium text-navy-800">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut</span>
                <span className="badge badge-info capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paiement</span>
                <span className="capitalize">{order.payment_method === 'cod' ? 'À la livraison' : 'Carte bancaire'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-navy-900">
                  {new Intl.NumberFormat('fr-MA').format(order.total)} DH
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/catalog" className="btn-primary">
            Continuer mes Achats
          </Link>
          <Link to="/my-orders" className="btn-outline">
            Mes Commandes
          </Link>
        </div>
      </div>
    </div>
  );
}
