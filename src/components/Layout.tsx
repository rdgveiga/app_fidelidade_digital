import React from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Settings,
  Home,
  LogOut,
  Menu,
  X,
  Ticket,
  LayoutDashboard,
  UserCircle,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Store,
  Bell,
  QrCode,
  Search,
  Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TrialExpirationModal } from './TrialExpirationModal';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [totalStamps, setTotalStamps] = React.useState(0);

  // Fetch client stamp count for membership tier
  React.useEffect(() => {
    if (user?.role !== 'CLIENT') return;
    const stored = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return;
    fetch('/api/client/cards', { headers: { Authorization: `Bearer ${storedToken}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTotalStamps(data.reduce((acc: number, c: any) => acc + (c.current_stamps || 0), 0));
        }
      })
      .catch(() => { });
  }, [user]);

  const memberTier = totalStamps >= 50 ? 'Membro Ouro' : totalStamps >= 20 ? 'Membro Prata' : 'Membro Bronze';

  const isClientRoute = location.pathname.startsWith('/cliente');
  const isAdminOrShopRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/shop');

  // Trial check
  const isTrialExpired = React.useMemo(() => {
    if (user?.role === 'SHOPKEEPER' && user?.trialEndsAt) {
      return new Date() > new Date(user.trialEndsAt);
    }
    return false;
  }, [user]);

  if (!user) return <>{children}</>;

  const isActive = (path: string) => location.pathname === path;

  // Client Navbar Link Component
  const ClientLink = ({ to, label }: { to: string; label: string }) => (
    <Link
      to={to}
      className={`px-1 py-2 text-sm font-medium transition-colors border-b-2 ${isActive(to)
        ? 'text-blue-600 border-blue-600'
        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
        }`}
    >
      {label}
    </Link>
  );

  // Sidebar Nav Item (for Admin/Shopkeeper)
  const SidebarItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(to)
        ? 'bg-blue-50 text-blue-600 font-medium'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );

  // Case 1: CLIENT environment (Header Layout) 
  // Should be used if the user is a client OR if we are in a client route
  if (user.role === 'CLIENT' || isClientRoute) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans">
        <header className="bg-white border-b sticky top-0 z-30 premium-shadow">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/cliente" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Store className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">LoyaltyLoop</span>
            </Link>

            {user.role === 'CLIENT' && (
              <nav className="hidden md:flex items-center gap-8 ml-8">
                <ClientLink to="/cliente" label="Meus Cartões" />
                <ClientLink to="/cliente/explore" label="Explorar Lojas" />
                <ClientLink to="/cliente/rewards" label="Recompensas" />
              </nav>
            )}

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

              <div className="flex items-center gap-3 pl-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{memberTier}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center text-orange-600 font-bold">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-sans">Deseja realmente sair?</h3>
              <p className="text-gray-500 mb-8 font-sans">Sua sessão será encerrada e você precisará fazer login novamente para acessar seus cartões.</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all font-sans"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowLogoutConfirm(false);
                  }}
                  className="py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-200 transition-all font-sans"
                >
                  Sair do App
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Footer / Branding */}
        <footer className="max-w-7xl mx-auto px-4 py-8 mt-auto">
          <p className="text-center text-gray-400 text-sm font-medium">
            © {new Date().getFullYear()} Fidelidade Digital. Todos os direitos reservados.
          </p>
        </footer>

        {isTrialExpired && (
          <TrialExpirationModal onSelectPlan={() => navigate(`/shop/${user.store?.slug || 'dashboard'}/subscription`)} />
        )}
      </div>
    );
  }

  // Case 2: ADMIN and SHOPKEEPER - Sidebar Layout
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="font-bold text-xl text-blue-600">LoyaltyLoop</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b hidden md:block">
            <div className="font-bold text-2xl text-blue-600 flex items-center gap-2">
              <Store size={24} />
              LoyaltyLoop
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {user.role === 'SHOPKEEPER' && user.store && (
              <>
                <SidebarItem to={`/shop/${user.store.slug}/dashboard`} icon={LayoutDashboard} label="Dashboard" />
                <SidebarItem to={`/shop/${user.store.slug}/counter`} icon={QrCode} label="Balcão" />
                <SidebarItem to={`/shop/${user.store.slug}/customers`} icon={Users} label="Clientes" />
                <SidebarItem to={`/shop/${user.store.slug}/campaign`} icon={Settings} label="Campanha" />
                <SidebarItem to={`/shop/${user.store.slug}/resources`} icon={Gift} label="Bônus" />
              </>
            )}

            {user.role === 'ADMIN' && (
              <SidebarItem to="/admin/dashboard" icon={LayoutDashboard} label="Admin Dashboard" />
            )}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate uppercase">{user.role}</p>
              </div>
            </div>
            {user.role === 'SHOPKEEPER' && user.store && (
              <div className="mt-8 pt-4 border-t px-2">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100 shadow-sm overflow-hidden relative group">
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-500/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                        <Gift size={12} />
                      </div>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Seu Plano</span>
                    </div>
                    {user.trialEndsAt && new Date(user.trialEndsAt) > new Date() ? (
                      <div>
                        <p className="text-xs font-bold text-gray-900 mb-1">Período de Teste</p>
                        <p className="text-[10px] text-gray-500 mb-3">Expira em {new Date(user.trialEndsAt).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-gray-900 mb-1">Plano Ativo</p>
                        <p className="text-[10px] text-gray-500 mb-3">Gerencie sua assinatura</p>
                      </div>
                    )}
                    <Link
                      to={`/shop/${user.store.slug}/subscription`}
                      className="block w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl transition-all shadow-md shadow-indigo-100"
                    >
                      FAZER UPGRADE
                    </Link>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sub-header for Shopkeeper with Store info (matches image) */}
        {user.role === 'SHOPKEEPER' && (
          <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <Store className="text-blue-600 w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 leading-tight">{user.store?.name || 'Minha Loja'}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <LogOut size={16} />
                <span>Sair</span>
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
};
