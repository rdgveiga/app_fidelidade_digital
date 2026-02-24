import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Store, ArrowRight } from 'lucide-react';

export const Explore = () => {
  const { token } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/client/stores', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStores(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-3xl h-64 border border-gray-100 shadow-sm"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Explorar Lojas</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <div key={store.tenant_id} className="bg-white rounded-xl shadow-sm border p-5 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  <Store className="text-gray-400 w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{store.name}</h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {store.category}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4 flex-1">
              Recompensa: <span className="text-gray-900 font-medium">{store.reward_description}</span>
            </p>

            <Link
              to={`/cliente/card/${store.slug}`}
              className="w-full py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              Ver Programa <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
