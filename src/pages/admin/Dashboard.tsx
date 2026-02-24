import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Store, Activity, Power, Trash2, AlertTriangle, X, Edit2, Key, List, Search, MapPin, Eye, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [deleteModalStore, setDeleteModalStore] = useState<any>(null);
  const [editModalStore, setEditModalStore] = useState<any>(null);
  const [viewCustomersStore, setViewCustomersStore] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Helpers
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  // Edit Form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    storeName: '',
    slug: '',
    category: '',
    cnpj: '',
    cep: ''
  }); const [newPassword, setNewPassword] = useState('');

  const fetchData = () => {
    fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const toggleStatus = async (storeId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await fetch(`/api/admin/store/${storeId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
      toast.success('Status da loja atualizado');
    } catch (err) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalStore || confirmName !== deleteModalStore.name) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/store/${deleteModalStore.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Falha ao deletar');

      toast.success('Loja deletada com sucesso');
      setDeleteModalStore(null);
      setConfirmName('');
      fetchData();
    } catch (err) {
      toast.error('Erro ao deletar loja');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditOpen = (store: any) => {
    setEditModalStore(store);
    setEditForm({
      name: store.owner_name || '',
      email: store.owner_email || '',
      phone: store.owner_phone || '',
      address: store.owner_address || '',
      storeName: store.name || '',
      slug: store.slug || '',
      category: store.category || '',
      cnpj: formatCNPJ(store.cnpj || ''),
      cep: store.cep || ''
    });
    setNewPassword('');
  };
  const handleUpdateShopkeeper = async () => {
    if (!editModalStore) return;
    setSaving(true);
    try {
      // 1. Update User Info
      const userRes = await fetch(`/api/admin/user/${editModalStore.tenant_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address
        })
      });

      if (!userRes.ok) throw new Error('Erro ao atualizar dados do lojista');

      // 2. Update Store Info
      const storeRes = await fetch(`/api/admin/store/${editModalStore.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.storeName,
          slug: editForm.slug,
          category: editForm.category,
          cnpj: editForm.cnpj.replace(/\D/g, ''),
          cep: editForm.cep
        })
      });
      if (!storeRes.ok) throw new Error('Erro ao atualizar dados da loja');

      // 3. Update password if provided
      if (newPassword) {
        const passRes = await fetch(`/api/admin/user/${editModalStore.tenant_id}/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ password: newPassword })
        });
        if (!passRes.ok) toast.error('Erro ao resetar senha, mas dados salvos');
        else toast.success('Senha atualizada com sucesso');
      }

      toast.success('Informações atualizadas com sucesso');
      setEditModalStore(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  const fetchStoreCustomers = async (store: any) => {
    setViewCustomersStore(store);
    setLoadingCustomers(true);
    try {
      const res = await fetch(`/api/admin/store/${store.id}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCustomers(data || []);
    } catch (err) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoadingCustomers(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 p-4 md:p-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        <div className="text-sm text-gray-400 font-medium">
          {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Usuários Totais</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.stats.totalUsers}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Store size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Lojas Cadastradas</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.stats.totalStores}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total de Carimbos</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.stats.totalStamps}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Store size={18} className="text-gray-400" />
            Gerenciar Lojas e Lojistas
          </h3>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">{data.stores.length} lojas encontradas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Loja / Slug</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Lojista</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Criado em</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.stores.map((store: any) => (
                <tr key={store.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{store.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{store.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">{store.owner_email}</div>
                    <div className="text-[11px] text-gray-400">{store.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${store.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${store.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {store.status === 'ACTIVE' ? 'Ativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(store.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => window.open(`/cliente/card/${store.slug}`, '_blank')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Ir para a Loja"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button
                        onClick={() => fetchStoreCustomers(store)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Ver Clientes"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditOpen(store)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        title="Editar Lojista"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => toggleStatus(store.id, store.status)}
                        className={`p-2 rounded-lg transition-all ${store.status === 'ACTIVE'
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-green-600 hover:bg-green-50'
                          }`}
                        title={store.status === 'ACTIVE' ? 'Suspender' : 'Ativar'}
                      >
                        <Power size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteModalStore(store)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Deletar permanentemente"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Shopkeeper Modal */}
      {editModalStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Gerenciar Lojista: {editModalStore.name}</h3>
              <button onClick={() => setEditModalStore(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Seção Lojista */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b pb-1">Dados do Lojista (Usuário)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nome Completo</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">E-mail</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">WhatsApp</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Endereço Pessoal</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Seção Loja */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest border-b pb-1">Dados da Loja</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nome da Loja</label>
                    <input
                      type="text"
                      value={editForm.storeName}
                      onChange={e => setEditForm({ ...editForm, storeName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Slug (URL)</label>
                    <input
                      type="text"
                      value={editForm.slug}
                      onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Categoria</label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">CNPJ</label>
                    <input
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={editForm.cnpj}
                      onChange={e => setEditForm({ ...editForm, cnpj: formatCNPJ(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium text-sm"
                    />
                  </div>                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">CEP da Loja</label>
                    <input
                      type="text"
                      value={editForm.cep}
                      onChange={e => setEditForm({ ...editForm, cep: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <Key size={16} />
                  <span className="text-xs font-bold uppercase">Redefinir Senha</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nova senha (min. 6 caracteres)"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-medium text-sm"
                  />
                  <button
                    onClick={() => setNewPassword(Math.random().toString(36).slice(-8))}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    Gerar
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">Ao resetar, o lojista será obrigado a trocar a senha no próximo acesso.</p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t flex gap-3">
              <button
                onClick={() => setEditModalStore(null)}
                className="flex-1 py-3 bg-white border font-bold text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateShopkeeper}
                disabled={saving}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Customers Modal */}
      {viewCustomersStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900">Clientes Ativos: {viewCustomersStore.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Total de {customers.length} cartões fidelidade emitidos</p>
              </div>
              <button onClick={() => setViewCustomersStore(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              {loadingCustomers ? (
                <div className="flex items-center justify-center p-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : customers.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <Users size={32} />
                  </div>
                  <p className="text-gray-400 font-medium">Nenhum cliente cadastrado nesta loja ainda.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 border-b sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Cliente</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Contato</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-center">Selos</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px] text-right">Último Carimbo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map((c: any) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 uppercase">{c.user.name}</div>
                          <div className="text-[10px] text-gray-400">ID: {c.user.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">{c.user.email || 'N/A'}</div>
                          <div className="text-[11px] font-bold text-green-600">{c.user.phone || 'Sem Zap'}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100">
                            {c.current_stamps}
                          </div>
                          {c.completed_cycles > 0 && (
                            <div className="text-[9px] text-green-600 font-black mt-1">+{c.completed_cycles} RESGATES</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-gray-400">
                          {c.last_stamp_at ? new Date(c.last_stamp_at).toLocaleDateString() : 'Nunca'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t text-center">
              <button
                onClick={() => setViewCustomersStore(null)}
                className="px-8 py-2 bg-white border font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <button
                  onClick={() => setDeleteModalStore(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-2">Deletar Loja permanentemente?</h3>
              <p className="text-gray-500 font-medium mb-6 leading-relaxed">
                Esta ação <span className="text-red-600 font-bold underline">não pode ser desfeita</span>.
                Isso apagará permanentemente a loja <span className="font-black text-gray-900">"{deleteModalStore.name}"</span>,
                além de todos os clientes, cartões, campanhas e transações associadas ao lojista <span className="font-bold">{deleteModalStore.owner_email}</span>.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2">
                    Para confirmar, digite o nome exato da loja abaixo:
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-xl outline-none font-bold transition-all"
                    placeholder={deleteModalStore.name}
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleDelete}
                  disabled={confirmName !== deleteModalStore.name || deleting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:hover:bg-red-600 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2"
                >
                  {deleting ? 'Apagando tudo...' : 'Sim, deletar permanentemente'}
                  {!deleting && <Trash2 size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
