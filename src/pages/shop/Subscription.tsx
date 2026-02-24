import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, Zap, Rocket, Building2, Crown, Sparkles } from 'lucide-react';

const PlanCard = ({ title, price, features, icon: Icon, isCurrent, isPopular, onSelect, colorClass }: any) => (
    <div className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-300 flex flex-col h-full ${isCurrent ? 'border-gray-900 shadow-xl scale-105 z-10' : 'border-gray-100 hover:border-gray-200 hover:shadow-lg'
        }`}>
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-3xl ${colorClass} bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
                <Icon className={`w-8 h-8 ${colorClass}`} />
            </div>
            {isPopular && (
                <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-100">
                    Mais Popular
                </span>
            )}
            {isCurrent && (
                <span className="bg-gray-100 text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                    Plano Atual
                </span>
            )}
        </div>

        <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
        <div className="flex items-baseline gap-1 mb-8">
            <span className="text-4xl font-black text-gray-900">R$ {price}</span>
            <span className="text-gray-400 font-bold text-sm">/mês</span>
        </div>

        <ul className="space-y-4 mb-10 flex-1">
            {features.map((feature: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <div className="bg-emerald-50 p-1 rounded-full">
                        <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    {feature}
                </li>
            ))}
        </ul>

        <button
            onClick={onSelect}
            disabled={isCurrent}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${isCurrent
                ? 'bg-gray-50 text-gray-400 cursor-default'
                : 'bg-gray-900 text-white hover:bg-indigo-600 shadow-xl shadow-gray-200 hover:shadow-indigo-100'
                }`}
        >
            {isCurrent ? 'PLANO ATUAL' : 'ESCOLHER PLANO'}
        </button>
    </div>
);

export const Subscription = () => {
    const { user } = useAuth();

    const handleSelectPlan = (stripeLink: string) => {
        if (stripeLink) {
            window.open(stripeLink, '_blank');
        }
    };

    const plans = [
        {
            title: 'Básico',
            id: 'basic',
            price: '29,90',
            icon: Zap,
            colorClass: 'text-amber-500',
            stripeLink: 'https://buy.stripe.com/6oUaEXf5R0vBgwebp45os00',
            features: ['1 campanha ativa', '20 cartões ativos', 'Suporte via Chat', 'Relatórios básicos']
        },
        {
            title: 'Start',
            id: 'start',
            price: '49,90',
            icon: Rocket,
            isPopular: true,
            colorClass: 'text-indigo-600',
            stripeLink: 'https://buy.stripe.com/5kQ5kD9Lxa6b1Bk2Sy5os01',
            features: ['2 campanhas simultâneas', '100 cartões ativos', 'Suporte Prioritário', 'Relatórios detalhados', 'Logo customizada']
        },
        {
            title: 'Profissional',
            id: 'pro',
            price: '79,90',
            icon: Building2,
            colorClass: 'text-emerald-600',
            stripeLink: 'https://buy.stripe.com/28EbJ16zl5PV93Mal05os02',
            features: ['5 campanhas simultâneas', '500 cartões ativos', 'Estratégias de fidelização', 'Consultoria mensal', 'Exportação de dados']
        },
        {
            title: 'Ilimitado',
            id: 'unlimited',
            price: '99,90',
            icon: Crown,
            colorClass: 'text-fuchsia-600',
            stripeLink: 'https://buy.stripe.com/cNidR91f1guz1Bk9gW5os03',
            features: ['Campanhas ilimitadas', 'Cartões ilimitados', 'Todos os recursos', 'Consultoria mensal VIP', 'Acesso antecipado']
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Estilizado */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Assinatura</h1>
                    <p className="text-gray-500 font-medium text-lg">Gerencie seu plano e impulsione sua fidelização.</p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Seu status hoje</p>
                        <p className="text-sm font-bold text-gray-900">
                            {user?.trialEndsAt && new Date(user.trialEndsAt) > new Date()
                                ? 'Período de Teste Grátis'
                                : user?.subscriptionTier === 'basic' ? 'Plano Básico Ativo' : 'Aguardando Assinatura'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Banner de Plano Atual (como na imagem 2) */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -mr-48 -mt-48 mix-blend-multiply opacity-50" />
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            👑 Plano Atual
                        </h2>
                        <div className="space-y-1">
                            <p className="text-xl font-bold text-gray-800">{user?.subscriptionTier === 'basic' ? 'Básico' : 'Nenhum plano ativo'}</p>
                            <p className="text-gray-500 font-medium">{user?.subscriptionTier === 'basic' ? 'R$ 29,90/mês' : '-'}</p>
                        </div>
                        {user?.trialEndsAt && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                <p className="text-sm font-bold text-amber-700">
                                    {new Date(user.trialEndsAt) > new Date()
                                        ? `Período de teste expira em ${new Date(user.trialEndsAt).toLocaleDateString()}`
                                        : 'Período de teste expirado'}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="bg-indigo-600 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                        {user?.trialEndsAt && new Date(user.trialEndsAt) > new Date() ? 'Período de teste' : 'Assinatura Ativa'}
                    </div>
                </div>
            </div>

            {/* Seção de Planos */}
            <div className="space-y-8">
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Planos Disponíveis</h2>
                    <p className="text-gray-500 font-medium">Todos os planos incluem 7 dias grátis para você testar!</p>
                </div>

                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 pt-4">
                    {plans.map((plan, i) => (
                        <PlanCard
                            key={i}
                            {...plan}
                            isCurrent={plan.id === user?.subscriptionTier}
                            onSelect={() => handleSelectPlan(plan.stripeLink)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
