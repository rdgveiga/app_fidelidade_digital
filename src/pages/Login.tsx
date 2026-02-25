import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Store, Lock, Mail, ArrowRight, ArrowLeft, CreditCard, Users, BarChart3, User, Briefcase, Phone, MapPin, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Login = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const isRegister = mode === 'register';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    storeName: '',
    whatsapp: '',
    cnpj: '',
    cep: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { ...formData, email: formData.email.toLowerCase(), role: 'SHOPKEEPER' }
        : { email: formData.email.toLowerCase(), password: formData.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na operação');

      if (isRegister) {
        toast.success('Conta criada com sucesso! Faça login agora.');
        navigate('/login?mode=login');
      } else {
        login(data.token, data.user);
        if (data.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'SHOPKEEPER') {
          const slug = data.user.store?.slug;
          if (slug) {
            navigate(`/shop/${slug}/dashboard`);
          } else {
            toast.error('Loja não encontrada. Entre em contato com o suporte.');
            navigate('/');
          }
        } else {
          navigate('/cliente');
        }
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Side - Banner */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl mb-16">
            <div className="bg-white p-1.5 rounded-lg text-blue-600">
              <Store className="w-6 h-6" />
            </div>
            <span>Fidelidade Digital</span>
          </Link>

          <div className="space-y-6 max-w-lg">
            <h2 className="text-5xl font-black leading-tight">
              {isRegister ? 'Crie sua conta parceira' : 'Comece a fidelizar seus clientes hoje'}
            </h2>
            <p className="text-xl text-blue-100 font-medium">
              {isRegister
                ? 'Junte-se à plataforma que mais cresce no setor de fidelidade.'
                : 'Plataforma completa de fidelidade para sua empresa.'
              }
            </p>

            <div className="pt-8 flex gap-6">
              {[
                { name: 'Cartões Digitais', icon: CreditCard },
                { name: 'Gestão de Clientes', icon: Users },
                { name: 'Relatórios', icon: BarChart3 },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <feature.icon className="text-white w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-blue-100">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12">
          <p className="text-blue-100 font-medium italic">
            "Junte-se a centenas de empresas que já confiam no Fidelidade Digital"
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col p-6 md:p-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              {isRegister ? 'Criar Conta' : 'Bem-vindo de volta'}
            </h1>
            <p className="text-gray-500 font-medium">
              {isRegister
                ? 'Preencha os dados abaixo para começar gratuitamente'
                : 'Acesse sua conta para gerenciar seu programa de fidelidade'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Nome Responsável *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl outline-none font-medium"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">WhatsApp *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: 21999999999"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl outline-none font-medium"
                        value={formData.whatsapp}
                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nome da Loja *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl outline-none font-medium"
                      value={formData.storeName}
                      onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">CNPJ (Opcional)</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl outline-none font-medium"
                        value={formData.cnpj}
                        onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">CEP (Opcional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl outline-none font-medium"
                        value={formData.cep}
                        onChange={e => setFormData({ ...formData, cep: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl outline-none font-medium"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Senha *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl outline-none font-medium"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-blue-100 hover:-translate-y-0.5"
            >
              {loading ? 'Processando...' : (isRegister ? 'Criar Minha Conta' : 'Entrar')}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium">
              {isRegister ? 'Já tem uma conta?' : 'Ainda não é parceiro?'}
              <Link
                to={isRegister ? '/login?mode=login' : '/login?mode=register'}
                className="ml-2 text-blue-600 font-bold hover:underline"
              >
                {isRegister ? 'Fazer Login' : 'Começar Gratuitamente'}
              </Link>
            </p>
          </div>

          {!isRegister && (
            <p className="mt-8 text-center text-sm text-gray-400 font-medium">
              Área restrita — acesso apenas para parceiros cadastrados
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
