import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QrCode, Gift, Check, Clock, Phone, Lock, Eye, EyeOff, Star, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PublicStoreInfo {
  store_name: string;
  logo_url: string | null;
  reward_description: string;
  stamps_required: number;
  reward_image_url: string | null;
  expires_at: string | null;
  rules_config: {
    cooldown_hours: number;
    custom_rules_text: string | null;
  } | null;
}

interface CardData extends PublicStoreInfo {
  current_stamps: number;
  transactions: Array<{ id: string; type: string; created_at: string }>;
}

// ─── Login Panel (embedded, no navigation away) ───────────────────────────-──

const LoginPanel = ({
  store,
  slug,
  onSuccess,
}: {
  store: PublicStoreInfo;
  slug: string;
  onSuccess: () => void;
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ whatsapp: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.token, data.user);
      if (data.user.mustChangePassword) {
        toast.success('Por segurança, altere sua senha.');
        navigate('/cliente/alterar-senha');
      } else {
        toast.success(`Bem-vindo, ${data.user.name}!`);
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao entrar. Verifique seus dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50 px-4 py-10">
      {/* Store identity */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-24 h-24 rounded-3xl bg-white shadow-lg shadow-blue-100 border border-gray-100 flex items-center justify-center mb-4 overflow-hidden">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.store_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-black text-blue-600">{store.store_name?.charAt(0)}</span>
          )}
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{store.store_name}</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium max-w-[240px]">{store.reward_description}</p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-blue-100/60 border border-gray-100 p-8">
        <h2 className="text-xl font-black text-gray-900 mb-1">Acesse sua conta</h2>
        <p className="text-sm text-gray-400 mb-6">Use seu WhatsApp e senha para entrar</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-bold text-gray-700 mb-1.5">
              WhatsApp
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Phone size={18} />
              </div>
              <input
                id="whatsapp"
                type="tel"
                required
                placeholder="(00) 00000-0000"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1.5">
              Senha
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-11 pr-11 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 text-white rounded-xl font-black text-base shadow-lg shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Entrar <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-gray-400">
          Não tem conta? Peça ao atendente da loja.
        </p>
      </div>

      {/* Trust badge */}
      <div className="mt-6 flex items-center gap-1.5 text-xs text-gray-400">
        <Star size={13} className="text-yellow-400 fill-yellow-400" />
        Programa de fidelidade seguro e digital
      </div>
    </div>
  );
};

// ─── Authenticated Card View ──────────────────────────────────────────────────

const CardView = ({ card }: { card: CardData }) => {
  const { token } = useAuth();
  const [generatedCode, setGeneratedCode] = useState<{ code: string; type: string; expiresAt: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!generatedCode) return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(generatedCode.expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff === 0) setGeneratedCode(null);
    }, 1000);
    return () => clearInterval(interval);
  }, [generatedCode]);

  const generateCode = async (type: 'STAMP' | 'REDEEM') => {
    try {
      const res = await fetch('/api/client/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      setGeneratedCode(data);
    } catch (err) {
      toast.error('Erro ao gerar código.');
    }
  };

  const isComplete = card.current_stamps >= card.stamps_required;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-sm space-y-4">
        {/* Store header card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 text-center border-b border-gray-50">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 mx-auto mb-4 overflow-hidden shadow-sm flex items-center justify-center">
              {card.logo_url ? (
                <img src={card.logo_url} alt={card.store_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-gray-400">{card.store_name?.charAt(0)}</span>
              )}
            </div>
            <h1 className="text-xl font-black text-gray-900">{card.store_name}</h1>
            <p className="text-sm text-gray-500 mt-1">{card.reward_description}</p>
          </div>

          {/* Stamps progress */}
          <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-black text-gray-800">Seu Progresso</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {card.current_stamps} / {card.stamps_required}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {Array.from({ length: card.stamps_required }).map((_, i) => {
                const filled = i < card.current_stamps;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all ${filled
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-white border-2 border-dashed border-gray-200 text-gray-300'
                      }`}
                  >
                    {filled ? <Check size={18} /> : i + 1}
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            {generatedCode ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-blue-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  {generatedCode.type === 'STAMP' ? 'Mostre ao atendente para ganhar um carimbo' : 'Mostre ao atendente para resgatar'}
                </p>
                <div className="text-5xl font-mono font-black text-gray-900 tracking-widest my-4">
                  {generatedCode.code}
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 py-2.5 rounded-xl">
                  <Clock size={14} />
                  Expira em {timeLeft > 0 ? `${timeLeft}s` : 'expirando...'}
                </div>
              </div>
            ) : (
              <div className="grid gap-2.5">
                <button
                  onClick={() => generateCode('STAMP')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                >
                  <QrCode size={18} />
                  Gerar Código de Carimbo
                </button>
                {isComplete && (
                  <button
                    onClick={() => generateCode('REDEEM')}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black shadow-md shadow-green-200 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 animate-pulse"
                  >
                    <Gift size={18} />
                    Resgatar Recompensa 🎉
                  </button>
                )}
              </div>
            )}

            {/* Expiration & Rules Banners */}
            <div className="flex flex-col gap-2 mt-4">
              {card.expires_at && (
                <div className={`p-3 rounded-xl flex items-center justify-center gap-2 border ${new Date(card.expires_at).getTime() - Date.now() < 48 * 60 * 60 * 1000
                  ? 'bg-orange-50 text-orange-600 border-orange-100'
                  : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                  {new Date(card.expires_at).getTime() - Date.now() < 48 * 60 * 60 * 1000 ? (
                    <AlertCircle size={14} className="animate-pulse" />
                  ) : (
                    <Calendar size={14} />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Expira em {new Date(card.expires_at).toLocaleDateString('pt-BR')} às {new Date(card.expires_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {card.rules_config?.cooldown_hours ? (
                <div className="p-3 bg-slate-50 text-slate-500 border border-slate-100 rounded-xl flex items-center justify-center gap-2">
                  <Clock size={14} />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Intervalo de {card.rules_config.cooldown_hours}h entre carimbos
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Reward Image Card */}
        {card.reward_image_url && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="aspect-video w-full overflow-hidden relative">
              <img
                src={card.reward_image_url}
                alt="Sua Recompensa"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <div>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-0.5">Sua Próxima Conquista</p>
                  <p className="text-white font-black text-sm">{card.reward_description}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction history */}
        {card.transactions && card.transactions.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-black text-gray-800 mb-4">Histórico</h3>
            <div className="space-y-3">
              {card.transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'STAMP' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {tx.type === 'STAMP' ? <Check size={15} /> : <Gift size={15} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{tx.type === 'STAMP' ? 'Carimbo Recebido' : 'Recompensa Resgatada'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString('pt-BR')} às {new Date(tx.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          <Link to="/cliente" className="hover:text-blue-600 transition-colors">Ver todos os meus cartões</Link>
        </p>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export const CardDetail = () => {
  const { token } = useAuth();
  const { slug } = useParams();
  const [publicInfo, setPublicInfo] = useState<PublicStoreInfo | null>(null);
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Always fetch public store info (name, logo, reward) for the login screen
  useEffect(() => {
    fetch(`/api/client/public/card/${slug}`)
      .then(res => res.json())
      .then(data => setPublicInfo(data))
      .catch(console.error);
  }, [slug]);

  // Fetch full card data when authenticated
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/client/cards/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setCard(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug, token, refreshKey]);

  // Loading skeleton
  if (loading && token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-full max-w-sm px-4 animate-pulse space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-200 mx-auto mb-4" />
            <div className="h-5 w-40 bg-gray-200 rounded-lg mx-auto mb-2" />
            <div className="h-3 w-56 bg-gray-100 rounded mx-auto" />
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 p-6">
            <div className="grid grid-cols-5 gap-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated: show login screen
  if (!token) {
    if (!publicInfo) return null;
    return (
      <LoginPanel
        store={publicInfo}
        slug={slug!}
        onSuccess={() => setRefreshKey(k => k + 1)}
      />
    );
  }

  // Authenticated but card not found
  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={28} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Cartão não encontrado</h2>
          <p className="text-sm text-gray-500 mb-6">Não localizamos este cartão de fidelidade.</p>
          <Link to="/cliente" className="text-blue-600 font-semibold text-sm hover:underline">
            Ver meus cartões
          </Link>
        </div>
      </div>
    );
  }

  return <CardView card={card} />;
};
