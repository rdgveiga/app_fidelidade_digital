import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Plus,
  ChevronRight,
  Gift,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  Clock,
  CheckCircle2,
  Ticket,
  ExternalLink,
  Store,
  Check,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const ClientDashboard = () => {
  const { user, logout, token } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [filteredCards, setFilteredCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch('/api/client/cards', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCards(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    const filtered = cards.filter(card =>
      card.store_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCards(filtered);
  }, [search, cards]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-3xl h-64 border border-gray-100 shadow-sm"></div>
        ))}
      </div>
    );
  }

  const rewardsReady = cards.filter(c => c.current_stamps >= c.stamps_required).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Minha Carteira</h1>
          <p className="text-gray-500 max-w-2xl font-medium">
            Acompanhe seu progresso e resgate recompensas de suas lojas favoritas.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="card-premium flex items-center gap-4 px-6 py-4 min-w-[200px]">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recompensas Prontas</p>
              <p className="text-2xl font-bold text-gray-900">{rewardsReady}</p>
            </div>
          </div>

          <div className="card-premium flex items-center gap-4 px-6 py-4 min-w-[200px]">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Ticket size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cartões Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{cards.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar lojas..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none premium-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium premium-shadow hover:bg-gray-50 transition-colors">
            <span>Atividade Recente</span>
            <ChevronDown size={18} />
          </button>

          <Link to="/cliente/explore" className="btn-primary flex items-center gap-2 whitespace-nowrap h-[46px]">
            <Plus size={20} />
            <span>Adicionar Cartão</span>
          </Link>

          {cards.length > 0 && (
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 premium-shadow">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      {filteredCards.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredCards.map((card) => (
            <Link
              key={card.id}
              to={`/cliente/card/${card.store_slug}`}
              className={`bg-white rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-300 premium-shadow group border border-gray-100 ${viewMode === 'list' ? 'flex items-center p-4 gap-4' : ''
                }`}
            >
              {/* Logo / Image Section */}
              <div className={viewMode === 'list' ? 'shrink-0' : 'relative h-40 bg-gray-50'}>
                <div className={`${viewMode === 'list' ? 'w-16 h-16' : 'w-20 h-20 absolute -bottom-10 left-6'} rounded-2xl bg-white p-1 shadow-lg ring-4 ring-gray-50/50 overflow-hidden flex items-center justify-center`}>
                  {card.logo_url ? (
                    <img src={card.logo_url} alt={card.store_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-200">{card.store_name.charAt(0)}</span>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className={`p-6 ${viewMode === 'list' ? 'p-0 flex-grow' : 'pt-12'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {card.store_name}
                  </h3>
                  <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Check size={14} strokeWidth={3} />
                    <span>Ativo</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-1 font-medium">{card.reward_description}</p>

                {/* Expiration Info */}
                {card.expires_at && (
                  <div className={`flex items-center gap-2 mb-4 text-xs font-bold px-3 py-2 rounded-xl border ${new Date(card.expires_at).getTime() - Date.now() < 48 * 60 * 60 * 1000
                      ? 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse'
                      : 'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                    {new Date(card.expires_at).getTime() - Date.now() < 48 * 60 * 60 * 1000 ? (
                      <AlertCircle size={14} />
                    ) : (
                      <Calendar size={14} />
                    )}
                    <span>
                      Expira em {new Date(card.expires_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                {/* Progress Tracking */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Progresso</span>
                    <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded-lg">{card.current_stamps}/{card.stamps_required}</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner p-1">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-700 relative"
                      style={{ width: `${(card.current_stamps / card.stamps_required) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-dashed border-gray-300 premium-shadow">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 animate-bounce">
            <Gift size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sua carteira está vazia!</h2>
          <p className="text-gray-500 max-w-sm mb-8 font-medium">
            Que tal explorar as lojas parceiras e ganhar seu primeiro carimbo para desbloquear recompensas incríveis?
          </p>
          <Link to="/cliente/explore" className="btn-primary px-8 py-3 flex items-center gap-2">
            <Search size={20} />
            <span>Explorar Lojas Parceiras</span>
          </Link>
        </div>
      )}

      {/* Pagination Placeholder - Only show if we have many cards */}
      {filteredCards.length > 8 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button className="p-2 text-gray-400 hover:text-gray-600"><ChevronRight className="rotate-180" size={20} /></button>
          <button className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-200">1</button>
          <button className="w-10 h-10 rounded-xl bg-white text-gray-600 font-bold border hover:bg-gray-50">2</button>
          <button className="w-10 h-10 rounded-xl bg-white text-gray-600 font-bold border hover:bg-gray-50">3</button>
          <span className="px-2 text-gray-400">...</span>
          <button className="p-2 text-gray-400 hover:text-gray-600"><ChevronRight size={20} /></button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Deseja realmente sair?</h3>
            <p className="text-gray-500 mb-8">Sua sessão será encerrada e você precisará fazer login novamente para acessar seus cartões.</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-200 transition-all"
              >
                Sair do App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
