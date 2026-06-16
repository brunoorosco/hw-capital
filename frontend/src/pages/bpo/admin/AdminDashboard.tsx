import { Card, CardContent } from "@/components/ui/card";
import { Users, CreditCard, Building2, DollarSign } from "lucide-react";
import BpoLayout from "@/components/BpoLayout";
import { api } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

interface AdminDashboardData {
  totalUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalClients: number;
  totalPayments: number;
  totalRevenue: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    status: string;
    paidAt: string | null;
    dueDate: string;
    subscription: {
      user: { name: string; email: string };
      plan: { name: string };
    };
  }>;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<AdminDashboardData>({
    queryKey: ["saas-admin-dashboard"],
    queryFn: async () => {
      const res = await api.get("/saas/admin/dashboard");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <BpoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </BpoLayout>
    );
  }

  const stats = [
    {
      label: "Usuários",
      value: data?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Assinaturas Ativas",
      value: data?.activeSubscriptions ?? 0,
      icon: CreditCard,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Total Assinaturas",
      value: data?.totalSubscriptions ?? 0,
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Clientes BPO",
      value: data?.totalClients ?? 0,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Pagamentos",
      value: data?.totalPayments ?? 0,
      icon: DollarSign,
      color: "text-gold-600",
      bg: "bg-gold-100",
    },
    {
      label: "Receita Total",
      value: formatCurrency(data?.totalRevenue ?? 0),
      icon: DollarSign,
      color: "text-gold",
      bg: "bg-gold/10",
    },
  ];

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Dashboard Administrativo
          </h1>
          <p className="text-charcoal-light">
            Visão geral da plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-gold/20 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-charcoal-light font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-charcoal mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bg}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Payments */}
        <Card className="border-gold/20">
          <div className="p-6 border-b border-gold/20">
            <h2 className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
              Últimos Pagamentos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/20 bg-emerald text-cream">
                  <th className="text-left p-4 text-sm font-semibold">Usuário</th>
                  <th className="text-left p-4 text-sm font-semibold">Plano</th>
                  <th className="text-left p-4 text-sm font-semibold">Valor</th>
                  <th className="text-left p-4 text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentPayments?.map((payment) => (
                  <tr key={payment.id} className="border-b border-gold/10 hover:bg-gold/5">
                    <td className="p-4">
                      <p className="text-sm font-medium text-charcoal">{payment.subscription.user.name}</p>
                      <p className="text-xs text-charcoal-light">{payment.subscription.user.email}</p>
                    </td>
                    <td className="p-4 text-sm text-charcoal">{payment.subscription.plan.name}</td>
                    <td className="p-4 text-sm font-semibold text-charcoal">
                      {formatCurrency(Number(payment.amount))}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === "PAID" ? "bg-green-100 text-green-700" :
                        payment.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        payment.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {payment.status === "PAID" ? "Pago" :
                         payment.status === "PENDING" ? "Pendente" :
                         payment.status === "OVERDUE" ? "Vencido" :
                         payment.status === "CANCELED" ? "Cancelado" :
                         payment.status === "REFUNDED" ? "Reembolsado" : payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!data?.recentPayments || data.recentPayments.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-charcoal-light">
                      Nenhum pagamento recente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </BpoLayout>
  );
}
