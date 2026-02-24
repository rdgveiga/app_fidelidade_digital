import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Gift, Check, ChevronRight, Star, Trophy, Clock, Calendar, AlertCircle } from 'lucide-react';

interface Redemption {
    id: string;
    created_at: string;
    store_name: string;
    logo_url: string | null;
    store_slug: string;
    reward_description: string;
    stamps_required: number;
    expires_at: string | null;
}

interface CardSummary {
    id: string;
    store_name: string;
    logo_url: string | null;
    store_slug: string;
    current_stamps: number;
    stamps_required: number;
    reward_description: string;
    expires_at: string | null;
}

export const Rewards = () => {
    const { token } = useAuth();
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [cards, setCards] = useState<CardSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        fetch('/api/client/rewards', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                setRedemptions(data.redemptions || []);
                setCards(data.cards || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [token]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100" />)}
                </div>
            </div>
        );
    }

    const completedCards = cards.filter(c => c.current_stamps >= c.stamps_required);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Recompensas</h1>
                <p className="text-gray-500 mt-1 font-medium">
                    Acompanhe o que você já conquistou e o que está por vir.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                        <Trophy size={24} className="text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resgatadas</p>
                        <p className="text-2xl font-black text-gray-900">{redemptions.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <Gift size={24} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Prontas p/ Resgatar</p>
                        <p className="text-2xl font-black text-gray-900">{completedCards.length}</p>
                    </div>
                </div>
            </div>

            {/* Ready to Redeem */}
            {completedCards.length > 0 && (
                <div>
                    <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
                        <Star size={18} className="text-yellow-500 fill-yellow-400" />
                        Prontas para Resgatar
                    </h2>
                    <div className="space-y-3">
                        {completedCards.map(card => (
                            <Link
                                key={card.id}
                                to={`/cliente/card/${card.store_slug}`}
                                className="flex items-center gap-4 bg-white rounded-2xl border border-green-100 shadow-sm p-4 hover:shadow-md transition-all group cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {card.logo_url ? (
                                        <img src={card.logo_url} alt={card.store_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-black text-gray-400">{card.store_name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-gray-900 truncate">{card.store_name}</p>
                                    <p className="text-sm text-gray-500 truncate">{card.reward_description}</p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <Check size={13} className="text-green-600" />
                                        <span className="text-xs font-bold text-green-600">
                                            {card.stamps_required}/{card.stamps_required} carimbos completos
                                        </span>
                                    </div>
                                    {card.expires_at && (
                                        <div className="flex items-center gap-1.5 mt-1 text-orange-600">
                                            <AlertCircle size={12} />
                                            <span className="text-[10px] font-bold">Resgate antes de {new Date(card.expires_at).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    )}
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* In Progress */}
            {cards.filter(c => c.current_stamps < c.stamps_required).length > 0 && (
                <div>
                    <h2 className="text-lg font-black text-gray-800 mb-3">Em Progresso</h2>
                    <div className="space-y-3">
                        {cards
                            .filter(c => c.current_stamps < c.stamps_required)
                            .map(card => {
                                const pct = Math.round((card.current_stamps / card.stamps_required) * 100);
                                return (
                                    <Link
                                        key={card.id}
                                        to={`/cliente/card/${card.store_slug}`}
                                        className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all group cursor-pointer"
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {card.logo_url ? (
                                                <img src={card.logo_url} alt={card.store_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-black text-gray-400">{card.store_name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-black text-gray-900 truncate">{card.store_name}</p>
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                                                    {card.current_stamps}/{card.stamps_required}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs text-gray-400 truncate flex-1 font-medium">{card.reward_description}</p>
                                                {card.expires_at && (
                                                    <span className={`text-[10px] font-bold flex items-center gap-1 shrink-0 ${new Date(card.expires_at).getTime() - Date.now() < 48 * 60 * 60 * 1000 ? 'text-orange-500' : 'text-gray-400'
                                                        }`}>
                                                        <Clock size={10} />
                                                        {new Date(card.expires_at).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                                    </Link>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Redemption History */}
            <div>
                <h2 className="text-lg font-black text-gray-800 mb-3">Histórico de Resgates</h2>
                {redemptions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Gift size={26} className="text-gray-300" />
                        </div>
                        <p className="font-bold text-gray-500">Nenhuma recompensa resgatada ainda</p>
                        <p className="text-sm text-gray-400 mt-1">Continue acumulando carimbos e resgate sua primeira recompensa!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {redemptions.map(r => (
                            <div key={r.id} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {r.logo_url ? (
                                        <img src={r.logo_url} alt={r.store_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-black text-gray-400">{r.store_name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{r.store_name}</p>
                                    <p className="text-sm text-gray-500 truncate">{r.reward_description}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(r.created_at).toLocaleDateString('pt-BR', {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                                    <Check size={16} className="text-green-600" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
