import React from 'react';
import { MessageCircle, Mail, Phone, Clock, ShieldCheck, Zap } from 'lucide-react';

export const Support = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Header Support */}
            <section className="bg-blue-600 py-32 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50" />

                <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight">Estamos aqui para <br /> te ajudar!</h1>
                    <p className="text-xl text-blue-100 font-medium max-w-2xl mx-auto">
                        Nossa equipe de especialistas está pronta para tirar suas dúvidas e garantir que seu programa de fidelidade seja um sucesso.
                    </p>
                </div>
            </section>

            {/* Contact Channels */}
            <section className="py-24 px-6 relative z-20 -mt-16">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* WhatsApp Channel */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100 border border-gray-100 flex flex-col items-center text-center space-y-6 transform hover:-translate-y-2 transition-all">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center">
                            <MessageCircle size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">WhatsApp</h3>
                            <p className="text-gray-500 font-medium">Atendimento rápido e direto com nossos consultores.</p>
                        </div>
                        <a
                            href="https://wa.me/5521985899548"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-green-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                        >
                            Iniciar Chat
                        </a>
                    </div>

                    {/* Email Channel */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100 border border-gray-100 flex flex-col items-center text-center space-y-6 transform hover:-translate-y-2 transition-all">
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center">
                            <Mail size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">E-mail</h3>
                            <p className="text-gray-500 font-medium">Ideal para questões técnicas ou administrativas mais complexas.</p>
                        </div>
                        <a
                            href="mailto:suporte@fidelidadedigital.com"
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            Enviar Mensagem
                        </a>
                    </div>

                    {/* Time & Availability */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100 border border-gray-100 flex flex-col items-center text-center space-y-6 transform hover:-translate-y-2 transition-all">
                        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center">
                            <Clock size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Horário</h3>
                            <p className="text-gray-500 font-medium">Segunda a Sexta: 09h às 18h <br /> Sab: 09h às 12h</p>
                        </div>
                        <div className="text-orange-600 font-black flex items-center gap-2">
                            <Zap size={20} fill="currentColor" />
                            Resposta em até 2h
                        </div>
                    </div>

                    {/* LGPD Request Channel */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100 border border-gray-100 flex flex-col items-center text-center space-y-6 transform hover:-translate-y-2 transition-all md:col-span-2 lg:col-span-1">
                        <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center">
                            <ShieldCheck size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Privacidade (LGPD)</h3>
                            <p className="text-gray-500 font-medium">Solicite acesso, correção ou exclusão de dados pessoais.</p>
                        </div>
                        <a
                            href="mailto:privacidade@fidelidadedigital.com"
                            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                        >
                            Solicitar Dados
                        </a>
                    </div>
                </div>
            </section>

            {/* Success Indicators */}
            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={32} className="text-blue-600" />
                        <span className="text-2xl font-black text-gray-400">Suporte 100% Humano</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Zap size={32} className="text-blue-600" />
                        <span className="text-2xl font-black text-gray-400">Atendimento Expresso</span>
                    </div>
                </div>
            </section>
        </div>
    );
};
