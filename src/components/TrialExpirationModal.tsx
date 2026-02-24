import React from 'react';
import { AlertTriangle, CreditCard, Sparkles, ArrowRight } from 'lucide-react';

interface TrialExpirationModalProps {
    onSelectPlan: () => void;
}

export const TrialExpirationModal: React.FC<TrialExpirationModalProps> = ({ onSelectPlan }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="relative h-48 bg-blue-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                    <div className="relative z-10 text-center text-white px-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-white fill-white" />
                        </div>
                        <h2 className="text-3xl font-black">Seu período de teste acabou</h2>
                    </div>
                </div>

                <div className="p-8 md:p-12">
                    <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-8">
                        <AlertTriangle className="text-amber-600 w-6 h-6 shrink-0 mt-0.5" />
                        <p className="text-amber-800 font-medium text-sm leading-relaxed">
                            Suas 72 horas de acesso gratuito expiraram. Para continuar fidelizando seus clientes e acessando seus relatórios, escolha um de nossos planos profissionais.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Standard Plan */}
                        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-transparent hover:border-blue-200 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">MAIS POPULAR</span>
                                <p className="text-2xl font-black text-gray-900">R$ 97<span className="text-sm text-gray-400 font-medium">/mês</span></p>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Plano Pro</h3>
                            <ul className="text-sm text-gray-500 space-y-2 mb-6">
                                <li className="flex items-center gap-2">✓ Clientes Ilimitados</li>
                                <li className="flex items-center gap-2">✓ Cartões Digitais Custom</li>
                                <li className="flex items-center gap-2">✓ Relatórios Avançados</li>
                            </ul>
                            <button
                                onClick={onSelectPlan}
                                className="w-full bg-blue-600 text-white font-black py-3 rounded-xl group-hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                Assinar Agora
                                <ArrowRight size={18} />
                            </button>
                        </div>

                        {/* Annual Plan */}
                        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-transparent hover:border-green-200 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">ECONOMIZE 30%</span>
                                <p className="text-2xl font-black text-gray-900">R$ 797<span className="text-sm text-gray-400 font-medium">/ano</span></p>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Plano Anual</h3>
                            <ul className="text-sm text-gray-500 space-y-2 mb-6">
                                <li className="flex items-center gap-2">✓ Tudo do Plano Pro</li>
                                <li className="flex items-center gap-2">✓ Suporte Prioritário</li>
                                <li className="flex items-center gap-2">✓ Consultoria de Fidelização</li>
                            </ul>
                            <button
                                onClick={onSelectPlan}
                                className="w-full bg-green-600 text-white font-black py-3 rounded-xl group-hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                Assinar Anual
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
