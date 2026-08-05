import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem, formatPrice } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getProduct(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-xl"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="text-5xl">😕</span>
        <h2 className="font-display text-2xl mt-4">Produit non trouvé</h2>
        <Link to="/catalog" className="btn-primary mt-6 inline-block">Retour au Catalogue</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-navy-800">Accueil</Link>
        <span className="mx-2">/</span>
        <Link to="/catalog" className="hover:text-navy-800">Catalogue</Link>
        <span className="mx-2">/</span>
        <span className="text-navy-800">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <p className="text-gold-600 font-medium uppercase text-sm">{product.brand}</p>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-navy-900 mt-2">{product.name}</h1>
          
          {product.category_name && (
            <p className="text-gray-500 mt-1">{product.category_name}</p>
          )}

          <p className="text-3xl font-bold text-navy-900 mt-6">{formatPrice(product.price)}</p>

          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

          {/* Stock info */}
          <div className="mt-6">
            {product.stock > 0 ? (
              <span className={`badge ${product.stock < 5 ? 'badge-warning' : 'badge-success'}`}>
                {product.stock < 5 ? `Plus que ${product.stock} en stock` : 'En stock'}
              </span>
            ) : (
              <span className="badge badge-danger">Rupture de stock</span>
            )}
          </div>

          {/* Add to cart */}
          {product.stock > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Quantité:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-navy-800"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-medium text-navy-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 text-gray-600 hover:text-navy-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'btn-secondary'
                }`}
              >
                {added ? '✓ Ajouté au panier' : 'Ajouter au Panier'}
              </button>

              <Link
                to="/cart"
                className="block w-full text-center btn-outline"
              >
                Voir le Panier
              </Link>
            </div>
          )}

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span>🚚</span>
              <span>Livraison partout au Maroc</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span>💳</span>
              <span>Paiement par carte ou à la livraison</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span>🛡️</span>
              <span>Garantie constructeur 2 ans</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span>↩️</span>
              <span>Retour gratuit sous 14 jours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
