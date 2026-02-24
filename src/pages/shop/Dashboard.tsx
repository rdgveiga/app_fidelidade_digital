import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, CheckCircle, Gift, TrendingUp, Camera, Loader2, Store, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ShopDashboard = () => {
  const { token, logout } = useAuth();
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

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;
  if (!data) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <Store className="w-12 h-12 mb-4 text-gray-300" />
      <p className="text-lg font-medium">Não foi possível carregar o dashboard.</p>
      <button onClick={fetchDashboard} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">Tentar novamente</button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
              {data.store?.logo_url ? (
                <img src={data.store.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-gray-400" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-1.5 bg-white shadow-md rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors group">
              <Camera size={14} className="text-gray-600" />
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
            </label>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">Olá, {data.store?.name || 'Lojista'}</h1>
            <p className="text-gray-500 truncate">Aqui está o resumo do seu programa de fidelidade.</p>
          </div>
        </div>
        {data.store?.slug && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4 max-w-full lg:max-w-md">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Seu Link de Divulgação</p>
              <p className="text-sm font-mono font-bold text-indigo-700 truncate">
                {window.location.origin}/cliente/card/{data.store.slug}
              </p>
            </div>
            <button
              onClick={() => {
                const link = `${window.location.origin}/cliente/card/${data.store.slug}`;
                navigator.clipboard.writeText(link);
                toast.success('Link copiado!');
              }}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors flex-shrink-0 shadow-lg shadow-indigo-100"
            >
              Copiar Link
            </button>
          </div>
        )}
      </div>

      {/* Banner de Bônus */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white/20 rounded-2xl">
            <Gift size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Resgate seus Bônus Exclusivos 🎁</h2>
            <p className="text-blue-100 italic">Guia WhatsApp (5 Scripts), Estratégias de Lucro e Consultoria.</p>
          </div>
        </div>
        <button
          onClick={() => {
            const slug = data.store?.slug || 'dashboard';
            window.location.href = `/shop/${slug}/resources`;
          }}
          className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
        >
          Acessar bônus agora
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={24} />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <TrendingUp size={16} /> Ativos
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{data.stats.activeCards}</h3>
          <p className="text-sm text-gray-500">Cartões Ativos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{data.stats.totalStamps}</h3>
          <p className="text-sm text-gray-500">Carimbos Emitidos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Gift size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{data.stats.totalRedeems}</h3>
          <p className="text-sm text-gray-500">Recompensas Resgatadas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-bold text-gray-900 mb-4">Configuração Atual</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Meta de Selos</p>
            <p className="text-xl font-bold text-gray-900">{data.campaign?.stamps_required || 10} Selos</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Recompensa</p>
            <p className="text-xl font-bold text-gray-900">{data.campaign?.reward_description || 'Não configurada'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1 italic flex items-center gap-2">
              <Calendar size={14} /> Expira em
            </p>
            <p className="text-xl font-bold text-gray-900">
              {data.campaign?.expires_at
                ? new Date(data.campaign.expires_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Sem expiração'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
