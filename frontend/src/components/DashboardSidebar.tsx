import MobileSidebar from "./MobileSidebar";

interface SidebarProps {
  onLogout?: () => void;
}

// Menu items moved to MobileSidebar component
// const menuItems = [
//   { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
//   { icon: <Wallet className="w-5 h-5" />, label: "Carteira", path: "/dashboard/portfolio" },
//   { icon: <TrendingUp className="w-5 h-5" />, label: "Investimentos", path: "/dashboard/investments" },
//   { icon: <CreditCard className="w-5 h-5" />, label: "Assinatura", path: "/dashboard/subscription" },
//   { icon: <User className="w-5 h-5" />, label: "Perfil", path: "/profile" },
// ];

export default function DashboardSidebar({ onLogout }: SidebarProps) {
  return (
    <MobileSidebar onLogout={onLogout} />
  );
}
