import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  CheckCircle,
  Gift,
  TrendingUp,
  Camera,
  Loader2,
  Store,
  Calendar,
  CreditCard,
  Zap,
  BarChart2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ShopDashboard = () => {
  const { token, logout, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDashboard = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/shop/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.');
          logout();
          return;
        }
        if (!res.ok) throw new Error('Erro ao carregar dados');
        return res.json();
      })
      .then(data => {
        if (data) setData(data);
      })
      .catch(err => {
        console.error(err);
        toast.error('Não foi possível carregar o dashboard');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 2MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await fetch('/api/shop/upload-logo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success('Logo atualizada com sucesso!');
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Store className="w-5 h-5 text-indigo-400" />
        </div>
      </div>
      <p className="text-sm font-bold text-gray-500 animate-pulse uppercase tracking-widest">Carregando seus dados...</p>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <Store className="w-12 h-12 mb-4 text-gray-300" />
      <p className="text-lg font-medium">Não foi possível carregar o dashboard.</p>
      <button onClick={fetchDashboard} className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg">Tentar novamente</button>
    </div>
  );

  const stats = data.stats;
  const evolution = stats.monthlyEvolution || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header com Logo e Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-3xl overflow-hidden border-2 border-white shadow-xl flex items-center justify-center">
              {data.store?.logo_url ? (
                <img src={data.store.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                  <Store className="w-10 h-10 text-indigo-300" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 p-2 bg-white shadow-xl rounded-xl border border-gray-100 cursor-pointer hover:scale-110 active:scale-95 transition-all group">
              <Camera size={16} className="text-indigo-600" />
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
            </label>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Olá, {data.store?.name || 'Lojista'}</h1>
            <p className="text-gray-500 font-medium">Aqui está o desempenho da sua fidelização hoje.</p>
          </div>
        </div>

        {data.store?.slug && (
          <div className="bg-white/50 backdrop-blur-sm border border-indigo-100 rounded-3xl p-4 flex items-center gap-4 group hover:bg-white transition-all shadow-sm">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
              <Zap size={20} />
            </div>
            <div className="min-w-0 pr-2">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Link de Divulgação</p>
              <p className="text-sm font-bold text-gray-700 truncate max-w-[200px]">
                fidelidade.app/{data.store.slug}
              </p>
            </div>
            <button
              onClick={() => {
                const link = `${window.location.origin}/cliente/card/${data.store.slug}`;
                navigator.clipboard.writeText(link);
                toast.success('Link copiado!');
              }}
              className="px-5 py-2.5 bg-gray-900 text-white text-xs font-black rounded-2xl hover:bg-indigo-600 transition-all shrink-0 active:scale-95"
            >
              COPIAR
            </button>
          </div>
        )}
      </div>

      {/* Grid de Stats (4 blocos como na imagem) */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Clientes', value: stats.totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Cartões Ativos', value: stats.activeCards, icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'de 20 permitidos' },
          { label: 'Prontos p/ Resgate', value: stats.readyToRedeem, icon: Gift, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Resgatados', value: stats.totalRedeems, icon: BarChart2, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-bold text-gray-500">{stat.label}</p>
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</h2>
              {stat.sub && <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{stat.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de Evolução Mensal */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Evolução Mensal</h3>
            <p className="text-sm font-medium text-gray-400">Cartões ativados e resgatados nos últimos 5 meses</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-full" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ativados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Resgatados</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full mt-4 flex items-end justify-between px-4">
          {evolution.map((month: any, idx: number) => {
            const maxVal = Math.max(...evolution.map((m: any) => Math.max(m.activated, m.redeemed, 1)));
            const activeHeight = (month.activated / maxVal) * 100;
            const redeemHeight = (month.redeemed / maxVal) * 100;

            return (
              <div key={idx} className="flex flex-col items-center gap-4 flex-1">
                <div className="w-full flex justify-center items-end gap-2 h-48">
                  <div
                    title={`${month.activated} ativados`}
                    className="w-12 bg-indigo-600 rounded-t-2xl transition-all duration-1000 ease-out hover:opacity-80"
                    style={{ height: `${activeHeight}%`, minHeight: month.activated > 0 ? '4px' : '0px' }}
                  />
                  <div
                    title={`${month.redeemed} resgatados`}
                    className="w-12 bg-emerald-500 rounded-t-2xl transition-all duration-1000 ease-out hover:opacity-80"
                    style={{ height: `${redeemHeight}%`, minHeight: month.redeemed > 0 ? '4px' : '0px' }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{month.name}</p>
                </div>
              </div>
            );
          })}
        </div>
        {!evolution.length && (
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-400 font-bold italic">Sem dados suficientes para gerar o gráfico</p>
          </div>
        )}
      </div>

      {/* Uso do Plano */}
      <div className="bg-gray-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">Uso do Plano</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                {user?.trialEndsAt ? 'Plano de Teste (72h)' : 'Plano Básico'}
              </p>
            </div>
            <button
              onClick={() => window.location.href = `/shop/${data.store.slug}/subscription`}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              VER PLANOS
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">Cartões Ativos</span>
                <span className="text-xs font-black text-white">{stats.activeCards} <span className="text-gray-500">/ 20</span></span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((stats.activeCards / 20) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">Campanhas</span>
                <span className="text-xs font-black text-white">1 <span className="text-gray-500">/ 1</span></span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
