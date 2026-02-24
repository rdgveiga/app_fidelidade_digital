import React from 'react';
import { Shield, Lock, Eye, FileText, Scale } from 'lucide-react';

export const Terms = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-20 px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-xl p-12 border border-gray-100">
                <div className="flex items-center gap-4 mb-10 pb-10 border-b border-gray-100">
                    <div className="bg-blue-600 p-4 rounded-2xl text-white">
                        <Scale size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900">Termos de Uso</h1>
                        <p className="text-gray-500 font-medium">Última atualização: 24 de Fevereiro de 2026</p>
                    </div>
                </div>

                <div className="prose prose-blue max-w-none space-y-8 text-gray-600 font-medium leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <FileText className="text-blue-600" />
                            1. Aceitação dos Termos
                        </h2>
                        <p>
                            Ao acessar e utilizar a plataforma Fidelidade Digital, você concorda em cumprir e estar vinculado aos seguintes Termos e Condições de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <Shield className="text-blue-600" />
                            2. Cadastro e Responsabilidades
                        </h2>
                        <p>
                            O lojista é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorrem em sua conta. A Fidelidade Digital reserva-se o direito de suspender contas que violem nossas diretrizes de segurança ou ética comercial.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <Lock className="text-blue-600" />
                            3. Uso do Serviço
                        </h2>
                        <p>
                            Nossa plataforma fornece ferramentas para criação e gestão de programas de fidelidade. O uso indevido para fins fraudulentos, como a criação de carimbos sem consumo real, resultará no banimento imediato da conta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <Eye className="text-blue-600" />
                            4. Propriedade Intelectual
                        </h2>
                        <p>
                            Todo o design, código e conteúdo da Fidelidade Digital são de propriedade exclusiva. É proibida a reprodução ou engenharia reversa de qualquer parte da interface ou sistema.
                        </p>
                    </section>
                </div>

                <div className="mt-16 p-8 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-blue-900 font-bold text-lg text-center md:text-left">
                        Dúvidas sobre os termos? Entre em contato com nosso suporte especializado.
                    </p>
                    <a
                        href="https://wa.me/5521985899548"
                        className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        Falar com Suporte
                    </a>
                </div>
            </div>
        </div>
    );
};
