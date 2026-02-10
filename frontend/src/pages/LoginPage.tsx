import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useSimpleAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Se já estiver autenticado, redirecionar para dashboard
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email);
      setLocation("/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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
              HW CAPITAL
            </div>
          </Link>
          <div className="geometric-divider w-24 mb-8"></div>

          {/* Title */}
          <h1 
            className="text-4xl font-bold text-charcoal mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Bem-vindo de Volta
          </h1>
          <p className="text-charcoal-light mb-8">
            Acesse sua carteira de investimentos premium
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold" />
                Email
              </label>
              <div className="relative">
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-gold transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-gold cursor-pointer"
                />
                <span className="text-sm text-charcoal-light">Lembrar-me</span>
              </label>
              <a href="#" className="text-sm text-gold hover:text-gold-dark transition-colors font-semibold">
                Esqueceu a senha?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full glow-button py-4 rounded-sm font-bold tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                <>
                  ACESSAR DASHBOARD
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gold/20"></div>
            <span className="text-sm text-charcoal-light">ou</span>
            <div className="flex-1 h-px bg-gold/20"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button className="w-full py-3 border-2 border-charcoal/20 rounded-sm text-charcoal font-semibold hover:border-gold hover:bg-gold/5 transition-all duration-300 flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
            
            <button className="w-full py-3 border-2 border-charcoal/20 rounded-sm text-charcoal font-semibold hover:border-gold hover:bg-gold/5 transition-all duration-300 flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              Continuar com GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center mt-8 text-charcoal-light">
            Não tem uma conta?{" "}
            <a href="#" className="text-gold hover:text-gold-dark font-semibold transition-colors">
              Criar conta gratuita
            </a>
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
            Segurança Premium
          </h2>
          
          <p className="text-xl text-cream mb-8 leading-relaxed">
            Seus dados financeiros protegidos com total segurança e confidencialidade.
          </p>

          <div className="space-y-4">
            {[
              "Dados criptografados",
              "Acesso seguro",
              "Confidencialidade garantida",
              "Backup automático"
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
