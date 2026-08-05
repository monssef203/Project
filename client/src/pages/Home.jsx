import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useCart } from '../context/CartContext.jsx';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem, formatPrice } = useCart();

  useEffect(() => {
    Promise.all([
      api.getProducts({ featured: '1', limit: 8 }),
      api.getCategories(),
    ]).then(([products, cats]) => {
      setFeatured(products.products || []);
      setCategories(cats || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product) => {
    addItem(product);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(212,160,40,0.1) 0%, transparent 50%)'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                L'Élégance au
                <span className="text-gold-400"> Poignet</span>
              </h1>
              <p className="text-lg text-navy-200 mb-8 max-w-lg">
                Découvrez notre collection exclusive de montres de luxe. 
                Des pièces d'exception livrées partout au Maroc.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/catalog" className="btn-secondary text-lg px-8 py-4">
                  Explorer le Catalogue
                </Link>
                <Link to="/catalog?featured=1" className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-navy-900">
                  Montres Vedettes
                </Link>
              </div>
              <div className="mt-10 flex items-center space-x-8 text-sm text-navy-300">
                <div className="flex items-center space-x-2">
                  <span className="text-gold-400">✓</span>
                  <span>Livraison Maroc</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gold-400">✓</span>
                  <span>Paiement Sécurisé</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gold-400">✓</span>
                  <span>Garantie 2 ans</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-96 h-96 mx-auto rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/10 flex items-center justify-center">
                  <span className="text-[180px]">⌚</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-navy-900 mb-4">Nos Collections</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Trouvez la montre parfaite pour chaque occasion</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.id}`}
                className="group card p-6 text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">⌚</div>
                <h3 className="font-semibold text-navy-800 group-hover:text-gold-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{cat.product_count} produits</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="font-display text-3xl font-bold text-navy-900 mb-2">Montres Vedettes</h2>
              <p className="text-gray-600">Notre sélection des meilleures pièces</p>
            </div>
            <Link to="/catalog" className="hidden md:inline-flex btn-outline text-sm">
              Voir Tout →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map(product => (
                <div key={product.id} className="card group hover:shadow-lg transition-all duration-300">
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <p className="text-xs text-gold-600 font-medium uppercase">{product.brand}</p>
                      <h3 className="font-semibold text-navy-800 mt-1 line-clamp-1">{product.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-navy-900">{formatPrice(product.price)}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors"
                        title="Ajouter au panier"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link to="/catalog" className="btn-outline">Voir Tout le Catalogue →</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-semibold text-navy-800 text-lg mb-2">Livraison Rapide</h3>
              <p className="text-gray-600 text-sm">Livraison partout au Maroc en 24-72h. Gratuite à partir de 5000 DH.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="font-semibold text-navy-800 text-lg mb-2">Paiement Sécurisé</h3>
              <p className="text-gray-600 text-sm">Payez par carte bancaire ou à la livraison. Transactions 100% sécurisées.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="font-semibold text-navy-800 text-lg mb-2">Garantie 2 Ans</h3>
              <p className="text-gray-600 text-sm">Toutes nos montres sont garanties 2 ans. Service après-vente inclus.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
