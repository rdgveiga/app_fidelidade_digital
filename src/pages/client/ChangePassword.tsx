import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const ChangePassword = () => {
    const navigate = useNavigate();
    const { token, updateUser, logout } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/client/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword: formData.newPassword })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success('Senha alterada com sucesso!');
            updateUser({ mustChangePassword: false });
            navigate('/cliente');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao alterar senha');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-3xl shadow-xl shadow-green-200 mb-6">
                        <ShieldCheck className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Nova Senha</h1>
                    <p className="text-gray-500 font-medium px-4">Por segurança, crie uma senha pessoal para seus próximos acessos.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-8 md:p-10 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Nova Senha</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400"
                                    value={formData.newPassword}
                                    onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Confirmar Senha</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Repita a senha"
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Salvar Nova Senha'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={logout}
                                className="w-full py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors text-sm"
                            >
                                Sair e fazer login depois
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
