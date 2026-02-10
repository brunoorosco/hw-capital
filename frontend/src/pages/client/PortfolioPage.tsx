import { useState } from "react";
import { useLocation } from "wouter";
import DashboardSidebar from "@/components/DashboardSidebar";
import { PieChart, Target, AlertCircle, CheckCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";

interface PortfolioAsset {
  type: string;
  percentage: number;
  value: number;
  color: string;
}

interface RecommendedPortfolio {
  id: string;
  name: string;
  profile: "conservador" | "moderado" | "arrojado";
  description: string;
  expectedReturn: string;
  risk: string;
  allocation: PortfolioAsset[];
}

// Carteira atual do usuário
const currentPortfolio: PortfolioAsset[] = [
  { type: "Ações Nacionais", percentage: 35, value: 65625, color: "#1B4D3E" },
  { type: "Renda Fixa", percentage: 40, value: 75000, color: "#D4AF37" },
  { type: "Fundos Imobiliários", percentage: 15, value: 28125, color: "#B8941F" },
  { type: "Criptomoedas", percentage: 10, value: 18750, color: "#2D6B5A" }
];

// Carteiras recomendadas
const recommendedPortfolios: RecommendedPortfolio[] = [
  {
    id: "1",
    name: "Carteira Conservadora",
    profile: "conservador",
    description: "Ideal para quem prioriza segurança e previsibilidade dos retornos",
    expectedReturn: "8-12% ao ano",
    risk: "Baixo",
    allocation: [
      { type: "Renda Fixa (CDB, Tesouro)", percentage: 70, value: 131250, color: "#1B4D3E" },
      { type: "Fundos DI", percentage: 15, value: 28125, color: "#D4AF37" },
      { type: "Fundos Imobiliários", percentage: 10, value: 18750, color: "#B8941F" },
      { type: "Ações Blue Chip", percentage: 5, value: 9375, color: "#2D6B5A" }
    ]
  },
  {
    id: "2",
    name: "Carteira Moderada",
    profile: "moderado",
    description: "Equilíbrio entre segurança e potencial de crescimento",
    expectedReturn: "12-18% ao ano",
    risk: "Médio",
    allocation: [
      { type: "Renda Fixa", percentage: 40, value: 75000, color: "#1B4D3E" },
      { type: "Ações Nacionais", percentage: 30, value: 56250, color: "#D4AF37" },
      { type: "Fundos Imobiliários", percentage: 20, value: 37500, color: "#B8941F" },
      { type: "Fundos Multimercado", percentage: 10, value: 18750, color: "#2D6B5A" }
    ]
  },
  {
    id: "3",
    name: "Carteira Arrojada",
    profile: "arrojado",
    description: "Foco em maximizar retornos com maior exposição a risco",
    expectedReturn: "18-25% ao ano",
    risk: "Alto",
    allocation: [
      { type: "Ações Nacionais", percentage: 40, value: 75000, color: "#1B4D3E" },
      { type: "Ações Internacionais", percentage: 25, value: 46875, color: "#D4AF37" },
      { type: "Fundos Multimercado", percentage: 15, value: 28125, color: "#B8941F" },
      { type: "Renda Fixa", percentage: 10, value: 18750, color: "#2D6B5A" },
      { type: "Criptomoedas", percentage: 10, value: 18750, color: "#CD7F32" }
    ]
  }
];

export default function PortfolioPage() {
  const [, setLocation] = useLocation();
  const { logout } = useSimpleAuth();
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const totalValue = currentPortfolio.reduce((sum, asset) => sum + asset.value, 0);

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
            Minha Carteira
          </h1>
          <p className="text-sm md:text-base text-charcoal-light">Visualize e otimize sua alocação de ativos</p>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          {/* Carteira Atual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="luxury-card bg-ivory p-8 rounded-sm border border-gold/30"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 
                className="text-3xl font-bold text-charcoal"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Carteira Atual
              </h2>
              <div className="text-right">
                <p className="text-sm text-charcoal-light">Valor Total</p>
                <p className="text-3xl font-bold text-emerald" style={{ fontFamily: "'Playfair Display', serif" }}>
                  R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Gráfico Visual (simplificado) */}
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 200 200" className="transform -rotate-90">
                    {currentPortfolio.reduce((acc, asset, index) => {
                      const start = acc.offset;
                      const size = (asset.percentage / 100) * 360;
                      const end = start + size;
                      
                      const startAngle = (start * Math.PI) / 180;
                      const endAngle = (end * Math.PI) / 180;
                      
                      const x1 = 100 + 80 * Math.cos(startAngle);
                      const y1 = 100 + 80 * Math.sin(startAngle);
                      const x2 = 100 + 80 * Math.cos(endAngle);
                      const y2 = 100 + 80 * Math.sin(endAngle);
                      
                      const largeArc = size > 180 ? 1 : 0;
                      
                      acc.elements.push(
                        <path
                          key={index}
                          d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={asset.color}
                          className="transition-all duration-300 hover:opacity-80"
                        />
                      );
                      
                      acc.offset = end;
                      return acc;
                    }, { elements: [] as React.JSX.Element[], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PieChart className="w-12 h-12 text-gold" />
                  </div>
                </div>
              </div>

              {/* Lista de Ativos */}
              <div className="space-y-4">
                {currentPortfolio.map((asset, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-cream rounded-sm border border-gold/20"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      />
                      <div>
                        <p className="font-semibold text-charcoal">{asset.type}</p>
                        <p className="text-sm text-charcoal-light">
                          R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald">
                        {asset.percentage}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Carteiras Recomendadas */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-gold" />
              <h2 
                className="text-3xl font-bold text-charcoal"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Carteiras Recomendadas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedPortfolios.map((portfolio, index) => (
                <motion.div
                  key={portfolio.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`
                    luxury-card rounded-sm cursor-pointer transition-all duration-300
                    ${selectedPortfolio === portfolio.id 
                      ? 'bg-gradient-to-br from-emerald-dark to-emerald scale-105 shadow-2xl' 
                      : 'bg-ivory border border-gold/30 hover:border-gold'
                    }
                  `}
                  onClick={() => setSelectedPortfolio(portfolio.id)}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 
                          className={`text-2xl font-bold ${selectedPortfolio === portfolio.id ? 'text-gold-light' : 'text-charcoal'}`}
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {portfolio.name}
                        </h3>
                        {selectedPortfolio === portfolio.id && (
                          <CheckCircle className="w-6 h-6 text-gold" />
                        )}
                      </div>
                      <p className={`text-sm ${selectedPortfolio === portfolio.id ? 'text-cream' : 'text-charcoal-light'}`}>
                        {portfolio.description}
                      </p>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-cream/10 rounded-sm">
                      <div>
                        <p className={`text-xs mb-1 ${selectedPortfolio === portfolio.id ? 'text-cream/70' : 'text-charcoal-light'}`}>
                          Retorno Esperado
                        </p>
                        <p className={`font-bold ${selectedPortfolio === portfolio.id ? 'text-gold' : 'text-emerald'}`}>
                          {portfolio.expectedReturn}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs mb-1 ${selectedPortfolio === portfolio.id ? 'text-cream/70' : 'text-charcoal-light'}`}>
                          Risco
                        </p>
                        <p className={`font-bold ${selectedPortfolio === portfolio.id ? 'text-gold' : 'text-charcoal'}`}>
                          {portfolio.risk}
                        </p>
                      </div>
                    </div>

                    {/* Alocação */}
                    <div className="space-y-2">
                      <p className={`text-sm font-semibold mb-3 ${selectedPortfolio === portfolio.id ? 'text-cream' : 'text-charcoal'}`}>
                        Alocação:
                      </p>
                      {portfolio.allocation.map((asset, assetIndex) => (
                        <div key={assetIndex} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className={selectedPortfolio === portfolio.id ? 'text-cream' : 'text-charcoal'}>
                              {asset.type}
                            </span>
                            <span className={`font-semibold ${selectedPortfolio === portfolio.id ? 'text-gold' : 'text-emerald'}`}>
                              {asset.percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-cream/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-gold-dark to-gold transition-all duration-500"
                              style={{ width: `${asset.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <button 
                      className={`
                        w-full mt-6 py-3 rounded-sm font-bold tracking-wider transition-all duration-300
                        ${selectedPortfolio === portfolio.id
                          ? 'bg-gold text-emerald-dark hover:bg-gold-light'
                          : 'bg-emerald text-gold hover:bg-emerald-light'
                        }
                      `}
                    >
                      {selectedPortfolio === portfolio.id ? 'APLICAR ESTA CARTEIRA' : 'SELECIONAR'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Alerta de Rebalanceamento */}
          {selectedPortfolio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="luxury-card bg-gradient-to-r from-gold/10 to-gold/5 p-6 rounded-sm border-2 border-gold/30"
            >
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-charcoal mb-2">
                    Carteira Selecionada: {recommendedPortfolios.find(p => p.id === selectedPortfolio)?.name}
                  </h3>
                  <p className="text-charcoal-light mb-4">
                    Para aplicar esta carteira, será necessário rebalancear seus investimentos atuais. 
                    Nossa equipe entrará em contato para auxiliar no processo de transição.
                  </p>
                  <div className="flex gap-4">
                    <button className="glow-button px-6 py-3 rounded-sm font-bold flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      SOLICITAR REBALANCEAMENTO
                    </button>
                    <button 
                      onClick={() => setSelectedPortfolio(null)}
                      className="px-6 py-3 border-2 border-charcoal/20 text-charcoal rounded-sm font-semibold hover:border-charcoal transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
