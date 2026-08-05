import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';

const formatPrice = (price) => new Intl.NumberFormat('fr-MA').format(price) + ' DH';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', brand: '', category_id: '', stock: '', image: '', is_featured: false,
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProducts();
    api.getCategories().then(setCategories).catch(console.error);
  }, [search, page]);

  const loadProducts = () => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (search) params.search = search;
    api.getAdminProducts(params)
      .then(data => {
        setProducts(data.products || []);
        setPagination(data.pagination || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const openNew = () => {
    setEditProduct(null);
    setForm({ name: '', description: '', price: '', brand: '', category_id: '', stock: '', image: '', is_featured: false });
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      brand: product.brand || '',
      category_id: product.category_id || '',
      stock: product.stock,
      image: product.image || '',
      is_featured: !!product.is_featured,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await api.updateProduct(editProduct.id, { ...form, price: Number(form.price), stock: Number(form.stock), category_id: form.category_id || null });
      } else {
        await api.createProduct({ ...form, price: Number(form.price), stock: Number(form.stock), category_id: form.category_id || null });
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer le produit "${name}" ?`)) return;
    try {
      await api.deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-900">Gestion des Produits</h1>
        <div className="flex gap-2">
          <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Ajouter</button>
          <Link to="/admin" className="btn-outline text-sm px-4 py-2">← Dashboard</Link>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher par nom ou marque..."
          className="input-field"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-16"></div>)}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Produit</th>
                <th className="text-left p-4 font-medium text-gray-600">Marque</th>
                <th className="text-left p-4 font-medium text-gray-600">Prix</th>
                <th className="text-left p-4 font-medium text-gray-600">Stock</th>
                <th className="text-left p-4 font-medium text-gray-600">Vendus</th>
                <th className="p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-navy-800">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category_name || 'Sans catégorie'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{product.brand}</td>
                  <td className="p-4 font-medium">{formatPrice(product.price)}</td>
                  <td className="p-4">
                    <span className={`font-medium ${product.stock < 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{product.total_sold}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => openEdit(product)} className="text-blue-600 hover:text-blue-800 text-xs">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(product.id, product.name)} className="text-red-600 hover:text-red-800 text-xs">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
              {editProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nom *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="input-field" rows="3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Prix (DH) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} className="input-field" required min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Stock *</label>
                  <input type="number" value={form.stock} onChange={e => setForm(p => ({...p, stock: e.target.value}))} className="input-field" required min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Marque</label>
                  <input type="text" value={form.brand} onChange={e => setForm(p => ({...p, brand: e.target.value}))} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Catégorie</label>
                  <select value={form.category_id} onChange={e => setForm(p => ({...p, category_id: e.target.value}))} className="input-field">
                    <option value="">Sans catégorie</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">URL Image</label>
                <input type="url" value={form.image} onChange={e => setForm(p => ({...p, image: e.target.value}))} className="input-field" placeholder="https://..." />
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm(p => ({...p, is_featured: e.target.checked}))} />
                <span className="text-sm font-medium text-gray-700">Produit vedette</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">{editProduct ? 'Mettre à jour' : 'Créer'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
