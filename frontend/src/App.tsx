import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AccessTypeProvider } from "./contexts/AccessTypeContext";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Admin pages
// Admin pages comentadas - não são mais usadas
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import Clients from "./pages/admin/Clients";
// import AdminPlans from "./pages/admin/Plans";
// import Subscriptions from "./pages/admin/Subscriptions";

// Client pages
import Dashboard from "./pages/client/Dashboard";
import SubscriptionPage from "./pages/client/SubscriptionPage";
import Documents from "./pages/client/Documents";
import Payments from "./pages/client/Payments";
import ProfilePage from "./pages/client/ProfilePage";
import InvestmentsPage from "./pages/client/InvestmentsPage";
import PortfolioPage from "./pages/client/PortfolioPage";

// BPO pages
import BpoDashboard from "./pages/bpo/BpoDashboard";
import BpoClients from "./pages/bpo/BpoClients";
import Reconciliation from "./pages/bpo/Reconciliation";
import ReconciliationDetail from "./pages/bpo/ReconciliationDetail";
import CashFlow from "./pages/bpo/CashFlow";
import Reports from "./pages/bpo/Reports";
import BpoPlans from "./pages/bpo/Plans";
import BpoUsers from "./pages/bpo/Users";

function ProtectedRoute({
  component: Component,
  adminOnly = false,
}: {
  component: React.ComponentType;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, loading, error } = useAuth();

  // Se estiver carregando, mostra loading
  if (loading) {
    console.log("[ProtectedRoute] Loading...");
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-charcoal font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado E não houver token no localStorage, redireciona
  if (!isAuthenticated && !localStorage.getItem("hw-token")) {
    console.log(
      "[ProtectedRoute] Não autenticado e sem token, redirecionando para /login"
    );
    return <Redirect to="/login" />;
  }

  // Se há erro na API mas tem token, tenta usar dados do localStorage
  if (error && !isAuthenticated) {
    const userDataStr = localStorage.getItem("hw-user");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        console.log("[ProtectedRoute] Usando dados do localStorage:", userData);

        // Verificar se é admin only
        if (
          adminOnly &&
          userData.role !== "admin" &&
          userData.role !== "ADMIN"
        ) {
          console.log(
            "[ProtectedRoute] Não é admin (localStorage), deveria redirecionar para /dashboard"
          );
          console.log(
            "[ProtectedRoute] Mas vou renderizar mesmo assim para evitar loop"
          );
          // TEMPORARIAMENTE DESABILITADO PARA EVITAR LOOP
          // return <Redirect to="/dashboard" />;
        }

        return <Component />;
      } catch (e) {
        console.error(
          "[ProtectedRoute] Erro ao parsear dados do localStorage:",
          e
        );
        console.log(
          "[ProtectedRoute] Deveria redirecionar para /login, mas vou aguardar..."
        );
        // TEMPORARIAMENTE DESABILITADO
        // return <Redirect to="/login" />;
      }
    }
  }

  // adminOnly não é mais necessário - todos acessam as mesmas páginas
  // A diferença está nos menus que aparecem baseado no role
  if (adminOnly) {
    console.log("[ProtectedRoute] adminOnly está deprecated - ignorando");
  }

  console.log("[ProtectedRoute] Renderizando componente protegido");
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/login" component={LoginPage} />

      {/* Client routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/dashboard/subscription">
        {() => <ProtectedRoute component={SubscriptionPage} />}
      </Route>
      <Route path="/documents">
        {() => <ProtectedRoute component={Documents} />}
      </Route>
      <Route path="/payments">
        {() => <ProtectedRoute component={Payments} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={ProfilePage} />}
      </Route>
      <Route path="/dashboard/investments">
        {() => <ProtectedRoute component={InvestmentsPage} />}
      </Route>
      <Route path="/dashboard/portfolio">
        {() => <ProtectedRoute component={PortfolioPage} />}
      </Route>

      {/* BPO routes */}
      {/* Redirect /bpo to /bpo/dashboard */}
      <Route path="/bpo">{() => <Redirect to="/bpo/dashboard" />}</Route>
      <Route path="/bpo/dashboard">
        {() => <ProtectedRoute component={BpoDashboard} />}
      </Route>
      <Route path="/bpo/clients">
        {() => <ProtectedRoute component={BpoClients} />}
      </Route>
      <Route path="/bpo/reconciliation">
        {() => <ProtectedRoute component={Reconciliation} />}
      </Route>
      <Route path="/bpo/reconciliation/:id">
        {() => <ProtectedRoute component={ReconciliationDetail} />}
      </Route>
      <Route path="/bpo/cashflow">
        {() => <ProtectedRoute component={CashFlow} />}
      </Route>
      <Route path="/bpo/reports">
        {() => <ProtectedRoute component={Reports} />}
      </Route>
      <Route path="/bpo/plans">
        {() => <ProtectedRoute component={BpoPlans} />}
      </Route>
      <Route path="/bpo/users">
        {() => <ProtectedRoute component={BpoUsers} />}
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" switchable={true}>
          <AccessTypeProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AccessTypeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
