import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Search, Download, Users, UserCheck, TrendingUp,
    ChevronRight, ChevronLeft, Home, ChevronDown,
    Plus, X, Phone, Mail, MapPin, User, Lock, MoreHorizontal,
    Archive, Trash2, Edit2, RotateCcw, AlertTriangle, MessageSquare
} from 'lucide-react';
import { useParams } from 'react-router-dom';

interface Customer {
    user_id: number;
    name: string;
    email: string;
    phone: string | null;
    card_id: number;
    current_stamps: number;
    completed_cycles: number;
    status: 'ACTIVE' | 'ARCHIVED';
    last_stamp_at: string | null;
    card_created_at: string;
    total_stamps: number;
    total_redeems: number;
    address?: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface Stats {
    totalCustomers: number;
    activeCustomers: number;
}

interface NewClientForm {
    name: string;
    phone: string;
    email: string;
    address: string;
    password?: string;
}

const EMPTY_FORM: NewClientForm = { name: '', phone: '', email: '', address: '', password: '123456' };

export const Customers = () => {
    const { token, user } = useAuth();
    const { slug } = useParams();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [stats, setStats] = useState<Stats>({ totalCustomers: 0, activeCustomers: 0 });
    const [stampsRequired, setStampsRequired] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    // New client modal state
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<NewClientForm>(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState('');
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingUserId, setEditingUserId] = useState<number | null>(null);

    // Dropdown/Menu state
    const [activeRowMenu, setActiveRowMenu] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<Customer | null>(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState('');
    const [showArchiveConfirm, setShowArchiveConfirm] = useState<{ id: number; status: string } | null>(null);

    // Cross-store linking state
    const [existingClient, setExistingClient] = useState<{ id: number; name: string } | null>(null);
    const [isCheckingPhone, setIsCheckingPhone] = useState(false);

    // Profile Modal
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [lastCreatedPassword, setLastCreatedPassword] = useState('');

    const fetchCustomers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: '10',
                ...(search && { search }),
                ...(statusFilter !== 'all' && { status: statusFilter })
            });

            const res = await fetch(`/api/shop/customers?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setCustomers(data.customers);
            setPagination(data.pagination);
            setStats(data.stats);
            setStampsRequired(data.stampsRequired);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token, search, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => { fetchCustomers(1); }, 300);
        return () => clearTimeout(timer);
    }, [fetchCustomers]);

    // Check if phone exists when typing (debounced)
    useEffect(() => {
        if (form.phone.length < 8 || !showModal || existingClient) return;

        const checkPhone = async () => {
            setIsCheckingPhone(true);
            try {
                const res = await fetch(`/api/shop/customers/check?phone=${form.phone}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.exists) {
                    setExistingClient(data.client);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsCheckingPhone(false);
            }
        };

        const timer = setTimeout(checkPhone, 600);
        return () => clearTimeout(timer);
    }, [form.phone, token, showModal, existingClient]);

    const handleLinkClient = async () => {
        if (!existingClient) return;
        setFormLoading(true);
        setFormError('');

        try {
            const res = await fetch('/api/shop/customers/link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId: existingClient.id })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setFormSuccess(`Cliente ${existingClient.name} vinculado com sucesso!`);
            fetchCustomers(1);
            setTimeout(() => {
                closeModal();
            }, 2000);
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        try {
            const url = modalMode === 'create' ? '/api/shop/customers' : `/api/shop/customers/${editingUserId}`;
            const method = modalMode === 'create' ? 'POST' : 'PUT';

            const payload = { ...form };
            if (modalMode === 'create' && !payload.password) {
                payload.password = '123456';
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            let data;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error('Non-JSON response:', text);
                throw new Error('O servidor retornou uma resposta inválida. Por favor, tente novamente.');
            }

            if (!res.ok) throw new Error(data.error || 'Erro ao salvar cliente');

            setFormSuccess(`Cliente ${modalMode === 'create' ? 'cadastrado' : 'atualizado'} com sucesso!`);

            if (modalMode === 'create') {
                setLastCreatedPassword(form.password || '');
                // We keep the form data for a moment if we want to share, 
                // but the modal will close soon anyway. 
                // Let's keep it until closeModal is called.
            }

            fetchCustomers(pagination.page);
            setTimeout(() => {
                if (!lastCreatedPassword) closeModal(); // Only auto-close if not sharing? 
                // Actually, let's keep it open for 3 seconds if success.
            }, 3000);
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateStatus = async (cardId: number, status: 'ACTIVE' | 'ARCHIVED') => {
        try {
            const res = await fetch(`/api/shop/customers/card/${cardId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            fetchCustomers(pagination.page);
            setShowArchiveConfirm(null);
            setActiveRowMenu(null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteClient = async (cardId: number) => {
        try {
            const res = await fetch(`/api/shop/customers/card/${cardId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            fetchCustomers(pagination.page);
            setShowDeleteConfirm(null);
            setDeleteConfirmName('');
            setActiveRowMenu(null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const openEditModal = (customer: Customer) => {
        setModalMode('edit');
        setEditingUserId(customer.user_id);
        setForm({
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            address: customer.address || '',
            password: '123456' // Senha padrão para edições internas (embora não usada no PUT)
        });
        setShowModal(true);
        setActiveRowMenu(null);
    };

    const closeModal = () => {
        setShowModal(false);
        setForm(EMPTY_FORM);
        setFormError('');
        setFormSuccess('');
        setLastCreatedPassword('');
        setExistingClient(null);
        setModalMode('create');
        setEditingUserId(null);
    };

    const handleShareWhatsApp = (customer: any, password?: string) => {
        const storeName = user?.store?.name || 'nossa loja';
        const login = customer.phone;
        const appUrl = `${window.location.origin}/cliente/card/${slug}`;

        let message = `Olá *${customer.name}*! Boas-vindas ao *${storeName}*. Seu cadastro foi realizado com sucesso. 🟢\n\n`;
        message += `Acesse seu cartão fidelidade em:\n${appUrl}\n\n`;
        message += `*Seus dados de acesso:*\n`;
        message += `• Login: ${login}\n`;

        // Se a senha não for passada (ex: vindo do menu de contexto), usamos a padrão 123456
        const pass = password || '123456';
        message += `• Senha: *${pass}*\n\n`;
        message += `⚠️ _Por segurança, você deve alterar esta senha ao entrar no app pela primeira vez._`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/55${customer.phone?.replace(/\D/g, '')}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const getInitialsColor = (name: string) => {
        const colors = [
            'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
            'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700',
            'bg-indigo-100 text-indigo-700', 'bg-cyan-100 text-cyan-700',
            'bg-orange-100 text-orange-700',
        ];
        return colors[name.charCodeAt(0) % colors.length];
    };

    const formatLastVisit = (dateStr: string | null) => {
        if (!dateStr) return { date: 'Sem visitas', sub: '' };
        const date = new Date(dateStr);
        const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return { date: `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, sub: '' };
        if (diffDays === 1) return { date: `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, sub: '' };
        return { date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }), sub: '' };
    };

    const getStatusBadge = (lastStampAt: string | null) => {
        if (!lastStampAt) return 'inactive';
        const diffDays = Math.floor((Date.now() - new Date(lastStampAt).getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 ? 'active' : 'inactive';
    };

    const exportCSV = () => {
        const headers = ['Nome', 'Email', 'Telefone', 'Carimbos Atuais', 'Total Carimbos', 'Resgates', 'Última Visita'];
        const rows = customers.map(c => [c.name, c.email, c.phone || '', c.current_stamps, c.total_stamps, c.total_redeems, c.last_stamp_at || '']);
        const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clientes_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const statusLabels: Record<string, string> = {
        all: 'Todos os Status',
        active: 'Ativos',
        inactive: 'Inativos',
        archived: 'Arquivados'
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Home size={14} />
                <span>Início</span>
                <ChevronRight size={14} />
                <span className="font-bold text-gray-900">Clientes</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">Gestão de Clientes</h1>
                    <p className="text-[#6b7280] font-medium text-lg">
                        Gerencie e visualize o histórico de todos os clientes do seu programa de fidelidade.
                    </p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                        <Download size={18} />
                        Exportar
                    </button>
                    <button
                        onClick={() => { setModalMode('create'); setShowModal(true); }}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 hover:-translate-y-0.5"
                    >
                        <Plus size={18} />
                        Cadastrar Cliente
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                <div className="bg-white rounded-2xl border border-gray-100 premium-shadow p-6 flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                        <Users size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total de Clientes</p>
                        <p className="text-3xl font-extrabold text-gray-900">{stats.totalCustomers}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 premium-shadow p-6 flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                        <UserCheck size={24} className="text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ativos (30 dias)</p>
                        <p className="text-3xl font-extrabold text-gray-900">{stats.activeCustomers}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 premium-shadow p-6 flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                        <TrendingUp size={24} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ticket Médio Est.</p>
                        <p className="text-3xl font-extrabold text-gray-900">
                            {stats.totalCustomers > 0
                                ? `${(customers.reduce((sum, c) => sum + c.total_stamps, 0) / Math.max(customers.length, 1)).toFixed(1)}`
                                : '0'}
                            <span className="text-base font-bold text-gray-400 ml-1">visitas</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-gray-100 premium-shadow overflow-hidden">
                {/* Search & Filters */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou telefone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-[#f9fafb] border-2 border-gray-100 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-blue-200 focus:bg-white transition-all placeholder:text-gray-400"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            className="flex items-center gap-2 h-12 px-5 bg-[#f9fafb] border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-200 transition-all"
                        >
                            <span>{statusLabels[statusFilter]}</span>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showStatusDropdown && (
                            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-20 overflow-hidden min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200">
                                {Object.entries(statusLabels).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => { setStatusFilter(key); setShowStatusDropdown(false); }}
                                        className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${statusFilter === key ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : customers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Users size={48} className="mb-4 opacity-40" />
                        <p className="font-bold text-lg text-gray-500">Nenhum cliente encontrado</p>
                        <p className="text-sm mb-4">Cadastre o primeiro cliente clicando no botão acima.</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                            <div className="col-span-4">Cliente</div>
                            <div className="col-span-2">Última Visita</div>
                            <div className="col-span-2">Carimbos Atuais</div>
                            <div className="col-span-2">Total Acumulado</div>
                            <div className="col-span-2 text-right"></div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {customers.map((customer) => {
                                const visit = formatLastVisit(customer.last_stamp_at);
                                const stampPercent = Math.min((customer.current_stamps / stampsRequired) * 100, 100);
                                const progressColor = stampPercent >= 90 ? 'bg-emerald-500' : stampPercent >= 50 ? 'bg-blue-500' : 'bg-gray-300';
                                const isArchived = customer.status === 'ARCHIVED';

                                return (
                                    <div key={customer.card_id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-8 py-5 hover:bg-gray-50/50 transition-colors group relative ${isArchived ? 'opacity-60 bg-gray-50/30' : ''}`}>
                                        <div className="col-span-4 flex items-center gap-4">
                                            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${isArchived ? 'bg-gray-200 text-gray-500' : getInitialsColor(customer.name)}`}>
                                                {getInitials(customer.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900 truncate">{customer.name}</p>
                                                    {isArchived && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase">Arquivado</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{customer.phone || customer.email || '—'}</p>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="text-sm font-medium text-gray-900">{visit.date}</p>
                                        </div>

                                        <div className="col-span-2">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${stampPercent >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {customer.current_stamps} / {stampsRequired}
                                                </span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
                                                    <div className={`h-full rounded-full transition-all ${progressColor}`} style={{ width: `${stampPercent}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-700 font-medium">
                                                {customer.total_stamps} carimbos
                                                {customer.total_redeems > 0 && (
                                                    <span className="text-gray-400"> ({customer.total_redeems} recompensa{customer.total_redeems > 1 ? 's' : ''})</span>
                                                )}
                                            </p>
                                        </div>

                                        <div className="col-span-2 text-right flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedCustomer(customer); setShowProfileModal(true); }}
                                                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 opacity-70 group-hover:opacity-100"
                                            >
                                                Ver perfil
                                                <ChevronRight size={16} />
                                            </button>

                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveRowMenu(activeRowMenu === customer.card_id ? null : customer.card_id);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {activeRowMenu === customer.card_id && (
                                                    <div className="absolute right-0 bottom-full mb-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-20 overflow-hidden min-w-[160px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                        <button
                                                            onClick={() => { handleShareWhatsApp(customer); setActiveRowMenu(null); }}
                                                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#25D366] hover:bg-green-50 flex items-center gap-2 transition-colors"
                                                        >
                                                            <MessageSquare size={14} />
                                                            Enviar Acesso (WhatsApp)
                                                        </button>

                                                        <div className="border-t border-gray-50 my-1"></div>

                                                        <button
                                                            onClick={() => openEditModal(customer)}
                                                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                        >
                                                            <Edit2 size={14} className="text-blue-500" />
                                                            Editar Dados
                                                        </button>

                                                        {isArchived ? (
                                                            <button
                                                                onClick={() => handleUpdateStatus(customer.card_id, 'ACTIVE')}
                                                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                            >
                                                                <RotateCcw size={14} className="text-emerald-500" />
                                                                Desarquivar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setShowArchiveConfirm({ id: customer.card_id, status: 'ARCHIVED' })}
                                                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                            >
                                                                <Archive size={14} className="text-amber-500" />
                                                                Arquivar
                                                            </button>
                                                        )}

                                                        <div className="border-t border-gray-50 my-1"></div>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(customer)}
                                                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                            Remover da Loja
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100">
                            <p className="text-sm text-gray-500 font-medium">
                                Mostrando <span className="font-bold text-gray-700">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                                <span className="font-bold text-gray-700">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> de{' '}
                                <span className="font-bold text-gray-700">{pagination.total}</span> resultados
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fetchCustomers(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (pagination.totalPages > 5) {
                                        if (pagination.page <= 3) pageNum = i + 1;
                                        else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                                        else pageNum = pagination.page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => fetchCustomers(pageNum)}
                                            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${pagination.page === pageNum ? 'bg-[#1e3a5f] text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => fetchCustomers(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Register Client Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">
                                    {modalMode === 'create' ? 'Cadastrar Cliente' : 'Editar Cliente'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {modalMode === 'create'
                                        ? 'O cliente já terá um cartão fidelidade vinculado à sua loja'
                                        : 'Atualize os dados cadastrais do cliente'}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreateClient} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold">{formError}</div>
                            )}
                            {formSuccess && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-bold flex items-center gap-2">
                                        ✓ {formSuccess}
                                    </div>
                                    {modalMode === 'create' && (
                                        <button
                                            type="button"
                                            onClick={() => handleShareWhatsApp(form, lastCreatedPassword)}
                                            className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all shadow-lg shadow-green-100"
                                        >
                                            <MessageSquare size={18} />
                                            Enviar Acesso via WhatsApp
                                        </button>
                                    )}
                                </div>
                            )}

                            {existingClient && !formSuccess && modalMode === 'create' && (
                                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 animate-in zoom-in-95 duration-200">
                                    <h3 className="text-blue-900 font-bold mb-1">Cliente já cadastrado!</h3>
                                    <p className="text-blue-700 text-sm mb-4">
                                        <b>{existingClient.name}</b> já possui conta no sistema. Deseja adicioná-lo à sua base de clientes?
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleLinkClient}
                                            disabled={formLoading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                                        >
                                            {formLoading ? 'Processando...' : 'Sim, Vincular Cliente'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {(!existingClient || modalMode === 'edit') && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">WhatsApp / Telefone *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="tel"
                                                required
                                                placeholder="(00) 00000-0000"
                                                value={form.phone}
                                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-sm"
                                            />
                                            {isCheckingPhone && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Nome Completo *</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Nome do cliente"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Campo de senha oculto, usando padrão 123456 */}
                                    {modalMode === 'create' && (
                                        <input type="hidden" value={form.password} />
                                    )}

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Email <span className="text-gray-400 font-normal">(opcional)</span></label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="email"
                                                placeholder="email@exemplo.com"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Endereço <span className="text-gray-400 font-normal">(opcional)</span></label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
                                            <textarea
                                                rows={2}
                                                placeholder="Rua, número, bairro, cidade - UF"
                                                value={form.address}
                                                onChange={e => setForm({ ...form, address: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-sm resize-none"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {(!existingClient || modalMode === 'edit') && (
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading || !!formSuccess}
                                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-lg shadow-blue-100"
                                    >
                                        {formLoading
                                            ? (modalMode === 'create' ? 'Cadastrando...' : 'Salvando...')
                                            : (modalMode === 'create' ? 'Cadastrar Cliente' : 'Salvar Alterações')}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">Remover Cliente?</h3>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            Esta ação removerá o vínculo de <strong>{showDeleteConfirm.name}</strong> com sua loja. O histórico de carimbos nesta loja será perdido.
                        </p>

                        <div className="text-left mb-6">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Para confirmar, digite o nome do cliente:
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-xl outline-none font-bold text-sm transition-all"
                                placeholder={showDeleteConfirm.name}
                                value={deleteConfirmName}
                                onChange={(e) => setDeleteConfirmName(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteConfirm(null); setDeleteConfirmName(''); }}
                                className="flex-1 py-3 rounded-xl border-2 border-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteClient(showDeleteConfirm.card_id)}
                                disabled={deleteConfirmName !== showDeleteConfirm.name}
                                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white font-bold text-sm transition-all shadow-lg shadow-red-100"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Archive Confirmation Modal */}
            {showArchiveConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Archive size={32} />
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">Arquivar Cliente?</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Clientes arquivados não aparecem na listagem principal, mas seu histórico é preservado. Você pode restaurá-los a qualquer momento.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowArchiveConfirm(null)}
                                className="flex-1 py-3 rounded-xl border-2 border-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(showArchiveConfirm.id, 'ARCHIVED')}
                                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-lg shadow-amber-100"
                            >
                                Arquivar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Detail Modal */}
            {showProfileModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Header */}
                        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700">
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
                            >
                                <X size={20} />
                            </button>
                            <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-2xl shadow-xl">
                                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold ${getInitialsColor(selectedCustomer.name)}`}>
                                    {getInitials(selectedCustomer.name)}
                                </div>
                            </div>
                        </div>

                        <div className="pt-16 px-8 pb-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-gray-900">{selectedCustomer.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`w-2 h-2 rounded-full ${getStatusBadge(selectedCustomer.last_stamp_at) === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            {getStatusBadge(selectedCustomer.last_stamp_at) === 'active' ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleShareWhatsApp(selectedCustomer)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-bold hover:bg-[#128C7E] transition-all shadow-lg shadow-green-100"
                                >
                                    <MessageSquare size={18} />
                                    Enviar WhatsApp
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">WhatsApp</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedCustomer.phone || '—'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedCustomer.email || '—'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl col-span-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Endereço</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedCustomer.address || 'Não informado'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Métricas de Fidelidade</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-extrabold text-blue-600">{selectedCustomer.current_stamps}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Selo Atuais</p>
                                    </div>
                                    <div className="text-center border-x border-gray-100">
                                        <p className="text-2xl font-extrabold text-gray-900">{selectedCustomer.total_stamps}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Total Acumulado</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-extrabold text-emerald-600">{selectedCustomer.total_redeems}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Resgates</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
