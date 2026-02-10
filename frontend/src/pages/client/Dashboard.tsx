import { useLocation } from "wouter";
import DashboardSidebar from "@/components/DashboardSidebar";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";

// Mock data - em produção viria de uma API
const portfolioData = {
  totalInvested: 150000,
  currentValue: 187500,
  profit: 37500,
  profitPercentage: 25,
  assets: [
    { name: "Ações Brasileiras", value: 62500, percentage: 33.3, change: 12.5, type: "stocks" },
    { name: "Ações Internacionais", value: 50000, percentage: 26.7, change: 18.2, type: "stocks" },
    { name: "Fundos Imobiliários", value: 37500, percentage: 20, change: 8.3, type: "funds" },
    { name: "Renda Fixa", value: 25000, percentage: 13.3, change: 5.1, type: "fixed" },
    { name: "Criptomoedas", value: 12500, percentage: 6.7, change: 45.8, type: "crypto" }
  ],
  recentTransactions: [
    { date: "2026-02-08", type: "Compra", asset: "PETR4", value: 5000, status: "completed" },
    { date: "2026-02-07", type: "Venda", asset: "VALE3", value: 3500, status: "completed" },
    { date: "2026-02-05", type: "Dividendo", asset: "ITUB4", value: 850, status: "completed" },
    { date: "2026-02-03", type: "Compra", asset: "AAPL", value: 8000, status: "pending" }
  ]
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { logout } = useSimpleAuth();

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
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 
                className="text-2xl md:text-4xl font-bold text-charcoal mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Minha Carteira
              </h1>
              <p className="text-sm md:text-base text-charcoal-light">Visão geral dos seus investimentos</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-charcoal-light">Última atualização</p>
                <p className="text-sm font-semibold text-emerald">Agora</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="luxury-card bg-gradient-to-br from-emerald-dark to-emerald p-6 rounded-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gold/20 rounded-sm flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-gold" />
                </div>
                <span className="text-xs font-semibold text-gold bg-gold/20 px-2 py-1 rounded">TOTAL</span>
              </div>
              <p className="text-cream text-sm mb-1">Valor Investido</p>
              <p className="text-3xl font-bold text-gold-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                R$ {portfolioData.totalInvested.toLocaleString('pt-BR')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="luxury-card bg-ivory p-6 rounded-sm border border-gold/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald/10 rounded-sm flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald" />
                </div>
              </div>
              <p className="text-charcoal-light text-sm mb-1">Valor Atual</p>
              <p className="text-3xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                R$ {portfolioData.currentValue.toLocaleString('pt-BR')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="luxury-card bg-ivory p-6 rounded-sm border border-gold/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-sm flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-charcoal-light text-sm mb-1">Rendimento</p>
              <p className="text-3xl font-bold text-green-600" style={{ fontFamily: "'Playfair Display', serif" }}>
                R$ {portfolioData.profit.toLocaleString('pt-BR')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="luxury-card bg-ivory p-6 rounded-sm border border-gold/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-sm flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-charcoal-light text-sm mb-1">Rentabilidade</p>
              <p className="text-3xl font-bold text-green-600" style={{ fontFamily: "'Playfair Display', serif" }}>
                +{portfolioData.profitPercentage}%
              </p>
            </motion.div>
          </div>

          {/* Assets Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="luxury-card bg-ivory p-6 rounded-sm border border-gold/30"
            >
              <h2 
                className="text-2xl font-bold text-charcoal mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Distribuição de Ativos
              </h2>
              <div className="space-y-4">
                {portfolioData.assets.map((asset, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-charcoal">{asset.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-charcoal-light">{asset.percentage}%</span>
                        <span className={`text-sm font-semibold flex items-center gap-1 ${asset.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {asset.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {asset.change > 0 ? '+' : ''}{asset.change}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-cream rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${asset.percentage}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-gold-dark to-gold"
                        />
                      </div>
                      <span className="text-sm font-semibold text-charcoal w-32 text-right">
                        R$ {asset.value.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="luxury-card bg-ivory p-6 rounded-sm border border-gold/30"
            >
              <h2 
                className="text-2xl font-bold text-charcoal mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Transações Recentes
              </h2>
              <div className="space-y-4">
                {portfolioData.recentTransactions.map((transaction, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-cream rounded-sm hover:bg-gold/10 transition-colors duration-300"
                  >
                    <div>
                      <p className="font-semibold text-charcoal">{transaction.asset}</p>
                      <p className="text-sm text-charcoal-light">{transaction.type} · {transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-charcoal">
                        R$ {transaction.value.toLocaleString('pt-BR')}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {transaction.status === 'completed' ? 'Concluída' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Performance Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="luxury-card bg-ivory p-6 rounded-sm border border-gold/30"
          >
            <h2 
              className="text-2xl font-bold text-charcoal mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Performance dos Últimos 12 Meses
            </h2>
            <div className="h-64 flex items-center justify-center bg-cream rounded-sm">
              <p className="text-charcoal-light">Gráfico de performance será implementado aqui</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
