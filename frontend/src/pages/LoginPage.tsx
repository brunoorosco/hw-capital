import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { getRedirectPath, getSavedAccessType } from "@/lib/redirect-helper";
import { authAPI } from "@/lib/api-client";

// ✅ Separar o formulário em componente filho para poder usar useGoogleLogin
// dentro do GoogleOAuthProvider
function LoginForm() {
  const [, setLocation] = useLocation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    const token = localStorage.getItem("hw-token");
    const userDataStr = localStorage.getItem("hw-user");

    if (token && userDataStr && !isRedirecting) {
      try {
        const userData = JSON.parse(userDataStr);
        const accessType = getSavedAccessType();
        const redirectPath = getRedirectPath(
          userData.role,
          accessType || undefined
        );
        setIsRedirecting(true);
        setTimeout(() => setLocation(redirectPath), 100);
      } catch {
        localStorage.removeItem("hw-token");
        localStorage.removeItem("hw-user");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });
      toast.success("Login realizado com sucesso!");
      const accessType = getSavedAccessType();
      const redirectPath = getRedirectPath(
        response.user.role,
        accessType || undefined
      );
      setLocation(redirectPath);
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;
        if (status === 401) toast.error(message || "Email ou senha incorretos");
        else if (status === 403) toast.error("Acesso negado.");
        else if (status === 500) toast.error("Erro no servidor.");
        else toast.error(message || "Erro ao fazer login.");
      } else if (error.request) {
        toast.error("Erro de conexão.");
      } else {
        toast.error("Erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setIsGoogleLoading(true);
    try {
      const response = await authAPI.googleLogin({
        credential: tokenResponse.access_token, // ✅ correto para flow: "auth-code"
      });
      if (!response.user || !response.token)
        throw new Error("Resposta inválida");
      toast.success("Login com Google realizado com sucesso!");
      setLocation("/bpo/dashboard");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Erro ao fazer login com Google";
      toast.error(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ✅ useGoogleLogin agora está dentro do GoogleOAuthProvider (via LoginForm)
  const googleLogin = useGoogleLogin({
    flow: "implicit", // ou "auth-code" dependendo do backend
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error("Erro ao autenticar com Google"),
  });

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-charcoal font-semibold">Redirecionando...</p>
        </div>
      </div>
    );
  }

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
          <Link href="/">
            <div
              className="text-4xl font-bold text-charcoal mb-2 cursor-pointer inline-block"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Orostec Capital
            </div>
          </Link>
          <div className="geometric-divider w-24 mb-8" />

          <h1
            className="text-4xl font-bold text-charcoal mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Bem-vindo de Volta
          </h1>
          <p className="text-charcoal-light mb-8">
            Acesse sua carteira de investimentos premium
          </p>

          <div className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-sm">
            <p className="text-sm font-semibold text-charcoal mb-2">
              🔑 Credenciais de teste:
            </p>
            <p className="text-xs text-charcoal-light">
              Email: admin@hwcapital.com.br
            </p>
            <p className="text-xs text-charcoal-light">Senha: 123456</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold" /> Email
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

            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold" /> Senha
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full glow-button py-4 rounded-sm font-bold tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
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

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gold/20" />
            <span className="text-sm text-charcoal-light">ou</span>
            <div className="flex-1 h-px bg-gold/20" />
          </div>

          <button
            onClick={() => googleLogin()}
            type="button"
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-2 bg-gold text-charcoal py-3 rounded-sm hover:bg-gold-dark transition-colors"
          >
            {isGoogleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
                Autenticando...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 533.5 544.3"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M533.5 278.4c0-17.4-1.5-34.1-4.4-50.4H272v95.3h147.5c-6.4 34.7-25.6 64-54.5 83.7v69.5h88.2c51.7-47.6 81.3-117.7 81.3-197.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M272 544.3c73.4 0 134.9-24.4 179.9-66.2l-88.2-69.5c-24.5 16.5-55.9 26.2-91.7 26.2-70.5 0-130.2-47.5-151.6-111.5H31.7v70.1c45.1 89.1 138.5 151.9 240.3 151.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M120.4 322.3c-10.6-31.8-10.6-66.1 0-97.9v-70.1H31.7c-39.9 78.5-39.9 169.5 0 248l88.7-70z"
                  />
                  <path
                    fill="#EA4335"
                    d="M272 107.6c39.9 0 75.8 13.8 104.1 40.9l78.1-78.1C406.9 24.3 345.4 0 272 0 170.2 0 76.8 62.8 31.7 151.9l88.7 70.1C141.8 155.1 201.5 107.6 272 107.6z"
                  />
                </svg>
                Entrar com Google
              </>
            )}
          </button>

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
        <div className="absolute inset-0 opacity-10 deco-pattern" />
        <div className="absolute top-20 left-20 w-64 h-64 border-2 border-gold/30 rotate-45 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 border-2 border-gold/20 rotate-12" />

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
                <div className="w-2 h-2 bg-gold rounded-full" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ✅ Componente raiz apenas provê o GoogleOAuthProvider
export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}
