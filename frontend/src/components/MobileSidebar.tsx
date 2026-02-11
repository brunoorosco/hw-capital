import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Wallet, CreditCard, LogOut, TrendingUp, User, Menu, X, Users, FileText, DollarSign, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAccessType } from "@/contexts/AccessTypeContext";

interface SidebarProps {
  onLogout?: () => void;
}

const investimentosMenuItems = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
  { icon: <Wallet className="w-5 h-5" />, label: "Carteira", path: "/dashboard/portfolio" },
  { icon: <TrendingUp className="w-5 h-5" />, label: "Investimentos", path: "/dashboard/investments" },
  { icon: <CreditCard className="w-5 h-5" />, label: "Assinatura", path: "/dashboard/subscription" },
  { icon: <User className="w-5 h-5" />, label: "Perfil", path: "/profile" },
];

const bpoMenuItems = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: "/bpo/dashboard" },
  { icon: <Users className="w-5 h-5" />, label: "Clientes", path: "/bpo/clients" },
  { icon: <BarChart3 className="w-5 h-5" />, label: "Conciliação Bancária", path: "/bpo/reconciliation" },
  { icon: <DollarSign className="w-5 h-5" />, label: "Fluxo de Caixa", path: "/bpo/cashflow" },
  { icon: <FileText className="w-5 h-5" />, label: "Relatórios", path: "/bpo/reports" },
  { icon: <User className="w-5 h-5" />, label: "Perfil", path: "/profile" },
];

export default function MobileSidebar({ onLogout }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { accessType } = useAccessType();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const menuItems = accessType === "bpo" ? bpoMenuItems : investimentosMenuItems;

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-emerald-dark border-b-2 border-gold/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" onClick={closeMenu}>
            <div 
              className="text-2xl font-bold text-gold-light cursor-pointer"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              HW CAPITAL
            </div>
          </Link>
          
          <button
            onClick={toggleMenu}
            className="p-2 text-gold hover:bg-emerald-light rounded-sm transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="lg:hidden fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-emerald-dark border-r-2 border-gold/30 z-50 flex flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b-2 border-gold/30">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="text-3xl font-bold text-gold-light"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    HW CAPITAL
                  </div>
                  <button
                    onClick={closeMenu}
                    className="p-2 text-gold hover:bg-emerald-light rounded-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-cream text-sm">
            {accessType === "bpo" ? "BPO Financeiro" : "Investment Platform"}
          </p>
                {user && (
                  <div className="mt-4 pt-4 border-t border-gold/20">
                    <p className="text-gold text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-cream/70 text-xs truncate">{user.email}</p>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item, index) => {
                  const isActive = location === item.path;
                  
                  return (
                    <Link key={index} href={item.path} onClick={closeMenu}>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-sm cursor-pointer transition-all duration-300
                          ${isActive 
                            ? 'bg-gold text-emerald-dark font-semibold shadow-lg' 
                            : 'text-cream hover:bg-emerald-light hover:text-gold'
                          }
                        `}
                      >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t-2 border-gold/30">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    closeMenu();
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-cream hover:bg-red-900/30 hover:text-red-400 transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sair</span>
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex w-72 h-screen bg-emerald-dark border-r-2 border-gold/30 flex-col fixed left-0 top-0 overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b-2 border-gold/30">
          <Link href="/dashboard">
            <div 
              className="text-3xl font-bold text-gold-light cursor-pointer"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              HW CAPITAL
            </div>
          </Link>
          <p className="text-cream text-sm mt-1">
            {accessType === "bpo" ? "BPO Financeiro" : "Investment Platform"}
          </p>
          {user && (
            <div className="mt-4 pt-4 border-t border-gold/20">
              <p className="text-gold text-sm font-semibold truncate">{user.name}</p>
              <p className="text-cream/70 text-xs truncate">{user.email}</p>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location === item.path;
            
            return (
              <Link key={index} href={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-sm cursor-pointer transition-all duration-300
                    ${isActive 
                      ? 'bg-gold text-emerald-dark font-semibold shadow-lg' 
                      : 'text-cream hover:bg-emerald-light hover:text-gold'
                    }
                  `}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t-2 border-gold/30">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-cream hover:bg-red-900/30 hover:text-red-400 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </motion.button>
        </div>
      </aside>
    </>
  );
}
