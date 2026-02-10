import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApiQuery } from "@/lib/hooks";

export default function Subscriptions() {
  const { data: subscriptions = [] } = useApiQuery<any[]>(["subscriptions"], "/subscriptions");
  const { data: users = [] } = useApiQuery<any[]>(["users"], "/users");
  const { data: plans = [] } = useApiQuery<any[]>(["plans"], "/plans");

  const getUserName = (userId: number) => {
    const user = users?.find((u) => u.id === userId);
    return user?.name || "Usuário não encontrado";
  };

  const getPlanName = (planId: number) => {
    const plan = plans?.find((p) => p.id === planId);
    return plan?.name || "Plano não encontrado";
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: "badge-active",
      pending: "badge-pending",
      cancelled: "badge-cancelled",
      suspended: "badge-suspended",
    };
    return badges[status] || "badge-pending";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Ativa",
      pending: "Pendente",
      cancelled: "Cancelada",
      suspended: "Suspensa",
    };
    return labels[status] || status;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Assinaturas</h1>
          <p className="text-muted-foreground mt-2">Visualize todas as assinaturas dos clientes</p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Lista de Assinaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead>Preço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!subscriptions || subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma assinatura encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">{getUserName(subscription.userId)}</TableCell>
                      <TableCell>{getPlanName(subscription.planId)}</TableCell>
                      <TableCell>
                        <span className={getStatusBadge(subscription.status)}>{getStatusLabel(subscription.status)}</span>
                      </TableCell>
                      <TableCell>{new Date(subscription.startDate).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        {subscription.customPrice ? `R$ ${subscription.customPrice}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
