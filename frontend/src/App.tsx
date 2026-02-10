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
import { useSimpleAuth } from "./hooks/useSimpleAuth";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Clients from "./pages/admin/Clients";
import AdminPlans from "./pages/admin/Plans";
import Subscriptions from "./pages/admin/Subscriptions";

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
import CashFlow from "./pages/bpo/CashFlow";
import Reports from "./pages/bpo/Reports";
import BpoPlans from "./pages/bpo/Plans";
import BpoUsers from "./pages/bpo/Users";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, isAuthenticated, loading } = useSimpleAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-charcoal font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/login" component={LoginPage} />
      
      {/* Admin routes */}
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} adminOnly />}
      </Route>
      <Route path="/admin/clients">
        {() => <ProtectedRoute component={Clients} adminOnly />}
      </Route>
      <Route path="/admin/plans">
        {() => <ProtectedRoute component={AdminPlans} adminOnly />}
      </Route>
      <Route path="/admin/subscriptions">
        {() => <ProtectedRoute component={Subscriptions} adminOnly />}
      </Route>

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
      <Route path="/bpo/dashboard">
        {() => <ProtectedRoute component={BpoDashboard} />}
      </Route>
      <Route path="/bpo/clients">
        {() => <ProtectedRoute component={BpoClients} />}
      </Route>
      <Route path="/bpo/reconciliation">
        {() => <ProtectedRoute component={Reconciliation} />}
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
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <AccessTypeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AccessTypeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
