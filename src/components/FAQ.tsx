import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
    {
        question: "Como os clientes 'carimbam' o cartão?",
        answer: "É muito simples! No seu balcão, o cliente informa o código de 6 dígitos que aparece no celular dele ou você pode escanear o QR Code. O sistema carimba instantaneamente sem que o cliente precise baixar nenhum aplicativo."
    },
    {
        question: "Preciso de algum equipamento especial?",
        answer: "Não. Você pode usar qualquer smartphone, tablet ou computador com acesso à internet para gerenciar seu programa de fidelidade e dar carimbos aos clientes."
    },
    {
        question: "O sistema é seguro contra fraudes?",
        answer: "Sim! Cada carimbo é registrado com data, hora e autenticação do cliente. Você tem controle total sobre quem recebeu carimbos e pode auditar o histórico a qualquer momento."
    },
    {
        question: "Posso ter mais de um prêmio ou campanha?",
        answer: "Sim, dependendo do seu plano selecionado (Start, Profissional ou Ilimitado), você pode criar múltiplas campanhas simultâneas para diferentes produtos ou categorias."
    },
    {
        question: "Como funciona o período de teste grátis?",
        answer: "Você tem 7 dias de acesso total e gratuito a todas as funcionalidades do plano escolhido. Não pedimos cartão de crédito para começar. Após os 7 dias, você escolhe se deseja continuar."
    }
];

export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 px-6 bg-white" id="faq">
            <div className="max-w-3xl mx-auto text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest mb-4">
                    <HelpCircle className="w-3 h-3" />
                    Dúvidas Comuns
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                    Perguntas Frequentes
                </h2>
                <p className="text-xl text-gray-600">
                    Tudo o que você precisa saber para começar a fidelizar hoje mesmo.
                </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
                {faqData.map((item, index) => (
                    <div
                        key={index}
                        className="border border-gray-100 rounded-[2rem] overflow-hidden bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full px-8 py-6 text-left flex justify-between items-center gap-4"
                        >
                            <span className="text-lg font-bold text-gray-900">{item.question}</span>
                            {openIndex === index ? (
                                <ChevronUp className="text-blue-600 shrink-0" />
                            ) : (
                                <ChevronDown className="text-gray-400 shrink-0" />
                            )}
                        </button>

                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="px-8 pb-6 text-gray-600 leading-relaxed font-medium">
                                        {item.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </section>
    );
};
