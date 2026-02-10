import { useLocation, Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

const routeNames: Record<string, string> = {
  "/bpo/dashboard": "Dashboard",
  "/bpo/clients": "Clientes",
  "/bpo/reconciliation": "Conciliação Bancária",
  "/bpo/cashflow": "Fluxo de Caixa",
  "/bpo/reports": "Relatórios",
  "/bpo/plans": "Planos",
  "/bpo/users": "Usuários",
  "/profile": "Perfil",
};

export default function Breadcrumbs() {
  const [location] = useLocation();

  const pathSegments = location.split("/").filter(Boolean);
  
  // Construir breadcrumbs
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const name = routeNames[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { path, name };
  });

  // Não mostrar breadcrumbs na home ou páginas de login
  if (location === "/" || location === "/login" || location === "/pricing") {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm mb-6 px-1">
      <Link href="/bpo/dashboard">
        <div className="flex items-center gap-1 text-charcoal-light hover:text-gold transition-colors cursor-pointer">
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Início</span>
        </div>
      </Link>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={crumb.path} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-charcoal-light/50" />
            {isLast ? (
              <span className="text-gold font-semibold">{crumb.name}</span>
            ) : (
              <Link href={crumb.path}>
                <span className="text-charcoal-light hover:text-gold transition-colors cursor-pointer">
                  {crumb.name}
                </span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
