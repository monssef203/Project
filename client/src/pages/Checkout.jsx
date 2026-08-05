import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, formatPrice, clearCart } = useCart();
  const { user } = useAuth();

  const shipping = total >= 5000 ? 0 : 50;
  const grandTotal = total + shipping;

  const [form, setForm] = useState({
    shipping_address: user?.address || '',
    shipping_city: user?.city || '',
    shipping_phone: user?.phone || '',
    guest_email: '',
    notes: '',
    payment_method: 'cod',
  });

  const [cardInfo, setCardInfo] = useState({
    card_number: '',
    expiry: '',
    cvv: '',
    card_name: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCardChange = (e) => {
    setCardInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!form.shipping_address || !form.shipping_city || !form.shipping_phone) {
        throw new Error('Veuillez remplir tous les champs de livraison');
      }

      if (!user && !form.guest_email) {
        throw new Error('Email requis pour les commandes invités');
      }

      if (form.payment_method === 'card') {
        if (!cardInfo.card_number || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.card_name) {
          throw new Error('Veuillez remplir les informations de carte');
        }
        // Basic card number validation
        const cardNum = cardInfo.card_number.replace(/\s/g, '');
        if (cardNum.length < 13 || cardNum.length > 19) {
          throw new Error('Numéro de carte invalide');
        }
        if (!/^\d{2}\/\d{2}$/.test(cardInfo.expiry)) {
          throw new Error('Date d\'expiration invalide (format MM/AA)');
        }
        if (!/^\d{3,4}$/.test(cardInfo.cvv)) {
          throw new Error('CVV invalide');
        }
      }

      const orderData = {
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        ...form,
        card_info: form.payment_method === 'card' ? cardInfo : undefined,
      };

      const result = await api.createOrder(orderData);

      if (result.payment_status === 'failed') {
        throw new Error('Paiement échoué. Veuillez réessayer ou choisir le paiement à la livraison.');
      }

      clearCart();
      navigate('/order-success', { state: { order: result.order } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="text-5xl">🛒</span>
        <h2 className="font-display text-2xl mt-4">Panier vide</h2>
        <p className="text-gray-500 mt-2">Ajoutez des articles avant de commander</p>
        <Link to="/catalog" className="btn-primary mt-6 inline-block">Voir le Catalogue</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-8">Passer la Commande</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact info */}
            {!user && (
              <div className="card p-6">
                <h2 className="font-semibold text-navy-800 text-lg mb-4">Contact</h2>
                <input
                  type="email"
                  name="guest_email"
                  value={form.guest_email}
                  onChange={handleChange}
                  placeholder="Votre email"
                  className="input-field"
                  required
                />
              </div>
            )}

            {/* Shipping info */}
            <div className="card p-6">
              <h2 className="font-semibold text-navy-800 text-lg mb-4">Adresse de Livraison</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="shipping_address"
                    value={form.shipping_address}
                    onChange={handleChange}
                    placeholder="Adresse complète"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="shipping_city"
                    value={form.shipping_city}
                    onChange={handleChange}
                    placeholder="Ville"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="shipping_phone"
                    value={form.shipping_phone}
                    onChange={handleChange}
                    placeholder="Téléphone (06XXXXXXXX)"
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Notes (optionnel)"
                  className="input-field"
                  rows="2"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="font-semibold text-navy-800 text-lg mb-4">Mode de Paiement</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-navy-300 transition-colors">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={form.payment_method === 'cod'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-navy-800">💵 Paiement à la Livraison</span>
                    <p className="text-sm text-gray-500">Payez en espèces à la réception de votre commande</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-navy-300 transition-colors">
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={form.payment_method === 'card'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-navy-800">💳 Carte Bancaire</span>
                    <p className="text-sm text-gray-500">Paiement sécurisé par carte Visa/Mastercard</p>
                  </div>
                </label>
              </div>

              {/* Card form */}
              {form.payment_method === 'card' && (
                <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nom sur la carte</label>
                    <input
                      type="text"
                      name="card_name"
                      value={cardInfo.card_name}
                      onChange={handleCardChange}
                      placeholder="NOM PRÉNOM"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Numéro de carte</label>
                    <input
                      type="text"
                      name="card_number"
                      value={cardInfo.card_number}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                        const formatted = v.replace(/(.{4})/g, '$1 ').trim();
                        setCardInfo(p => ({ ...p, card_number: formatted }));
                      }}
                      placeholder="1234 5678 9012 3456"
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Date d'expiration</label>
                      <input
                        type="text"
                        name="expiry"
                        value={cardInfo.expiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                          setCardInfo(p => ({ ...p, expiry: v }));
                        }}
                        placeholder="MM/AA"
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardInfo.cvv}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setCardInfo(p => ({ ...p, cvv: v }));
                        }}
                        placeholder="123"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>🔒</span>
                    <span>Vos informations de paiement sont sécurisées et chiffrées</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h2 className="font-semibold text-navy-800 text-lg mb-4">Votre Commande</h2>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.product_id} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy-800 line-clamp-1">{item.name}</p>
                      <p className="text-gray-500">x{item.quantity}</p>
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span>{shipping === 0 ? 'Gratuite' : formatPrice(shipping)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold text-navy-900">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-secondary w-full mt-6 text-lg py-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Traitement...
                  </span>
                ) : (
                  `Confirmer la Commande • ${formatPrice(grandTotal)}`
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                En confirmant, vous acceptez nos conditions générales de vente
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
