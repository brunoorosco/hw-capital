import { Link } from "wouter";
import { Check, Crown, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import type { Plan } from "@/types";

const plans: Plan[] = [
  {
    name: "ESSENCIAL",
    price: "500",
    period: "/mês",
    description: "Ideal para começar com organização",
    icon: <Star className="w-6 h-6" />,
    features: [
      "Conciliação bancária",
      "Contas a pagar e a receber",
      "Fluxo de caixa",
      "Relatório financeiro mensal",
    ],
    highlighted: false,
    badge: null,
  },
  {
    name: "GESTÃO COMPLETA",
    price: "1.000",
    period: "/mês",
    description: "Controle total do seu negócio",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Tudo do Plano Essencial",
      "Relatórios gerenciais",
      "DRE simplificada",
      "Suporte estratégico para decisões financeiras",
    ],
    highlighted: true,
    badge: "MAIS POPULAR",
  },
  {
    name: "PREMIUM",
    price: "2.000",
    period: "/mês",
    description: "Gestão estratégica completa",
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      "Tudo do Plano Gestão Completa",
      "Consultoria financeira",
      "Planejamento financeiro",
      "Reuniões mensais de alinhamento",
      "Análise de indicadores financeiros",
      "Suporte prioritário",
    ],
    highlighted: false,
    badge: "COMPLETO",
  },
];

export default function PricingPage() {
  const { isAuthenticated } = useSimpleAuth();

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-emerald-dark/90 border-b-2 border-gold">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <Link href="/">
            <div
              className="text-xl md:text-3xl font-bold text-gold-light cursor-pointer"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              HW CAPITAL
            </div>
          </Link>
          <nav className="flex gap-3 md:gap-8 items-center">
            <Link href="/" className="hidden sm:block">
              <a className="text-cream hover:text-gold transition-colors duration-300 font-medium">
                Início
              </a>
            </Link>
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              <button className="glow-button px-3 md:px-6 py-2 md:py-2.5 rounded-sm font-semibold tracking-wide text-xs md:text-base">
                {isAuthenticated ? (
                  <>
                    <span className="hidden md:inline">IR PARA DASHBOARD</span>
                    <span className="md:hidden">DASHBOARD</span>
                  </>
                ) : (
                  <>
                    <span className="hidden md:inline">
                      ACESSAR ÁREA LOGADA
                    </span>
                    <span className="md:hidden">LOGIN</span>
                  </>
                )}
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-emerald-dark to-charcoal text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 deco-pattern"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-gold-light mb-4 md:mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Planos de BPO Financeiro
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-cream max-w-2xl mx-auto px-4"
          >
            Gestão financeira profissional para que você tenha controle, clareza
            e mais tempo para crescer
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 md:py-20 -mt-8 md:-mt-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto mb-8 md:mb-12">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className={`
                  relative rounded-sm overflow-hidden
                  ${
                    plan.highlighted
                      ? "luxury-card bg-gradient-to-br from-emerald-dark to-emerald scale-105 shadow-2xl z-10"
                      : "luxury-card bg-ivory border border-gold/30"
                  }
                `}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-gold text-charcoal px-4 py-1 text-xs font-bold tracking-wider">
                    {plan.badge}
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div
                    className={`
                    w-14 h-14 rounded-sm flex items-center justify-center mb-6
                    ${plan.highlighted ? "bg-gold text-emerald-dark" : "bg-emerald text-gold"}
                  `}
                  >
                    {plan.icon}
                  </div>

                  {/* Plan Name */}
                  <h3
                    className={`text-2xl font-bold mb-2 ${plan.highlighted ? "text-gold-light" : "text-charcoal"}`}
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-sm mb-6 ${plan.highlighted ? "text-cream" : "text-charcoal-light"}`}
                  >
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    {plan?.originalPrice && (
                      <div
                        className={`text-lg line-through mb-1 ${plan.highlighted ? "text-cream/60" : "text-charcoal/60"}`}
                      >
                        R$ {plan?.originalPrice}
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-lg ${plan.highlighted ? "text-gold" : "text-emerald"}`}
                      >
                        R$
                      </span>
                      <span
                        className={`text-5xl font-bold ${plan.highlighted ? "text-gold-light" : "text-charcoal"}`}
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={`text-lg ${plan.highlighted ? "text-cream" : "text-charcoal-light"}`}
                      >
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlighted ? "text-gold" : "text-emerald"}`}
                        />
                        <span
                          className={`text-sm ${plan.highlighted ? "text-cream" : "text-charcoal"}`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={
                      isAuthenticated ? "/dashboard/subscription" : "/login"
                    }
                  >
                    <button
                      className={`
                        w-full py-4 rounded-sm font-bold tracking-wider transition-all duration-300
                        ${
                          plan.highlighted
                            ? "bg-gold text-emerald-dark hover:bg-gold-light shadow-lg hover:shadow-xl"
                            : "glow-button"
                        }
                      `}
                    >
                      {isAuthenticated ? "ESCOLHER PLANO" : "COMEÇAR AGORA"}
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Plano Personalizado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-4xl mx-auto mt-12"
          >
            <div className="luxury-card bg-gradient-to-br from-charcoal to-charcoal-light p-8 rounded-sm border-2 border-gold">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-gold" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3
                    className="text-3xl font-bold text-gold-light mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Plano Personalizado
                  </h3>
                  <p className="text-cream mb-4">
                    Desenvolvido sob medida, de acordo com o porte, segmento e
                    necessidade específica da sua empresa.
                  </p>
                  <p className="text-gold text-sm">
                    💡 Escopo e valor definidos após diagnóstico financeiro
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <a
                    href="https://wa.me/5511981142921?text=Olá! Gostaria de saber mais sobre o Plano Personalizado da HW Capital."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glow-button px-8 py-4 rounded-sm font-bold tracking-wider inline-block"
                  >
                    FALE CONOSCO
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-12 md:py-20 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <h2
            className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-charcoal"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Por Que Escolher a HW Capital?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Transparência Total",
                description:
                  "Sem taxas escondidas. Planos com valores fixos mensais e escopo bem definido.",
              },
              {
                title: "Flexibilidade",
                description:
                  "Ajuste seu plano conforme seu negócio cresce, sem burocracia.",
              },
              {
                title: "Suporte Especializado",
                description:
                  "Profissionais qualificados em gestão financeira prontos para apoiar sua empresa.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <h3
                  className="text-xl font-bold mb-3 text-emerald"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-charcoal-light">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2
            className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-charcoal"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Perguntas Frequentes
          </h2>

          <div className="space-y-6">
            {[
              {
                question: "Posso mudar de plano depois?",
                answer:
                  "Sim! Você pode fazer upgrade ou downgrade conforme as necessidades do seu negócio mudarem.",
              },
              {
                question: "Quais formas de pagamento são aceitas?",
                answer:
                  "Aceitamos boleto, PIX, transferência bancária e cartão de crédito.",
              },
              {
                question: "Como funciona o Plano Personalizado?",
                answer:
                  "Desenvolvemos um plano sob medida após diagnóstico financeiro da sua empresa, considerando porte, segmento e necessidades específicas.",
              },
              {
                question: "Qual o prazo de implementação?",
                answer:
                  "Normalmente começamos o trabalho em até 5 dias úteis após a contratação e alinhamento inicial.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="luxury-card bg-ivory p-6 rounded-sm border border-gold/20"
              >
                <h3
                  className="text-lg font-bold mb-2 text-emerald"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {faq.question}
                </h3>
                <p className="text-charcoal-light">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 deco-pattern"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h2
            className="text-5xl font-bold text-gold-light mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Precisa de um Plano Personalizado?
          </h2>
          <p className="text-xl text-cream mb-10 max-w-2xl mx-auto">
            Entre em contato para um diagnóstico financeiro e proposta sob
            medida para sua empresa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <a
              href="https://wa.me/5511981142921?text=Olá! Gostaria de conhecer os planos da HW Capital."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto glow-button pulse-cta px-6 md:px-12 py-4 md:py-5 rounded-sm text-base md:text-xl font-bold tracking-wider inline-block text-center"
            >
              FALAR NO WHATSAPP
            </a>
            <Link href={isAuthenticated ? "/dashboard/subscription" : "/login"}>
              <button className="w-full sm:w-auto px-6 md:px-12 py-4 md:py-5 border-2 border-gold text-gold hover:bg-gold hover:text-emerald-dark rounded-sm text-base md:text-xl font-bold tracking-wider transition-all duration-300">
                {isAuthenticated ? "ACESSAR PAINEL" : "ÁREA DO CLIENTE"}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-dark border-t-2 border-gold py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <div
                className="text-3xl font-bold text-gold-light mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                HW CAPITAL
              </div>
              <div className="text-cream text-sm space-y-1">
                <p>📞 WhatsApp: (11) 98114-2921</p>
                <p>📧 contato@hwcapital.com.br</p>
              </div>
            </div>
            <div className="text-cream text-sm">
              © 2026 HW Capital. BPO Financeiro Premium.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
