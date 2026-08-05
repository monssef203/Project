import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api.js';
import { useCart } from '../context/CartContext.jsx';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem, formatPrice } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('min_price') || '',
    max: searchParams.get('max_price') || '',
  });
  const [sort, setSort] = useState(searchParams.get('sort') || 'created_at');
  const [order, setOrder] = useState(searchParams.get('order') || 'DESC');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getBrands(),
    ]).then(([cats, brs]) => {
      setCategories(cats || []);
      setBrands(brs || []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedBrand) params.brand = selectedBrand;
    if (priceRange.min) params.min_price = priceRange.min;
    if (priceRange.max) params.max_price = priceRange.max;
    params.sort = sort;
    params.order = order;
    params.page = page;
    params.limit = 12;
    if (searchParams.get('featured') === '1') params.featured = '1';

    api.getProducts(params)
      .then(data => {
        setProducts(data.products || []);
        setPagination(data.pagination || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, selectedCategory, selectedBrand, priceRange, sort, order, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: '', max: '' });
    setSort('created_at');
    setOrder('DESC');
    setPage(1);
  };

  const activeFilters = [selectedCategory, selectedBrand, priceRange.min, priceRange.max, search].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-900">Catalogue</h1>
        <p className="text-gray-600 mt-2">
          {pagination.total || 0} montre{pagination.total > 1 ? 's' : ''} disponible{pagination.total > 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="card p-6 sticky top-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-navy-800">Filtres</h2>
              {activeFilters > 0 && (
                <button onClick={resetFilters} className="text-sm text-red-500 hover:text-red-700">
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Rechercher..."
                  className="input-field pl-10"
                />
                <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Catégorie</h3>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategory(''); setPage(1); }}
                  className={`block w-full text-left px-3 py-2 rounded text-sm ${!selectedCategory ? 'bg-navy-50 text-navy-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Toutes
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(String(cat.id)); setPage(1); }}
                    className={`block w-full text-left px-3 py-2 rounded text-sm ${selectedCategory === String(cat.id) ? 'bg-navy-50 text-navy-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {cat.name} ({cat.product_count})
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Marque</h3>
              <select
                value={selectedBrand}
                onChange={e => { setSelectedBrand(e.target.value); setPage(1); }}
                className="input-field text-sm"
              >
                <option value="">Toutes les marques</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Prix (DH)</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={e => { setPriceRange(p => ({...p, min: e.target.value})); setPage(1); }}
                  placeholder="Min"
                  className="input-field text-sm"
                />
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={e => { setPriceRange(p => ({...p, max: e.target.value})); setPage(1); }}
                  placeholder="Max"
                  className="input-field text-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Trier par</h3>
              <select
                value={`${sort}-${order}`}
                onChange={e => {
                  const [s, o] = e.target.value.split('-');
                  setSort(s);
                  setOrder(o);
                }}
                className="input-field text-sm"
              >
                <option value="created_at-DESC">Plus récents</option>
                <option value="created_at-ASC">Plus anciens</option>
                <option value="price-ASC">Prix croissant</option>
                <option value="price-DESC">Prix décroissant</option>
                <option value="name-ASC">Nom A-Z</option>
                <option value="name-DESC">Nom Z-A</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl">😕</span>
              <h3 className="font-display text-xl text-navy-800 mt-4">Aucun résultat</h3>
              <p className="text-gray-500 mt-2">Essayez de modifier vos filtres</p>
              <button onClick={resetFilters} className="btn-primary mt-4 text-sm">
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="card group hover:shadow-lg transition-all duration-300">
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="aspect-square bg-gray-100 overflow-hidden relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {product.stock < 5 && product.stock > 0 && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            Plus que {product.stock}
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                            Rupture
                          </span>
                        )}
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
                          onClick={() => addItem(product)}
                          disabled={product.stock === 0}
                          className="p-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors disabled:bg-gray-300"
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 rounded border border-gray-200 text-sm disabled:opacity-50"
                  >
                    ← Préc
                  </button>
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-3 py-2 rounded text-sm ${page === i + 1 ? 'bg-navy-800 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
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
      </div>
    </div>
  );
}
