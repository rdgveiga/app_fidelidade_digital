import React from 'react';
import { Link } from 'react-router-dom';
import { FAQ } from '../components/FAQ';
import {
  Store,
  ShieldCheck,
  Zap,
  Smartphone,
  Clock,
  BarChart3,
  MessageCircle,
  Download,
  Users,
  Rocket,
  Check,
  Lightbulb,
  Flame,
  Briefcase,
  Diamond,
  Coins,
  X,
  Gift,
  ArrowRight,
  HelpCircle,
  Heart,
  ShoppingBag,
  Star,
  Scale
} from 'lucide-react';
import { motion } from 'framer-motion';

const SchemaOrg = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Fidelidade Digital",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "description": "Sistema de cartão fidelidade digital para lojistas aumentarem vendas e retenção de clientes.",
    "offers": {
      "@type": "Offer",
      "price": "29.90",
      "priceCurrency": "BRL"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2000"
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

const ProfitCalculator = () => {
  const [avgTicket, setAvgTicket] = React.useState(50);
  const [clientsPerMonth, setClientsPerMonth] = React.useState(200);
  const [retentionIncrease, setRetentionIncrease] = React.useState(20);

  const currentRevenue = avgTicket * clientsPerMonth;
  const newRevenue = currentRevenue * (1 + (retentionIncrease / 100));
  const increase = newRevenue - currentRevenue;

  return (
    <section className="py-24 bg-blue-600 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-widest">
              <BarChart3 className="w-3 h-3" />
              Calculadora de Impacto
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              Quanto dinheiro você está <br />
              <span className="text-blue-200 underline decoration-blue-400">deixando na mesa?</span>
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
              Aumentar a fidelidade dos seus clientes é a forma mais barata de crescer.
              Simule abaixo o impacto real no seu faturamento mensal.
            </p>

            <div className="grid gap-6">
              <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-blue-50">Ticket Médio (R$)</span>
                  <div className="flex items-center bg-white/20 rounded-lg px-3 py-1">
                    <span className="text-white font-bold mr-1">R$</span>
                    <input
                      type="number"
                      value={avgTicket}
                      onChange={(e) => setAvgTicket(Number(e.target.value))}
                      className="bg-transparent text-white font-black text-2xl w-20 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <input
                  type="range" min="10" max="500" step="5" value={avgTicket}
                  onChange={(e) => setAvgTicket(Number(e.target.value))}
                  className="w-full h-2 bg-blue-400 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-blue-50">Clientes por Mês</span>
                  <input
                    type="number"
                    value={clientsPerMonth}
                    onChange={(e) => setClientsPerMonth(Number(e.target.value))}
                    className="bg-white/20 rounded-lg px-3 py-1 text-white font-black text-2xl w-24 text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <input
                  type="range" min="50" max="2000" step="50" value={clientsPerMonth}
                  onChange={(e) => setClientsPerMonth(Number(e.target.value))}
                  className="w-full h-2 bg-blue-400 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/40 text-center space-y-8 relative">
            <div className="inline-block p-4 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
              <Rocket size={32} className="animate-bounce" />
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Aumento Estimado de Lucro</p>
            <div className="space-y-2">
              <p className="text-6xl md:text-7xl font-black text-gray-900 leading-none">
                <span className="text-emerald-500">+</span> R$ {Math.round(increase).toLocaleString('pt-BR')}
              </p>
              <p className="text-gray-400 font-medium">extras todos os meses</p>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-6 italic">
                *Cálculo baseado em um aumento conservador de {retentionIncrease}% na taxa de retorno dos seus clientes.
              </p>
              <Link
                to="/login?mode=register"
                className="w-full bg-blue-600 hover:bg-emerald-500 text-white text-xl py-5 rounded-2xl font-black transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:scale-[1.02]"
              >
                Garantir esse faturamento
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Landing = () => {
  const scrollToPricing = () => {
    const element = document.getElementById('pricing');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-600">
      <SchemaOrg />
      {/* Header */}
      <header className="bg-white py-4 px-6 sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl tracking-tight">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-gray-900">Fidelidade Digital</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-6 text-sm font-semibold text-gray-600">
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-600 transition-colors">Funcionalidades</button>
              <button onClick={scrollToPricing} className="hover:text-blue-600 transition-colors">Preços</button>
              <button onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-600 transition-colors">FAQ</button>
              <Link to="/login" className="hover:text-blue-600 transition-colors">Login</Link>
            </nav>
            <Link
              to="/login?mode=register"
              className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-100"
            >
              Começar Grátis
            </Link>
          </div>

          <button className="md:hidden text-gray-900 p-2">
            <Smartphone className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-12 pb-24 px-6 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-start gap-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest">
                <Zap className="w-3 h-3 fill-current" />
                Rápido e sem app
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight max-w-[18ch]">
                Aumente o faturamento da sua loja em até <span className="text-emerald-500">30%</span>, <br />
                <span className="text-blue-600">fidelizando clientes</span>
              </h1>

              <p className="text-xl text-gray-600 font-medium max-w-lg leading-relaxed">
                Transforme clientes ocasionais em compradores recorrentes. Nossa plataforma automatiza a fidelização e traz seus clientes de volta mais vezes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login?mode=register"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold inline-flex items-center justify-center gap-2 shadow-xl shadow-blue-200 transition-all hover:-translate-y-1"
                >
                  <Store className="w-5 h-5" />
                  Começar Grátis
                </Link>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <img
                      key={i}
                      src={`https://picsum.photos/seed/user${i}/100/100`}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      alt={`Lojista satisfeito ${i}`}
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  Mais de <strong className="text-gray-900">2.000</strong> lojistas confiam.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-orange-100 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-8 border-gray-800">
                  <img
                    src="https://picsum.photos/seed/fidelidade-digital/1200/800"
                    alt="Plataforma Fidelidade Digital"
                    className="w-full h-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              {/* Decorative background glow */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-200/30 blur-[100px] rounded-full" />
            </motion.div>
          </div>
        </section>

        {/* Nichos Section */}
        <section className="py-20 bg-white px-6 border-y border-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-gray-900 mb-4">Perfeito para qualquer tipo de negócio</h2>
              <p className="text-lg text-gray-600">Se você tem clientes recorrentes, o Fidelidade Digital é para você.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Rocket, label: "Lanchonetes e Cafés", color: "bg-orange-50 text-orange-600" },
                { icon: Briefcase, label: "Salões e Barbearias", color: "bg-blue-50 text-blue-600" },
                { icon: Heart, label: "Pet Shops e Clínicas", color: "bg-red-50 text-red-600" },
                { icon: ShoppingBag, label: "Lojas e Varejo", color: "bg-purple-50 text-purple-600" },
                { icon: Scale, label: "Profissionais Autônomos", color: "bg-teal-50 text-teal-600" },
              ].map((nicho, i) => (
                <div key={i} className={`p-6 rounded-3xl ${nicho.color} flex flex-col items-center text-center gap-4 transition-transform hover:-translate-y-1`}>
                  <nicho.icon size={32} />
                  <span className="font-bold text-gray-900">{nicho.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section (Image 1 top) */}
        <section className="py-24 bg-white px-6">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Por que mudar para o digital?</h2>
            <p className="text-xl text-gray-600">Esqueça os cartões de papel que os clientes perdem.</p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                  <X size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Cartões de Papel</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Clientes perdem ou esquecem em casa",
                  "Sem dados sobre quem são seus clientes",
                  "Custo recorrente com impressão",
                  "Fraudes são fáceis de cometer"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <div className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                      <div className="w-2 h-0.5 bg-current" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="absolute top-4 right-4 text-blue-100">
                <ShieldCheck size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                    <Check size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Fidelidade Digital</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Sempre no bolso do cliente (smartphone)",
                    "Você constrói sua lista de contatos automática",
                    "Zero custo de impressão e papel",
                    "Notificações para trazer o cliente de volta"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-900 font-bold">
                      <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                        <Check size={14} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works - Simple for Everyone (Image 1 bottom) */}
        <section className="py-24 bg-gray-50 px-6">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <p className="text-blue-600 font-black uppercase tracking-widest text-sm mb-4">Como Funciona</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Simples para todos</h2>
            <p className="text-xl text-gray-600">Três passos rápidos para começar a fidelizar seus clientes e aumentar suas vendas.</p>
          </div>

          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1. Crie seu Cartão Digital",
                desc: "Cadastre sua loja e configure as regras do seu programa de fidelidade em minutos. Gere seu acesso exclusivo.",
                icon: Smartphone
              },
              {
                step: "2. Carimbe via Código de 6 dígitos",
                desc: "O cliente informa o código de 6 dígitos recebido no celular e recebe o \"carimbo\" digital instantaneamente. Sem instalar apps.",
                icon: ShieldCheck
              },
              {
                step: "3. Clientes Resgatam Prêmios",
                desc: "Ao completar a cartela, o cliente é notificado e troca seus pontos por recompensas na sua loja.",
                icon: Gift
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100"
              >
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{item.step}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Profit Calculator Section */}
        <ProfitCalculator />

        {/* For the Shopkeeper (Image 2) */}
        <section className="py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <p className="text-blue-600 font-black uppercase tracking-widest text-sm mb-4">Para o Lojista</p>
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">Comece em menos <br /> de 1 minuto.</h2>
              </div>
              <p className="text-xl text-gray-600 font-medium">Nossa plataforma foi desenhada para a correria do varejo. Configure uma vez, use para sempre.</p>

              <div className="space-y-8">
                {[
                  { step: "1", title: "Cadastre sua Loja", desc: "Insira os dados básicos do seu negócio e personalize a aparência do seu cartão." },
                  { step: "2", title: "Defina a Regra", desc: "Escolha quantos selos são necessários (ex: 10) e qual será a recompensa final." },
                  { step: "3", title: "Comece a Carimbar", desc: "Utilize o sistema de Código de 6 dígitos no balcão. Seus clientes recebem o carimbo de forma rápida e segura." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-[3rem] p-8 lg:p-12"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="w-full h-64 bg-gray-50 rounded-2xl mb-6 flex items-center justify-center">
                  <div className="w-full max-w-[200px] space-y-4">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto" />
                    <div className="h-24 bg-gray-200 rounded-2xl w-full" />
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 bg-blue-600 rounded-full" />)}
                      {[4, 5].map(i => <div key={i} className="w-8 h-8 bg-gray-100 rounded-full" />)}
                    </div>
                    <div className="h-10 bg-gray-900 rounded-xl w-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Incredible Speed (Image 3) */}
        <section className="py-24 bg-blue-50 px-6">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <p className="text-green-600 font-black uppercase tracking-widest text-sm mb-4">Velocidade Incrível</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">O processo mais rápido do mercado</h2>
            <p className="text-xl text-gray-600">Esqueça filas e cadastros longos. Com a Fidelidade Digital, tudo acontece em menos de 10 segundos.</p>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { time: "0s", title: "Pagamento Concluído", desc: "Após a compra, o cliente solicita o carimbo." },
              { time: "3s", title: "Informa Código", desc: "Informa o código de 6 dígitos no balcão." },
              { time: "7s", title: "Carimbo Digital", desc: "O cartão é carimbado instantaneamente no sistema." },
              { time: "10s", title: "Cliente Feliz", desc: "Notificação de recompensa enviada." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center relative"
              >
                <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-lg shadow-green-100">
                  {item.time}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                    <ArrowRight className="text-gray-200" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social Proof [NEW] */}
        <section className="py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Quem usa, aprova</h2>
              <p className="text-xl text-gray-600">Lojistas que transformaram o atendimento e as vendas com o digital.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  resp: "Melhor investimento que fiz. Meus clientes adoraram não precisar de papel e eu adoro ter o contato deles para avisar de promoções.",
                  name: "Ricardo Santos",
                  store: "Barbearia Classic",
                  stars: 5
                },
                {
                  resp: "O sistema de 6 dígitos é muito rápido. No balcão não trava nada e o cliente já sai com o ponto no celular. Recomendo muito!",
                  name: "Ana Oliveira",
                  store: "Café do Ponto",
                  stars: 5
                },
                {
                  resp: "O sistema de 6 dígitos é muito rápido. No balcão não trava nada e o cliente já sai com o \"carimbo\" no celular. Recomendo muito!",
                  name: "Marcos Pereira",
                  store: "Pet Love",
                  stars: 5
                }
              ].map((testimony, i) => (
                <div key={i} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col h-full">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimony.stars)].map((_, i) => (
                      <Star key={i} size={18} className="fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-8 flex-grow">"{testimony.resp}"</p>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimony.name}</h4>
                    <p className="text-sm text-blue-600 font-medium">{testimony.store}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                Por que escolher o FIDELIDADE DIGITAL
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Clientes se cadastram sozinhos",
                "Base de contatos sempre atualizada",
                "Comunicação direta via WhatsApp",
                "Histórico completo de visitas e selos",
                "Promoções personalizadas e segmentadas",
                "Multiempresa: ideal para vários negócios",
                "Sem papel, sem desperdício"
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <Check size={18} />
                  </div>
                  <span className="text-lg font-bold text-gray-800">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                Planos
              </h2>
              <p className="text-xl text-gray-600">
                <strong>Comece grátis por 7 dias</strong> em qualquer plano
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Básico",
                  price: "29,90",
                  features: ["1 campanha", "Até 20 cartões", "Bônus: Kit de Divulgação"],
                  icon: Lightbulb,
                  highlight: false
                },
                {
                  name: "Start",
                  price: "49,90",
                  features: ["2 campanhas", "Até 100 cartões", "Bônus: Kit + Guia WhatsApp"],
                  icon: Flame,
                  highlight: true
                },
                {
                  name: "Profissional",
                  price: "79,90",
                  features: ["5 campanhas", "Até 500 cartões", "Todos os Bônus + Onboarding"],
                  icon: Briefcase,
                  highlight: false
                },
                {
                  name: "Ilimitado",
                  price: "99,90",
                  features: ["Campanhas ilimitadas", "Cartões ilimitados", "Todos os Bônus + VIP"],
                  icon: Diamond,
                  highlight: false
                }
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative bg-white p-10 rounded-[3rem] shadow-xl border-2 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.highlight ? 'border-blue-600 scale-105 z-10' : 'border-transparent hover:border-blue-100'}`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                      Mais Popular
                    </div>
                  )}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${plan.highlight ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    <plan.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-gray-500 font-bold">R$</span>
                    <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 font-medium">/mês</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                        <Check size={18} className="text-blue-600 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/login?mode=register"
                    className={`w-full py-4 rounded-2xl font-black text-center transition-all ${plan.highlight ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-blue-700' : 'bg-gray-900 text-white hover:bg-black'}`}
                  >
                    Testar 7 dias Grátis
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <FAQ />

        {/* Bonus Section [NEW] */}
        <section className="py-24 bg-gray-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-black uppercase tracking-widest mb-6">
                <Diamond className="w-4 h-4" />
                Oferta por tempo limitado
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Bônus Exclusivos para Assinantes</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Fechando sua assinatura durante os 7 dias de teste, você recebe um pacote completo para acelerar seus resultados.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Kit de Divulgação Digital",
                  desc: "Artes prontas de QR Code para balcão e posts para Instagram. É só imprimir e começar a usar.",
                  icon: Download
                },
                {
                  title: "Guia Ouro no WhatsApp",
                  desc: "Aprenda a usar sua lista de contatos para lotar sua loja em dias de pouco movimento.",
                  icon: MessageCircle
                },
                {
                  title: "Onboarding VIP",
                  desc: "Consultoria inicial para definir as melhores regras de fidelidade para o seu nicho.",
                  icon: Users
                }
              ].map((bonus, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[2.5rem] transition-all hover:bg-white/10 hover:scale-[1.02]">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                    <bonus.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{bonus.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{bonus.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 bg-blue-600 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                Comece agora — <br /> comece grátis por 7 dias!
              </h2>
              <Link
                to="/login?mode=register"
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-12 py-6 rounded-[2rem] font-black text-2xl shadow-2xl hover:bg-gray-50 transition-all hover:scale-105 hover:-translate-y-1 mt-12 group"
              >
                <Rocket size={28} className="group-hover:animate-bounce" />
                Começar Agora
              </Link>
            </motion.div>
          </div>
          {/* Background circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-6 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Perguntas Frequentes</h2>
              <p className="text-xl text-gray-600">Tudo o que você precisa saber sobre o sistema de fidelização.</p>
            </div>
            <div className="space-y-6">
              {[
                {
                  q: "Preciso baixar algum aplicativo?",
                  a: "Não! O Fidelidade Digital funciona diretamente no navegador (Web App). Tanto você quanto seu cliente não precisam ocupar espaço no celular com novos aplicativos."
                },
                {
                  q: "Como o cliente recebe os pontos?",
                  a: "O cliente informa um código de 6 dígitos no balcão e os pontos são atribuídos instantaneamente. Ele pode acompanhar o saldo via WhatsApp ou link direto."
                },
                {
                  q: "Posso usar em mais de uma loja?",
                  a: "Sim! Nosso plano Ilimitado permite a gestão de múltiplas empresas e campanhas em um único painel."
                },
                {
                  q: "Como funciona o envio via WhatsApp?",
                  a: "O sistema gera notificações automáticas que podem ser enviadas para o cliente, mantendo-o engajado com sua marca."
                }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{item.q}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 px-6 bg-gray-900 text-center">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex items-center justify-center gap-2 text-white font-bold text-2xl">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Store className="w-6 h-6" />
            </div>
            <span>Fidelidade Digital</span>
          </div>
          <p className="text-gray-400 font-medium text-lg">
            © 2025 Fidelidade Digital - Todos os direitos reservados.
          </p>
          <div className="flex justify-center gap-12 text-sm text-gray-500 font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="https://wa.me/5521985899548" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
      <a
        href="https://wa.me/5521985899548?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20Fidelidade%20Digital"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[100] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all group active:scale-95"
        title="Suporte via WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Olá! Precisa de ajuda?
        </span>
      </a>
    </div >
  );
};
