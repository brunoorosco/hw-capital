import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  LogOut,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Menu,
  ChevronLeft,
  ChevronRight,
  Building2,
  CreditCard,
  UserCog,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Breadcrumbs from "./Breadcrumbs";
import ThemeToggle from "./ThemeToggle";

const bpoMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/bpo/dashboard" },
  { icon: Users, label: "Clientes", path: "/bpo/clients" },
  {
    icon: BarChart3,
    label: "Conciliação Bancária",
    path: "/bpo/reconciliation",
  },
  { icon: DollarSign, label: "Fluxo de Caixa", path: "/bpo/cashflow" },
  { icon: FileText, label: "Relatórios", path: "/bpo/reports" },
];

const diretoriaMenuItems = [
  { icon: CreditCard, label: "Planos", path: "/bpo/plans" },
  { icon: UserCog, label: "Usuários", path: "/bpo/users" },
];

// const perfilMenuItem = { icon: User, label: "Perfil", path: "/profile" };

interface BpoLayoutProps {
  children: React.ReactNode;
}

export default function BpoLayout({ children }: BpoLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Manter Diretoria aberto se estiver em uma página de diretoria
  const isDiretoriaPage =
    location === "/bpo/plans" || location === "/bpo/users";
  const [diretoriaOpen, setDiretoriaOpen] = useState(isDiretoriaPage);

  const handleLogout = () => {
    logout?.();
  };

  // Manter menu Diretoria aberto quando estiver em páginas de diretoria
  useEffect(() => {
    if (isDiretoriaPage) {
      setDiretoriaOpen(true);
    }
  }, [isDiretoriaPage]);

  const sidebarWidth = sidebarCollapsed ? "w-20" : "w-72";

  return (
    <div className="min-h-screen bg-ivory">
      {/* Desktop Sidebar */}
      <TooltipProvider delayDuration={0}>
        <aside
          className={`hidden lg:flex ${sidebarWidth} h-screen bg-emerald-dark border-r-2 border-gold/30 flex-col fixed left-0 top-0 overflow-y-auto overflow-x-hidden z-50 transition-all duration-300`}
        >
          {/* Logo and Toggle */}
          <div className="p-6 border-b-2 border-gold/30 relative">
            <Link href="/bpo/dashboard">
              <div
                className={`font-bold text-gold-light cursor-pointer transition-all ${
                  sidebarCollapsed ? "text-xl text-center" : "text-3xl"
                }`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {sidebarCollapsed ? "HW" : "HW CAPITAL"}
              </div>
            </Link>
            {!sidebarCollapsed && (
              <p className="text-cream text-sm mt-1">BPO Financeiro</p>
            )}
            {user && !sidebarCollapsed && (
              <div className="mt-4 pt-4 border-t border-gold/20">
                <p className="text-gold text-sm font-semibold truncate">
                  {user.name}
                </p>
                <p className="text-cream/70 text-xs truncate">{user.email}</p>
              </div>
            )}

            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-gold text-emerald-dark hover:bg-gold-light shadow-lg"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {/* Regular Menu Items */}
            {bpoMenuItems.map((item, index) => {
              const isActive = location === item.path;
              const Icon = item.icon;

              const menuItem = (
                <Link key={index} href={item.path}>
                  <motion.div
                    whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-sm cursor-pointer transition-all duration-300
                    ${
                      isActive
                        ? "bg-gold text-emerald-dark font-semibold shadow-lg"
                        : "text-cream hover:bg-emerald-light hover:text-gold"
                    }
                    ${sidebarCollapsed ? "justify-center" : ""}
                  `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </motion.div>
                </Link>
              );

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>{menuItem}</TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-emerald-dark text-gold border-gold/30"
                    >
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return menuItem;
            })}

            {/* Diretoria Collapsible Menu */}
            {!sidebarCollapsed ? (
              <Collapsible open={diretoriaOpen} onOpenChange={setDiretoriaOpen}>
                <CollapsibleTrigger asChild>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-sm cursor-pointer transition-all duration-300 text-cream hover:bg-emerald-light hover:text-gold"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 shrink-0" />
                      <span className="font-medium">Diretoria</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${diretoriaOpen ? "rotate-180" : ""}`}
                    />
                  </motion.div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                  {diretoriaMenuItems.map((item, index) => {
                    const isActive = location === item.path;
                    const Icon = item.icon;

                    return (
                      <Link key={index} href={item.path}>
                        <motion.div
                          whileHover={{ x: 4 }}
                          className={`
                          flex items-center gap-2 px-3 pl-10 py-2 rounded-sm cursor-pointer transition-all duration-300
                          ${
                            isActive
                              ? "bg-gold text-emerald-dark font-semibold shadow-lg"
                              : "text-cream hover:bg-emerald-light hover:text-gold"
                          }
                        `}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {item.label}
                          </span>
                        </motion.div>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              // Mostrar itens Diretoria individualmente quando colapsado
              diretoriaMenuItems.map((item, index) => {
                const isActive = location === item.path;
                const Icon = item.icon;

                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Link href={item.path}>
                        <motion.div
                          className={`
                          flex items-center justify-center px-4 py-3 rounded-sm cursor-pointer transition-all duration-300
                          ${
                            isActive
                              ? "bg-gold text-emerald-dark font-semibold shadow-lg"
                              : "text-cream hover:bg-emerald-light hover:text-gold"
                          }
                        `}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                        </motion.div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-emerald-dark text-gold border-gold/30"
                    >
                      <p>Diretoria - {item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })
            )}

            {/* Perfil Menu Item */}
            {/* {(() => {
              const isActive = location === perfilMenuItem.path;
              const Icon = perfilMenuItem.icon;

              const menuItem = (
                <Link href={perfilMenuItem.path}>
                  <motion.div
                    whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-sm cursor-pointer transition-all duration-300
                    ${
                      isActive
                        ? "bg-gold text-emerald-dark font-semibold shadow-lg"
                        : "text-cream hover:bg-emerald-light hover:text-gold"
                    }
                    ${sidebarCollapsed ? "justify-center" : ""}
                  `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="font-medium">
                        {perfilMenuItem.label}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );

              if (sidebarCollapsed) {
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>{menuItem}</TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-emerald-dark text-gold border-gold/30"
                    >
                      <p>{perfilMenuItem.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return menuItem;
            })()} */}
          </nav>

          {/* Theme Toggle and Logout */}
          <div className="p-4 border-t-2 border-gold/30 space-y-2">
            {/* Theme Toggle */}
            <div className={sidebarCollapsed ? "flex justify-center" : ""}>
              <ThemeToggle />
            </div>

            {/* Logout */}
            <div>
              {sidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center px-4 py-3 rounded-sm text-cream hover:bg-red-900/30 hover:text-red-400 transition-all duration-300"
                    >
                      <LogOut className="w-5 h-5" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-emerald-dark text-red-400 border-red-400/30"
                  >
                    <p>Sair</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-cream hover:bg-red-900/30 hover:text-red-400 transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sair</span>
                </motion.button>
              )}
            </div>
          </div>
        </aside>
      </TooltipProvider>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-emerald-dark border-b-2 border-gold/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/bpo/dashboard">
            <div
              className="text-2xl font-bold text-gold-light cursor-pointer"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              HW CAPITAL
            </div>
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gold hover:bg-emerald-light hover:text-gold"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 bg-emerald-dark border-gold/30 p-0"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <SheetHeader className="p-6 border-b-2 border-gold/30 text-left">
                  <SheetTitle
                    className="text-3xl font-bold text-gold-light"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    HW CAPITAL
                  </SheetTitle>
                  <p className="text-cream text-sm">BPO Financeiro</p>
                  {user && (
                    <div className="mt-4 pt-4 border-t border-gold/20">
                      <p className="text-gold text-sm font-semibold truncate">
                        {user.name}
                      </p>
                      <p className="text-cream/70 text-xs truncate">
                        {user.email}
                      </p>
                    </div>
                  )}
                </SheetHeader>

                {/* Menu Items */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  {bpoMenuItems.map((item, index) => {
                    const isActive = location === item.path;
                    const Icon = item.icon;

                    return (
                      <Link key={index} href={item.path}>
                        <div
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-sm cursor-pointer transition-all duration-300
                            ${
                              isActive
                                ? "bg-gold text-emerald-dark font-semibold shadow-lg"
                                : "text-cream hover:bg-emerald-light hover:text-gold"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t-2 border-gold/30">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-cream hover:bg-red-900/30 hover:text-red-400 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sair</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-16 lg:pt-0 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}
      >
        <div className="p-4 md:p-8">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  );
}
