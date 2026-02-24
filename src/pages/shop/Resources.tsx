import React from 'react';
import { BookOpen, Download, MessageSquare, Copy, Star, Zap, Image as ImageIcon, CheckCircle2, QrCode, Flame, Clock, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Resources = () => {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Texto copiado!');
    };

    const scripts = [
        {
            title: "1. Convite p/ Novos Clientes",
            text: "Olá! Notei que você ainda não faz parte do nosso Clube de Fidelidade. 🎉 No seu próximo consumo, você já ganha o primeiro carimbo e fica mais perto de ganhar [RECOMPENSA]! É só chegar no balcão e pedir seu selo digital."
        },
        {
            title: "2. Recuperar Cliente Sumido",
            text: "Oi, tudo bem? Sentimos sua falta aqui na [NOME DA LOJA]! 🏠 Você já tem [X] carimbos acumulados. Só faltam mais [Y] para você resgatar seu [RECOMPENSA]. Que tal passar aqui hoje?"
        },
        {
            title: "3. Promoção Relâmpago (Hoje)",
            text: "🚨 SÓ HOJE: Quer ganhar CARIMBO EM DOBRO? 😱 Quem passar aqui na [NOME DA LOJA] hoje e fizer um pedido, ganha 2 selos de uma vez só! Falta pouco para o seu prêmio. Aproveite!"
        },
        {
            title: "4. Indicação Premiada",
            text: "Sabia que seu brinde pode chegar mais cedo? 🏃💨 Indique um amigo para conhecer a [NOME DA LOJA] e, quando ele ganhar o primeiro carimbo dele, VOCÊ ganha um carimbo extra no seu cartão! Quem você vai trazer?"
        },
        {
            title: "5. Alerta de Prêmio Próximo",
            text: "FALTA APENAS UM! 🏁 Oi [NOME], você está a um passo de resgatar seu [RECOMPENSA] totalmente grátis. Passa aqui essa semana para completar seu cartão? Estamos te esperando!"
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Sua Central de Lucro 🚀</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Estratégias validadas para trazer dinheiro rápido para o seu caixa usando o seu programa de fidelidade.
                </p>
            </div>

            {/* Grid de Seções */}
            <div className="grid gap-8">

                {/* Guia Ouro no WhatsApp */}
                <section className="bg-white rounded-3xl shadow-xl shadow-blue-50 border border-blue-100 overflow-hidden">
                    <div className="bg-emerald-600 p-8 text-white">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-2xl">
                                <MessageSquare size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Guia Ouro no WhatsApp</h2>
                                <p className="text-emerald-100 italic">Os 5 scripts que mais trazem clientes de volta.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Star className="text-yellow-400 fill-current" size={20} />
                                    Como usar os Scripts
                                </h3>
                                <ul className="space-y-4 text-gray-600">
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                        <p><strong>Não use Lista de Transmissão:</strong> O WhatsApp bloqueia. Mande um por um ou use o status.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                        <p><strong>Personalize o Nome:</strong> Sempre comece com "Oi [NOME]". Isso aumenta em 3x a chance de resposta.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                        <p><strong>Use Emojis:</strong> Deixe a conversa leve e amigável. É um convite, não uma cobrança.</p>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900">Biblioteca de Scripts</h3>
                                <div className="space-y-4 h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                    {scripts.map((script, i) => (
                                        <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 relative group">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">{script.title}</p>
                                            <p className="text-sm text-gray-700 italic">"{script.text}"</p>
                                            <button
                                                onClick={() => copyToClipboard(script.text)}
                                                className="absolute top-4 right-4 p-2 bg-white shadow-sm rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Estratégias de Resultado Rápido */}
                <section className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap size={120} />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
                                <Flame size={14} className="animate-pulse" />
                                Explosão de Vendas
                            </div>
                            <h2 className="text-3xl font-black">Plano de Ação: Resultado em 48h</h2>
                            <p className="text-gray-400 text-lg">Três estratégias "tiro curto" para encher sua loja ainda essa semana.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4 hover:bg-white/10 transition-colors">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                                    <Clock />
                                </div>
                                <h4 className="font-bold text-xl">Prêmio de Boas-Vindas</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Dê um prêmio pequeno e imediato (ex: um doce, um brinde simples ou desconto na hora) na hora do PRIMEIRO carimbo. Isso gera dopamina e garante que o cliente nunca apague seu cartão.
                                </p>
                            </div>

                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4 hover:bg-white/10 transition-colors">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                                    <Users />
                                </div>
                                <h4 className="font-bold text-xl">O Gatilho da Escassez</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Poste no seu Status: "Liberamos 10 combos com CARIMBO TRIPLO para as primeiras 10 pessoas que chegarem hoje". O movimento gera movimento.
                                </p>
                            </div>

                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4 hover:bg-white/10 transition-colors">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                                    <CheckCircle2 size={48} />
                                </div>
                                <h4 className="font-bold text-xl">Dia do Carimbo em Dobro</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Escolha o seu pior dia da semana (ex: Segunda-feira) e transforme no "Dia Oficial do Selo em Dobro". Você troca o tempo ocioso por clientes fiéis.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Suporte VIP */}
                <section className="bg-blue-50 rounded-3xl p-8 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-blue-900">Dúvidas na Estratégia?</h2>
                        <p className="text-blue-700 font-medium">Fale com um consultor e descubra a melhor regra de pontos para o seu nicho.</p>
                    </div>
                    <a
                        href="https://wa.me/5521985899548?text=Olá! Quero uma consultoria rápida sobre minha estratégia de fidelidade."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-200 flex items-center gap-2"
                    >
                        <MessageSquare size={20} />
                        Consultoria via WhatsApp
                    </a>
                </section>
            </div>
        </div>
    );
};
