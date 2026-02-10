import { useState } from "react";
import { useLocation } from "wouter";
import DashboardSidebar from "@/components/DashboardSidebar";
import { TrendingUp, TrendingDown, DollarSign, Search, Filter, Plus, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";

interface Investment {
  id: string;
  name: string;
  type: "acao" | "fii" | "renda_fixa" | "cripto" | "fundo";
  ticker: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
  lastUpdate: string;
}

// Mock data
const investments: Investment[] = [
  {
    id: "1",
    name: "Petrobras PN",
    type: "acao",
    ticker: "PETR4",
    quantity: 200,
    avgPrice: 28.50,
    currentPrice: 32.40,
    totalInvested: 5700,
    currentValue: 6480,
    profit: 780,
    profitPercentage: 13.68,
    lastUpdate: "2026-02-09"
  },
  {
    id: "2",
    name: "Vale ON",
    type: "acao",
    ticker: "VALE3",
    quantity: 150,
    avgPrice: 65.20,
    currentPrice: 68.90,
    totalInvested: 9780,
    currentValue: 10335,
    profit: 555,
    profitPercentage: 5.67,
    lastUpdate: "2026-02-09"
  },
  {
    id: "3",
    name: "HGLG11",
    type: "fii",
    ticker: "HGLG11",
    quantity: 100,
    avgPrice: 165.00,
    currentPrice: 172.50,
    totalInvested: 16500,
    currentValue: 17250,
    profit: 750,
    profitPercentage: 4.55,
    lastUpdate: "2026-02-09"
  },
  {
    id: "4",
    name: "CDB Banco Inter",
    type: "renda_fixa",
    ticker: "CDB-INTER",
    quantity: 1,
    avgPrice: 50000,
    currentPrice: 52450,
    totalInvested: 50000,
    currentValue: 52450,
    profit: 2450,
    profitPercentage: 4.90,
    lastUpdate: "2026-02-09"
  },
  {
    id: "5",
    name: "Tesouro Selic 2029",
    type: "renda_fixa",
    ticker: "SELIC-2029",
    quantity: 5,
    avgPrice: 10200,
    currentPrice: 10485,
    totalInvested: 51000,
    currentValue: 52425,
    profit: 1425,
    profitPercentage: 2.79,
    lastUpdate: "2026-02-09"
  },
  {
    id: "6",
    name: "Bitcoin",
    type: "cripto",
    ticker: "BTC",
    quantity: 0.15,
    avgPrice: 280000,
    currentPrice: 320000,
    totalInvested: 42000,
    currentValue: 48000,
    profit: 6000,
    profitPercentage: 14.29,
    lastUpdate: "2026-02-09"
  }
];

const typeLabels = {
  acao: "Ação",
  fii: "FII",
  renda_fixa: "Renda Fixa",
  cripto: "Cripto",
  fundo: "Fundo"
};

const typeColors = {
  acao: "blue-600",
  fii: "purple-600",
  renda_fixa: "green-600",
  cripto: "orange-600",
  fundo: "indigo-600"
};

export default function InvestmentsPage() {
  const [, setLocation] = useLocation();
  const { logout } = useSimpleAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const filteredInvestments = investments.filter(inv => {
    const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || inv.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalProfit = totalCurrent - totalInvested;
  const totalProfitPercentage = (totalProfit / totalInvested) * 100;

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
                Meus Investimentos
              </h1>
              <p className="text-sm md:text-base text-charcoal-light">Acompanhe seus ativos e rentabilidade</p>
            </div>
            <button className="glow-button px-4 md:px-6 py-3 rounded-sm font-bold tracking-wider flex items-center gap-2 text-sm md:text-base">
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">NOVO INVESTIMENTO</span>
              <span className="sm:hidden">NOVO</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="luxury-card bg-gradient-to-br from-emerald-dark to-emerald p-6 rounded-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gold/20 rounded-sm flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-gold" />
                </div>
              </div>
              <p className="text-cream text-sm mb-1">Total Investido</p>
              <p className="text-3xl font-bold text-gold-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="luxury-card bg-ivory p-6 rounded-sm border border-gold/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald/10 rounded-sm flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald" />
                </div>
              </div>
              <p className="text-charcoal-light text-sm mb-1">Valor Atual</p>
              <p className="text-3xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                R$ {totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="luxury-card bg-ivory p-6 rounded-sm border border-gold/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-sm flex items-center justify-center">
                  {totalProfit >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
              <p className="text-charcoal-light text-sm mb-1">Lucro/Prejuízo</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                  R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className={`text-lg font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({totalProfit >= 0 ? '+' : ''}{totalProfitPercentage.toFixed(2)}%)
                </span>
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="luxury-card bg-ivory p-6 rounded-sm border border-gold/30"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-light" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou ticker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gold/30 rounded-sm bg-cream focus:border-gold focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-charcoal-light" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border-2 border-gold/30 rounded-sm bg-cream focus:border-gold focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="acao">Ações</option>
                  <option value="fii">FIIs</option>
                  <option value="renda_fixa">Renda Fixa</option>
                  <option value="cripto">Criptomoedas</option>
                  <option value="fundo">Fundos</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Investments Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="luxury-card bg-ivory rounded-sm border border-gold/30 overflow-hidden"
          >
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-[800px]">
                <thead className="bg-cream border-b border-gold/20">
                  <tr>
                    <th className="text-left p-3 md:p-4 font-semibold text-charcoal text-sm md:text-base">Ativo</th>
                    <th className="text-left p-4 font-semibold text-charcoal">Tipo</th>
                    <th className="text-right p-4 font-semibold text-charcoal">Quantidade</th>
                    <th className="text-right p-4 font-semibold text-charcoal">Preço Médio</th>
                    <th className="text-right p-4 font-semibold text-charcoal">Preço Atual</th>
                    <th className="text-right p-4 font-semibold text-charcoal">Total Investido</th>
                    <th className="text-right p-4 font-semibold text-charcoal">Valor Atual</th>
                    <th className="text-right p-4 font-semibold text-charcoal">Lucro/Prejuízo</th>
                    <th className="text-center p-4 font-semibold text-charcoal">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestments.map((investment, index) => (
                    <motion.tr
                      key={investment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="border-b border-gold/10 hover:bg-cream/50 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-charcoal">{investment.ticker}</p>
                          <p className="text-sm text-charcoal-light">{investment.name}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${typeColors[investment.type]}/10 text-${typeColors[investment.type]}`}>
                          {typeLabels[investment.type]}
                        </span>
                      </td>
                      <td className="p-4 text-right text-charcoal">
                        {investment.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}
                      </td>
                      <td className="p-4 text-right text-charcoal">
                        R$ {investment.avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right text-charcoal">
                        R$ {investment.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right text-charcoal font-semibold">
                        R$ {investment.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right text-charcoal font-semibold">
                        R$ {investment.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right">
                        <div className={`font-semibold ${investment.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <p>R$ {investment.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          <p className="text-sm">
                            ({investment.profit >= 0 ? '+' : ''}{investment.profitPercentage.toFixed(2)}%)
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button className="p-2 hover:bg-gold/10 rounded-sm transition-colors">
                          <Eye className="w-5 h-5 text-charcoal-light" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredInvestments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-charcoal-light">Nenhum investimento encontrado</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
