import React from 'react';
import { Eye, ShieldCheck, Lock, Database, UserCheck } from 'lucide-react';

export const Privacy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-20 px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-xl p-12 border border-gray-100">
                <div className="flex items-center gap-4 mb-10 pb-10 border-b border-gray-100">
                    <div className="bg-green-600 p-4 rounded-2xl text-white">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900">Política de Privacidade</h1>
                        <p className="text-gray-500 font-medium">Última atualização: 24 de Fevereiro de 2026</p>
                    </div>
                </div>

                <div className="prose prose-green max-w-none space-y-8 text-gray-600 font-medium leading-relaxed">
                    <p className="text-lg">
                        Sua privacidade é nossa prioridade absoluta. Este documento explica como coletamos, usamos e protegemos os seus dados e os dados dos seus clientes.
                    </p>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <Database className="text-green-600" />
                            1. Coleta de Dados
                        </h2>
                        <p>
                            Coletamos informações básicas como nome, e-mail e WhatsApp para o funcionamento do programa de fidelidade. No caso de clientes finais, apenas o número de telefone é essencial para a identificação e atribuição de carimbos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <Eye className="text-green-600" />
                            2. Uso das Informações
                        </h2>
                        <p>
                            Os dados coletados são usados exclusivamente para:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Gerenciar os cartões fidelidade e saldo de selos/pontos.</li>
                            <li>Permitir que o lojista identifique seus clientes mais frequentes.</li>
                            <li>Enviar notificações sobre prêmios e campanhas (quando autorizado).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <Lock className="text-green-600" />
                            3. Segurança e Armazenamento
                        </h2>
                        <p>
                            Utilizamos infraestrutura de ponta com criptografia SSL e bancos de dados protegidos. Seus dados são armazenados de forma segura e mantidos apenas pelo tempo necessário para cumprir as finalidades descritas, geralmente por 5 anos (para fins fiscais e de auditoria) ou até que você solicite a exclusão.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <UserCheck className="text-green-600" />
                            4. Controle do Usuário e Direitos LGPD
                        </h2>
                        <p>
                            De acordo com a LGPD, você tem o direito de acessar, corrigir ou excluir seus dados. Como titular dos dados, você pode:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Solicitar a confirmação da existência de tratamento de dados.</li>
                            <li>Acessar seus dados pessoais.</li>
                            <li>Solicitar a correção de dados incompletos ou inexatos.</li>
                            <li>Solicitar o "Direito ao Esquecimento" (exclusão definitiva).</li>
                        </ul>
                        <p className="mt-4">
                            Para exercer esses direitos, entre em contato através da nossa página de Suporte ou pelo e-mail: <strong>privacidade@fidelidadedigital.com</strong>. Processaremos sua solicitação em até 15 dias úteis.
                        </p>
                    </section>
                </div>

                <div className="mt-16 p-8 bg-green-50 rounded-3xl border border-green-100 italic font-semibold text-center text-green-800">
                    "Segurança e transparência são os pilares que sustentam a confiança entre a nossa plataforma e seu negócio."
                </div>
            </div>
        </div>
    );
};
