import { useState } from "react";
import { useLocation } from "wouter";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Check, Crown, Star, Sparkles, CreditCard, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";

const plans = [
  {
    name: "MENSAL",
    price: "297",
    period: "/mês",
    icon: <Star className="w-6 h-6" />,
    features: [
      "Acesso à plataforma completa",
      "Carteira de investimentos",
      "Análises básicas de mercado",
      "Suporte por email",
      "Relatórios mensais",
      "App mobile completo"
    ]
  },
  {
    name: "SEMESTRAL",
    price: "1.497",
    period: "/6 meses",
    originalPrice: "1.782",
    savings: "Economia de R$ 285",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Tudo do plano Mensal",
      "Análises avançadas de mercado",
      "Consultoria mensal personalizada",
      "Alertas de oportunidades",
      "Suporte prioritário",
      "Acesso a webinars exclusivos"
    ],
    popular: true
  },
  {
    name: "ANUAL",
    price: "2.697",
    period: "/ano",
    originalPrice: "3.564",
    savings: "Economia de R$ 867",
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      "Tudo do plano Semestral",
      "Análises premium em tempo real",
      "Consultoria semanal dedicada",
      "Acesso a fundos exclusivos",
      "Suporte 24/7 VIP",
      "Relatórios personalizados",
      "Eventos presenciais VIP"
    ]
  }
];

// Mock data - plano atual do usuário
const currentSubscription = {
  plan: "SEMESTRAL",
  status: "active",
  startDate: "2026-01-10",
  endDate: "2026-07-10",
  nextBilling: "2026-07-10",
  amount: "1.497"
};

export default function SubscriptionPage() {
  const [, setLocation] = useLocation();
  const { logout } = useSimpleAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="flex min-h-screen bg-ivory">
      <DashboardSidebar onLogout={handleLogout} />

      <main className="flex-1 lg:ml-72 overflow-auto pt-16 lg:pt-0">
        {/* Header */}
        <header className="bg-cream border-b border-gold/20 p-4 md:p-6">
          <h1 
            className="text-2xl md:text-4xl font-bold text-charcoal mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Minha Assinatura
          </h1>
          <p className="text-sm md:text-base text-charcoal-light">Gerencie seu plano e pagamentos</p>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          {/* Current Subscription */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="luxury-card bg-gradient-to-br from-emerald-dark to-emerald p-8 rounded-sm"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 
                  className="text-3xl font-bold text-gold-light mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Plano {currentSubscription.plan}
                </h2>
                <p className="text-cream">Status: <span className="text-gold font-semibold">Ativo</span></p>
              </div>
              <div className="w-16 h-16 bg-gold/20 rounded-sm flex items-center justify-center">
                <Crown className="w-8 h-8 text-gold" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-gold" />
                  <p className="text-cream text-sm">Data de Início</p>
                </div>
                <p className="text-gold-light font-semibold">
                  {new Date(currentSubscription.startDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-gold" />
                  <p className="text-cream text-sm">Próxima Cobrança</p>
                </div>
                <p className="text-gold-light font-semibold">
                  {new Date(currentSubscription.nextBilling).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-gold" />
                  <p className="text-cream text-sm">Valor</p>
                </div>
                <p className="text-gold-light font-semibold">
                  R$ {currentSubscription.amount}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gold/30 flex gap-4">
              <button className="px-6 py-2.5 bg-gold text-emerald-dark rounded-sm font-semibold hover:bg-gold-light transition-colors">
                Alterar Forma de Pagamento
              </button>
              <button className="px-6 py-2.5 border-2 border-gold/30 text-cream rounded-sm font-semibold hover:border-gold hover:text-gold transition-colors">
                Cancelar Assinatura
              </button>
            </div>
          </motion.div>

          {/* Upgrade Options */}
          <div>
            <h2 
              className="text-3xl font-bold text-charcoal mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Alterar Plano
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, index) => {
                const isCurrent = plan.name === currentSubscription.plan;
                const isSelected = selectedPlan === plan.name;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      relative rounded-sm overflow-hidden cursor-pointer
                      ${plan.popular 
                        ? 'luxury-card bg-gradient-to-br from-emerald-dark to-emerald scale-105 shadow-2xl' 
                        : 'luxury-card bg-ivory border border-gold/30'
                      }
                      ${isSelected ? 'ring-4 ring-gold' : ''}
                      ${isCurrent ? 'opacity-50' : ''}
                    `}
                    onClick={() => !isCurrent && setSelectedPlan(plan.name)}
                  >
                    {/* Badge */}
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-gold text-charcoal px-4 py-1 text-xs font-bold tracking-wider">
                        MAIS POPULAR
                      </div>
                    )}

                    {isCurrent && (
                      <div className="absolute top-0 left-0 bg-green-600 text-white px-4 py-1 text-xs font-bold tracking-wider">
                        PLANO ATUAL
                      </div>
                    )}

                    <div className="p-6">
                      {/* Icon */}
                      <div className={`
                        w-14 h-14 rounded-sm flex items-center justify-center mb-6
                        ${plan.popular ? 'bg-gold text-emerald-dark' : 'bg-emerald text-gold'}
                      `}>
                        {plan.icon}
                      </div>

                      {/* Plan Name */}
                      <h3 
                        className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-gold-light' : 'text-charcoal'}`}
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {plan.name}
                      </h3>

                      {/* Price */}
                      <div className="mb-6">
                        {plan.originalPrice && (
                          <div>
                            <div className={`text-lg line-through mb-1 ${plan.popular ? 'text-cream/60' : 'text-charcoal/60'}`}>
                              R$ {plan.originalPrice}
                            </div>
                            <div className={`text-sm font-semibold mb-2 ${plan.popular ? 'text-gold' : 'text-green-600'}`}>
                              {plan.savings}
                            </div>
                          </div>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg ${plan.popular ? 'text-gold' : 'text-emerald'}`}>R$</span>
                          <span 
                            className={`text-4xl font-bold ${plan.popular ? 'text-gold-light' : 'text-charcoal'}`}
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {plan.price}
                          </span>
                          <span className={`text-lg ${plan.popular ? 'text-cream' : 'text-charcoal-light'}`}>
                            {plan.period}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-gold' : 'text-emerald'}`} />
                            <span className={`text-sm ${plan.popular ? 'text-cream' : 'text-charcoal'}`}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      {!isCurrent && (
                        <button 
                          className={`
                            w-full py-3 rounded-sm font-bold tracking-wider transition-all duration-300
                            ${plan.popular 
                              ? 'bg-gold text-emerald-dark hover:bg-gold-light shadow-lg' 
                              : 'glow-button'
                            }
                          `}
                        >
                          {isSelected ? 'SELECIONADO' : 'SELECIONAR PLANO'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 luxury-card bg-cream p-8 rounded-sm border border-gold/30"
              >
                <h3 
                  className="text-2xl font-bold text-charcoal mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Confirmar Alteração de Plano
                </h3>
                <p className="text-charcoal-light mb-6">
                  Você está prestes a alterar seu plano de <span className="font-semibold text-charcoal">{currentSubscription.plan}</span> para <span className="font-semibold text-emerald">{selectedPlan}</span>.
                </p>
                <div className="flex gap-4">
                  <button className="glow-button px-8 py-3 rounded-sm font-bold tracking-wider">
                    CONFIRMAR ALTERAÇÃO
                  </button>
                  <button 
                    onClick={() => setSelectedPlan(null)}
                    className="px-8 py-3 border-2 border-charcoal/20 text-charcoal rounded-sm font-semibold hover:border-charcoal transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Payment History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="luxury-card bg-ivory p-6 rounded-sm border border-gold/30"
          >
            <h2 
              className="text-2xl font-bold text-charcoal mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Histórico de Pagamentos
            </h2>
            <div className="space-y-3">
              {[
                { date: "2026-01-10", plan: "SEMESTRAL", amount: "1.497", status: "Pago" },
                { date: "2025-07-10", plan: "SEMESTRAL", amount: "1.497", status: "Pago" },
                { date: "2025-01-10", plan: "MENSAL", amount: "297", status: "Pago" }
              ].map((payment, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-cream rounded-sm"
                >
                  <div>
                    <p className="font-semibold text-charcoal">{payment.plan}</p>
                    <p className="text-sm text-charcoal-light">{new Date(payment.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-charcoal">R$ {payment.amount}</p>
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded">
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
