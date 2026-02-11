import { Link, useLocation } from "wouter";
import { TrendingUp, Shield, Zap, BarChart3, Lock, Globe, ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccessType } from "@/contexts/AccessTypeContext";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { setAccessType } = useAccessType();
  const [, setLocation] = useLocation();

  const handleAccessClick = (type: "investimentos" | "bpo") => {
    setAccessType(type);
    if (isAuthenticated) {
      setLocation(type === "investimentos" ? "/dashboard" : "/bpo/dashboard");
    } else {
      setLocation("/login");
    }
  };

  return (
    <div className="min-h-screen bg-ivory deco-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-emerald-dark/90 border-b-2 border-gold">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl md:text-3xl font-bold text-gold-light"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            HW CAPITAL
          </motion.div>
          <nav className="flex gap-3 md:gap-8 items-center">
            <a href="#features" className="hidden md:block text-cream hover:text-gold transition-colors duration-300 font-medium">
              Vantagens
            </a>
            <Link href="/pricing" className="hidden sm:block">
              <a className="text-cream hover:text-gold transition-colors duration-300 font-medium">
                Planos
              </a>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="glow-button px-3 md:px-6 py-2 md:py-2.5 rounded-sm font-semibold tracking-wide text-xs md:text-base">
                  <span className="hidden md:inline">ACESSAR</span>
                  <span className="md:hidden">ENTRAR</span>
                  <ChevronDown className="inline-block ml-1 md:ml-2 w-3 md:w-4 h-3 md:h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-emerald-dark border-gold/30">
                <DropdownMenuItem 
                  onClick={() => handleAccessClick("investimentos")}
                  className="text-cream hover:bg-emerald-light hover:text-gold cursor-pointer py-3 font-medium"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Investimentos
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAccessClick("bpo")}
                  className="text-cream hover:bg-emerald-light hover:text-gold cursor-pointer py-3 font-medium"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  BPO Financeiro
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 md:top-20 left-5 md:left-20 w-32 md:w-64 h-32 md:h-64 border-2 border-gold rotate-45 animate-pulse"></div>
          <div className="absolute bottom-10 md:bottom-20 right-5 md:right-20 w-48 md:w-96 h-48 md:h-96 border-2 border-emerald rotate-12 animate-pulse delay-300"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <h1 
                className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 md:mb-6 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                BPO Financeiro de
                <br />
                <span className="gold-shimmer">Elite</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-charcoal mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
            >
              Cuidamos da gestão financeira do seu negócio para que você tenha 
              controle, clareza e mais tempo para crescer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4"
            >
              <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                <button className="w-full sm:w-auto glow-button pulse-cta px-6 md:px-10 py-3 md:py-4 rounded-sm text-base md:text-lg font-bold tracking-wider relative z-10">
                  {isAuthenticated ? "IR PARA DASHBOARD" : "COMEÇAR AGORA"}
                  <ArrowRight className="inline-block ml-2 w-4 md:w-5 h-4 md:h-5" />
                </button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <button className="w-full px-6 md:px-10 py-3 md:py-4 border-2 border-emerald text-emerald-dark hover:bg-emerald hover:text-ivory rounded-sm text-base md:text-lg font-semibold transition-all duration-300">
                  CONHECER MAIS
                </button>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-gold animate-bounce" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-12 md:py-20 bg-emerald-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 deco-pattern"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            {[
              { number: "500+", label: "Empresas Atendidas" },
              { number: "15+", label: "Anos de Experiência" },
              { number: "98%", label: "Taxa de Satisfação" },
              { number: "24/7", label: "Suporte Disponível" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="elegant-number mb-2">{stat.number}</div>
                <div className="text-cream text-lg tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-24 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-16">
            <h2 
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-charcoal mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Por Que Escolher a <span className="text-gold">HW Capital</span>
            </h2>
            <div className="geometric-divider w-32 mx-auto mt-8"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Conciliação Bancária",
                description: "Controle total sobre suas movimentações bancárias com precisão e agilidade."
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Fluxo de Caixa",
                description: "Gestão eficiente do seu capital de giro para decisões mais assertivas."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Relatórios Gerenciais",
                description: "Análises detalhadas e DRE para total visibilidade do negócio."
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Contas a Pagar e Receber",
                description: "Organização completa das suas obrigações e recebimentos."
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Planejamento Financeiro",
                description: "Estratégias personalizadas para o crescimento sustentável da empresa."
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: "Consultoria Estratégica",
                description: "Suporte especializado para decisões financeiras importantes."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="luxury-card bg-ivory p-8 rounded-sm corner-accent"
              >
                <div className="w-16 h-16 bg-emerald text-gold rounded-sm flex items-center justify-center mb-6 shadow-lg">
                  {feature.icon}
                </div>
                <h3 
                  className="text-2xl font-bold mb-3 text-charcoal"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {feature.title}
                </h3>
                <p className="text-charcoal-light leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="deco-pattern h-full"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 
            className="text-5xl font-bold text-gold-light mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Pronto para Transformar sua Gestão Financeira?
          </h2>
          <p className="text-xl text-cream mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que confiam na HW Capital para ter controle total das finanças.
          </p>
          <Link href={isAuthenticated ? "/dashboard" : "/login"}>
            <button className="glow-button pulse-cta px-12 py-5 rounded-sm text-xl font-bold tracking-wider">
              {isAuthenticated ? "ACESSAR DASHBOARD" : "COMEÇAR GRATUITAMENTE"}
            </button>
          </Link>
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
