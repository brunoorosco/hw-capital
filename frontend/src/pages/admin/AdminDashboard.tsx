import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiQuery } from "@/lib/hooks";
import { Users, FileText, CreditCard, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { data: users = [] } = useApiQuery<any[]>(["users"], "/users");
  const { data: subscriptions = [] } = useApiQuery<any[]>(["subscriptions"], "/subscriptions");
  const { data: documents = [] } = useApiQuery<any[]>(["documents"], "/documents");
  const { data: payments = [] } = useApiQuery<any[]>(["payments"], "/payments");

  const stats = [
    {
      title: "Total de Clientes",
      value: users?.filter((u) => u.role === "user").length || 0,
      icon: Users,
      description: "Clientes ativos na plataforma",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Assinaturas Ativas",
      value: subscriptions?.filter((s) => s.status === "active").length || 0,
      icon: TrendingUp,
      description: "Planos atualmente ativos",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Documentos",
      value: documents?.length || 0,
      icon: FileText,
      description: "Total de documentos cadastrados",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Pagamentos Pendentes",
      value: payments?.filter((p) => p.status === "pending" || p.status === "overdue").length || 0,
      icon: CreditCard,
      description: "Aguardando confirmação",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-2">Visão geral da plataforma HW Capital</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Assinaturas por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ativas</span>
                  <span className="badge-active">
                    {subscriptions?.filter((s) => s.status === "active").length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pendentes</span>
                  <span className="badge-pending">
                    {subscriptions?.filter((s) => s.status === "pending").length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Canceladas</span>
                  <span className="badge-cancelled">
                    {subscriptions?.filter((s) => s.status === "cancelled").length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Suspensas</span>
                  <span className="badge-suspended">
                    {subscriptions?.filter((s) => s.status === "suspended").length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Pagamentos por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pagos</span>
                  <span className="badge-paid">{payments?.filter((p) => p.status === "paid").length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pendentes</span>
                  <span className="badge-pending">{payments?.filter((p) => p.status === "pending").length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Atrasados</span>
                  <span className="badge-overdue">{payments?.filter((p) => p.status === "overdue").length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cancelados</span>
                  <span className="badge-cancelled">
                    {payments?.filter((p) => p.status === "cancelled").length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
