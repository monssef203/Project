import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.getAdminUsers({ page, limit: 20 })
      .then(data => {
        setUsers(data.users || []);
        setPagination(data.pagination || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-900">Gestion des Clients</h1>
        <Link to="/admin" className="btn-outline text-sm px-4 py-2">← Dashboard</Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-16"></div>)}
        </div>
      ) : users.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">Aucun client inscrit</p>
        </div>
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">Client</th>
                  <th className="text-left p-4 font-medium text-gray-600">Email</th>
                  <th className="text-left p-4 font-medium text-gray-600">Téléphone</th>
                  <th className="text-left p-4 font-medium text-gray-600">Ville</th>
                  <th className="text-left p-4 font-medium text-gray-600">Commandes</th>
                  <th className="text-left p-4 font-medium text-gray-600">Inscrit le</th>
                  <th className="text-left p-4 font-medium text-gray-600">Rôle</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-navy-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-navy-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-600">{user.phone || '—'}</td>
                    <td className="p-4 text-gray-600">{user.city || '—'}</td>
                    <td className="p-4 font-medium">{user.orderCount}</td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${user.is_admin ? 'bg-gold-100 text-gold-800' : 'bg-gray-100 text-gray-700'}`}>
                        {user.is_admin ? 'Admin' : 'Client'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
