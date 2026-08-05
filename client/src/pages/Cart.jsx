import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, removeItem, updateQuantity, total, formatPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="text-6xl">🛒</span>
        <h2 className="font-display text-2xl text-navy-800 mt-6">Votre panier est vide</h2>
        <p className="text-gray-500 mt-2">Découvrez nos collections et trouvez la montre parfaite</p>
        <Link to="/catalog" className="btn-primary mt-6 inline-block">
          Explorer le Catalogue
        </Link>
      </div>
    );
  }

  const shipping = total >= 5000 ? 0 : 50;
  const grandTotal = total + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-8">Mon Panier</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product_id} className="card p-4 flex gap-4">
              <Link to={`/product/${item.product_id}`} className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <div>
                    <Link to={`/product/${item.product_id}`} className="font-semibold text-navy-800 hover:text-gold-600">
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)} / pièce</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="px-2 py-1 text-gray-600 hover:text-navy-800"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="px-2 py-1 text-gray-600 hover:text-navy-800 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-navy-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="font-semibold text-navy-800 text-lg mb-4">Résumé</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className="font-medium">{shipping === 0 ? 'Gratuite' : formatPrice(shipping)}</span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-600">✓ Livraison gratuite (plus de 5000 DH)</p>
              )}
              <hr />
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-navy-800">Total</span>
                <span className="font-bold text-navy-900">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn-secondary w-full mt-6 block text-center">
              Passer la Commande
            </Link>

            <Link to="/catalog" className="block text-center text-sm text-gray-500 hover:text-navy-800 mt-4">
              ← Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
