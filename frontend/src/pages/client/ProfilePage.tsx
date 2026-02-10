import { useState } from "react";
import { useLocation } from "wouter";
import DashboardSidebar from "@/components/DashboardSidebar";
import { User, Mail, Phone, Building, FileText, Edit, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";

// Tipos de perfil de investidor
type InvestorProfile = "conservador" | "moderado" | "arrojado" | null;

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  company: string;
  cnpj: string;
  investorProfile: InvestorProfile;
  profileCompletedAt: string | null;
}

// Quiz de perfil de investidor
const profileQuiz = [
  {
    id: 1,
    question: "Qual é o seu principal objetivo com os investimentos da sua empresa?",
    options: [
      { value: 1, label: "Preservar o capital e evitar riscos" },
      { value: 2, label: "Crescimento moderado com risco controlado" },
      { value: 3, label: "Maximizar retornos, aceitando riscos maiores" }
    ]
  },
  {
    id: 2,
    question: "Por quanto tempo você pretende manter os investimentos?",
    options: [
      { value: 1, label: "Curto prazo (até 1 ano)" },
      { value: 2, label: "Médio prazo (1 a 5 anos)" },
      { value: 3, label: "Longo prazo (mais de 5 anos)" }
    ]
  },
  {
    id: 3,
    question: "Como você reagiria se seus investimentos perdessem 15% do valor em um mês?",
    options: [
      { value: 1, label: "Venderia tudo imediatamente para evitar mais perdas" },
      { value: 2, label: "Aguardaria para avaliar a situação" },
      { value: 3, label: "Aproveitaria para comprar mais com preços baixos" }
    ]
  },
  {
    id: 4,
    question: "Qual percentual do patrimônio da empresa você está disposto a investir em ativos de maior risco?",
    options: [
      { value: 1, label: "Até 10%" },
      { value: 2, label: "De 10% a 30%" },
      { value: 3, label: "Mais de 30%" }
    ]
  },
  {
    id: 5,
    question: "Qual é o seu nível de conhecimento sobre investimentos?",
    options: [
      { value: 1, label: "Iniciante - Tenho pouco conhecimento" },
      { value: 2, label: "Intermediário - Tenho conhecimento moderado" },
      { value: 3, label: "Avançado - Tenho amplo conhecimento" }
    ]
  },
  {
    id: 6,
    question: "Qual a importância da liquidez (facilidade de resgatar o dinheiro) para você?",
    options: [
      { value: 1, label: "Muito importante - Preciso de acesso rápido" },
      { value: 2, label: "Moderadamente importante" },
      { value: 3, label: "Pouco importante - Posso deixar investido" }
    ]
  }
];

const profileDescriptions = {
  conservador: {
    title: "Conservador",
    color: "emerald",
    icon: "🛡️",
    description: "Você prioriza a segurança e preservação do capital. Prefere investimentos de baixo risco com retornos previsíveis.",
    recommendations: [
      "Renda Fixa (CDB, Tesouro Direto)",
      "Fundos DI e Conservadores",
      "LCI e LCA",
      "Poupança e Fundos de Liquidez"
    ]
  },
  moderado: {
    title: "Moderado",
    color: "gold",
    icon: "⚖️",
    description: "Você busca equilíbrio entre segurança e rentabilidade. Aceita algum risco para obter retornos melhores.",
    recommendations: [
      "Mix de Renda Fixa e Variável",
      "Fundos Multimercado",
      "Ações de empresas sólidas",
      "Fundos Imobiliários"
    ]
  },
  arrojado: {
    title: "Arrojado",
    color: "red",
    icon: "🚀",
    description: "Você busca maximizar retornos e está disposto a aceitar riscos maiores. Tem visão de longo prazo.",
    recommendations: [
      "Ações de crescimento",
      "Fundos de Ações",
      "Investimentos no exterior",
      "Startups e Venture Capital"
    ]
  }
};

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { logout, user } = useSimpleAuth();
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - em produção viria de uma API
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || "Investidor Demo",
    email: user?.email || "investidor@empresa.com",
    phone: "(11) 98765-4321",
    company: "Empresa Exemplo Ltda",
    cnpj: "12.345.678/0001-90",
    investorProfile: "moderado",
    profileCompletedAt: "2026-01-15"
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleAnswerSelect = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);

    if (currentQuestion < profileQuiz.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // Calcular perfil
      const total = newAnswers.reduce((sum, val) => sum + val, 0);
      const average = total / profileQuiz.length;

      let newProfile: InvestorProfile;
      if (average <= 1.5) {
        newProfile = "conservador";
      } else if (average <= 2.5) {
        newProfile = "moderado";
      } else {
        newProfile = "arrojado";
      }

      // Atualizar perfil
      setProfileData({
        ...profileData,
        investorProfile: newProfile,
        profileCompletedAt: new Date().toISOString().split('T')[0]
      });

      // Resetar quiz
      setTimeout(() => {
        setShowQuiz(false);
        setCurrentQuestion(0);
        setAnswers([]);
      }, 1000);
    }
  };

  const startQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const progress = ((currentQuestion + 1) / profileQuiz.length) * 100;
  const currentProfileData = profileData.investorProfile ? profileDescriptions[profileData.investorProfile] : null;

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
            Meu Perfil
          </h1>
          <p className="text-sm md:text-base text-charcoal-light">Gerencie suas informações e perfil de investidor</p>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          {/* Dados Pessoais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="luxury-card bg-ivory p-8 rounded-sm border border-gold/30"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 
                className="text-2xl font-bold text-charcoal"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Dados Cadastrais
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gold/30 text-charcoal rounded-sm hover:border-gold hover:text-gold transition-colors"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? "Cancelar" : "Editar"}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-charcoal-light">
                  <User className="w-4 h-4 text-gold" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gold/30 rounded-sm bg-cream focus:border-gold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-charcoal-light">
                  <Mail className="w-4 h-4 text-gold" />
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gold/30 rounded-sm bg-cream focus:border-gold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-charcoal-light">
                  <Phone className="w-4 h-4 text-gold" />
                  Telefone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gold/30 rounded-sm bg-cream focus:border-gold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-charcoal-light">
                  <Building className="w-4 h-4 text-gold" />
                  Empresa
                </label>
                <input
                  type="text"
                  value={profileData.company}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gold/30 rounded-sm bg-cream focus:border-gold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-charcoal-light">
                  <FileText className="w-4 h-4 text-gold" />
                  CNPJ
                </label>
                <input
                  type="text"
                  value={profileData.cnpj}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({ ...profileData, cnpj: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gold/30 rounded-sm bg-cream focus:border-gold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex gap-4">
                <button className="glow-button px-6 py-3 rounded-sm font-bold">
                  SALVAR ALTERAÇÕES
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border-2 border-charcoal/20 text-charcoal rounded-sm font-semibold hover:border-charcoal transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </motion.div>

          {/* Perfil de Investidor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="luxury-card bg-ivory p-8 rounded-sm border border-gold/30"
          >
            <h2 
              className="text-2xl font-bold text-charcoal mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Perfil de Investidor
            </h2>

            {currentProfileData ? (
              <div className="space-y-6">
                <div className="flex items-start gap-6 p-6 bg-cream rounded-sm border-2 border-gold/30">
                  <div className="text-6xl">{currentProfileData.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Perfil {currentProfileData.title}
                    </h3>
                    <p className="text-charcoal-light mb-4">{currentProfileData.description}</p>
                    {profileData.profileCompletedAt && (
                      <p className="text-sm text-charcoal-light flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Última atualização: {new Date(profileData.profileCompletedAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-charcoal mb-4">Investimentos Recomendados:</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {currentProfileData.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-cream rounded-sm border border-gold/20"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0" />
                        <span className="text-charcoal">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startQuiz}
                  className="w-full py-4 border-2 border-gold text-gold hover:bg-gold hover:text-emerald-dark rounded-sm font-bold tracking-wider transition-all duration-300"
                >
                  REFAZER ANÁLISE DE PERFIL
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gold mx-auto mb-4" />
                <h3 className="text-xl font-bold text-charcoal mb-2">Perfil não definido</h3>
                <p className="text-charcoal-light mb-6">
                  Complete o questionário para identificar seu perfil de investidor
                </p>
                <button
                  onClick={startQuiz}
                  className="glow-button pulse-cta px-8 py-4 rounded-sm font-bold tracking-wider"
                >
                  INICIAR QUESTIONÁRIO
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-ivory rounded-sm max-w-3xl w-full p-8 border-2 border-gold shadow-2xl"
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-charcoal">
                  Pergunta {currentQuestion + 1} de {profileQuiz.length}
                </span>
                <span className="text-sm font-semibold text-gold">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-cream rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-gold-dark to-gold"
                />
              </div>
            </div>

            {/* Question */}
            <h3 
              className="text-2xl font-bold text-charcoal mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {profileQuiz[currentQuestion].question}
            </h3>

            {/* Options */}
            <div className="space-y-4">
              {profileQuiz[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswerSelect(option.value)}
                  className={`
                    w-full p-4 text-left rounded-sm border-2 transition-all duration-300
                    ${answers[currentQuestion] === option.value
                      ? 'bg-gold border-gold text-emerald-dark font-semibold'
                      : 'bg-cream border-gold/30 hover:border-gold hover:bg-gold/10'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${answers[currentQuestion] === option.value
                        ? 'border-emerald-dark bg-emerald-dark'
                        : 'border-gold/30'
                      }
                    `}>
                      {answers[currentQuestion] === option.value && (
                        <CheckCircle className="w-4 h-4 text-gold" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-2 text-charcoal-light disabled:opacity-30 disabled:cursor-not-allowed hover:text-charcoal transition-colors"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setShowQuiz(false)}
                className="px-6 py-2 text-charcoal-light hover:text-charcoal transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
