import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { getRedirectPath, getSavedAccessType } from "@/lib/redirect-helper";
import { authAPI } from "@/lib/api-client";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Verificar se já está autenticado
  useEffect(() => {
    console.log("[LoginPage] useEffect executado - verificando autenticação");
    const token = localStorage.getItem("hw-token");
    const userDataStr = localStorage.getItem("hw-user");

    if (token && userDataStr && !isRedirecting) {
      try {
        const userData = JSON.parse(userDataStr);
        const accessType = getSavedAccessType();
        const redirectPath = getRedirectPath(userData.role, accessType || undefined);
        console.log(
          "[LoginPage] Usuário já autenticado, redirecionando para:",
          redirectPath
        );
        setIsRedirecting(true);

        // Usar setTimeout para garantir que o estado foi atualizado antes de redirecionar
        setTimeout(() => {
          console.log(
            "[LoginPage] Executando redirecionamento para:",
            redirectPath
          );
          setLocation(redirectPath);
        }, 100);
      } catch (error) {
        console.error("[LoginPage] Erro ao parsear dados do usuário:", error);
        // Se houver erro, limpar localStorage e deixar o usuário fazer login novamente
        localStorage.removeItem("hw-token");
        localStorage.removeItem("hw-user");
      }
    } else {
      console.log("[LoginPage] Não há necessidade de redirecionar");
    }
  }, []); // Array vazio - executa apenas uma vez na montagem

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Fazer login na API
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      });
            
      toast.success("Login realizado com sucesso!");

      // Obter tipo de acesso selecionado pelo usuário
      const accessType = getSavedAccessType();
      
      // Redirecionar para a página correta baseado no role do usuário
      const redirectPath = getRedirectPath(response.user.role, accessType || undefined);
      console.log('redirectPath :>> ', redirectPath);
      setLocation(redirectPath);
    } catch (error: any) {
      console.error("Erro no login:", error);

      // Tratamento específico de erros
      if (error.response) {
        // Erro da API (status 4xx ou 5xx)
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 401) {
          toast.error(message || "Email ou senha incorretos");
        } else if (status === 403) {
          toast.error("Acesso negado. Conta inativa ou sem permissão.");
        } else if (status === 500) {
          toast.error("Erro no servidor. Tente novamente em alguns instantes.");
        } else {
          toast.error(message || "Erro ao fazer login. Tente novamente.");
        }
      } else if (error.request) {
        // Erro de rede (sem resposta do servidor)
        toast.error(
          "Erro de conexão. Verifique sua internet ou se o servidor está rodando."
        );
      } else {
        // Outros erros
        toast.error("Erro inesperado. Tente novamente.");
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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await authAPI.googleLogin({
        credential: credentialResponse.credential,
      });

      if (!response.user || !response.token) {
        throw new Error('Resposta inválida do servidor');
      }

      toast.success("Login com Google realizado com sucesso!");

          setLocation('/bpo/dashboard');
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      const message = error.response?.data?.message || error.message || "Erro ao fazer login com Google";
      toast.error(message);
    }
  };

  const handleGoogleError = () => {
    console.error("Erro ao fazer login com Google");
    toast.error("Erro ao fazer login com Google. Tente novamente.");
  };

  // Mostrar loading enquanto redireciona
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-charcoal font-semibold">Redirecionando...</p>
        </div>
      </div>
    );
  }

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
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
            Bem-vindo de Volta
          </h1>
          <p className="text-charcoal-light mb-8">
            Acesse sua carteira de investimentos premium
          </p>

          {/* Demo Credentials Info */}
          <div className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-sm">
            <p className="text-sm font-semibold text-charcoal mb-2">
              🔑 Credenciais de teste:
            </p>
            <p className="text-xs text-charcoal-light">
              Email: admin@hwcapital.com.br
            </p>
            <p className="text-xs text-charcoal-light">Senha: 123456</p>
          </div>

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

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-gold cursor-pointer"
                />
                <span className="text-sm text-charcoal-light">Lembrar-me</span>
              </label>
              <a
                href="#"
                className="text-sm text-gold hover:text-gold-dark transition-colors font-semibold"
              >
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
            <div className="w-full google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signin_with"
                locale="pt_BR"
                theme="outline"
                size="large"
                width="100%"
              />
            </div>

            {/* <button className="w-full py-3 border-2 border-charcoal/20 rounded-sm text-charcoal font-semibold hover:border-gold hover:bg-gold/5 transition-all duration-300 flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Continuar com GitHub
            </button> */}
          </div>

          {/* Sign Up Link */}
          <p className="text-center mt-8 text-charcoal-light">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="text-gold hover:text-gold-dark font-semibold transition-colors"
            >
              Criar conta gratuita
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
            Segurança Premium
          </h2>

          <p className="text-xl text-cream mb-8 leading-relaxed">
            Seus dados financeiros protegidos com total segurança e
            confidencialidade.
          </p>

          <div className="space-y-4">
            {[
              "Dados criptografados",
              "Acesso seguro",
              "Confidencialidade garantida",
              "Backup automático",
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
    </GoogleOAuthProvider>
  );
}
