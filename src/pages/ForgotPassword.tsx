import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase() }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao processar solicitação');

            setSubmitted(true);
            toast.success('Instruções enviadas para seu e-mail!');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row">
            <div className="hidden md:flex md:w-1/2 bg-blue-600 p-12 flex-col justify-between text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 font-bold text-2xl mb-16">
                        <div className="bg-white p-1.5 rounded-lg text-blue-600">
                            <Store className="w-6 h-6" />
                        </div>
                        <span>Fidelidade Digital</span>
                    </Link>
                    <h2 className="text-5xl font-black leading-tight max-w-lg">
                        Recuperação de Acesso
                    </h2>
                    <p className="text-xl text-blue-100 font-medium mt-6">
                        Não se preocupe, acontece com os melhores. Vamos te ajudar a voltar ao seu painel.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-6 md:p-12 justify-center">
                <div className="max-w-md w-full mx-auto">
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-8 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Voltar para o login
                    </button>

                    {!submitted ? (
                        <>
                            <div className="mb-10">
                                <h1 className="text-3xl font-black text-gray-900 mb-2">Esqueceu a senha?</h1>
                                <p className="text-gray-500 font-medium">
                                    Digite seu e-mail abaixo e enviaremos um link para você criar uma nova senha.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Email cadastrado *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl outline-none font-medium text-gray-900"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-blue-100"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                                    {!loading && <ArrowRight className="w-5 h-5" />}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">E-mail Enviado!</h2>
                            <p className="text-gray-600 mb-8">
                                Se o e-mail <strong>{email}</strong> estiver cadastrado em nossa plataforma, você receberá um link de recuperação em instantes.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all"
                            >
                                Voltar para o Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
