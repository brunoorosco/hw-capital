import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Lock, Mail, User, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { authAPI } from "@/lib/api-client";
import { getRedirectPath, getSavedAccessType } from "@/lib/redirect-helper";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      // Fazer registro na API
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'USER' // Role padrão para novos registros
      });
      
      console.log('[RegisterPage] Registro bem-sucedido:', response);
      toast.success("Conta criada com sucesso!");

      // Obter tipo de acesso (se houver algum salvo anteriormente)
      const accessType = getSavedAccessType();
      
      // Redirecionar para a página correta baseado no role do usuário
      const redirectPath = getRedirectPath(response.user.role, accessType || undefined);
      setLocation(redirectPath);
    } catch (error: any) {
      console.error("Erro no registro:", error);

      if (error.response) {
        const message = error.response.data?.message;
        const status = error.response.status;

        if (status === 409) {
          toast.error("Este email já está em uso");
        } else {
          toast.error(message || "Erro ao criar conta. Tente novamente.");
        }
      } else {
        toast.error("Erro de conexão. Verifique sua internet.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/">
            <div
              className="text-4xl font-bold text-charcoal mb-2 cursor-pointer inline-block"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Orostec Capital
            </div>
          </Link>
          <div className="geometric-divider w-24 mb-8"></div>

          {/* Title */}
          <h1
            className="text-4xl font-bold text-charcoal mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Começar Jornada
          </h1>
          <p className="text-charcoal-light mb-8">
            Crie sua conta premium e comece a investir com elegância
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal flex items-center gap-2">
                <User className="w-4 h-4 text-gold" />
                Nome Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Seu nome"
                className="w-full px-4 py-3 border-2 border-gold/30 rounded-sm bg-cream focus:border-gold focus:outline-none transition-colors duration-300 text-charcoal"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border-2 border-gold/30 rounded-sm bg-cream focus:border-gold focus:outline-none transition-colors duration-300 text-charcoal"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold" />
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gold/30 rounded-sm bg-cream focus:border-gold focus:outline-none transition-colors duration-300 text-charcoal pr-12"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-gold transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold" />
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gold/30 rounded-sm bg-cream focus:border-gold focus:outline-none transition-colors duration-300 text-charcoal pr-12"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-gold transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 accent-gold cursor-pointer"
              />
              <span className="text-xs text-charcoal-light leading-relaxed">
                Ao criar uma conta, você concorda com nossos{" "}
                <a href="#" className="text-gold hover:underline">Termos de Serviço</a> e{" "}
                <a href="#" className="text-gold hover:underline">Política de Privacidade</a>.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full glow-button py-4 rounded-sm font-bold tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                  Criando conta...
                </>
              ) : (
                <>
                  CRIAR CONTA AGORA
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-8 text-charcoal-light">
            Já possui uma conta?{" "}
            <Link
              href="/login"
              className="text-gold hover:text-gold-dark font-semibold transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-dark via-emerald to-emerald-light relative overflow-hidden items-center justify-center"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 deco-pattern"></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 border-2 border-gold/30 rotate-45 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 border-2 border-gold/20 rotate-12"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-12 max-w-lg">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Shield className="w-12 h-12 text-gold" />
          </motion.div>

          <h2
            className="text-5xl font-bold text-gold-light mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Junte-se à Elite
          </h2>

          <p className="text-xl text-cream mb-8 leading-relaxed">
            Faça parte de um ecossistema financeiro exclusivo, desenhado para maximizar seu patrimônio com segurança.
          </p>

          <div className="space-y-4">
            {[
              "Gestão de patrimônio personalizada",
              "Acesso a fundos premium",
              "Relatórios detalhados em tempo real",
              "Suporte especializado 24/7",
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 justify-center text-cream"
              >
                <div className="w-2 h-2 bg-gold rounded-full"></div>
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
