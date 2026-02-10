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
import { CreditCard } from "lucide-react";

export default function Payments() {
  const { data: payments = [] } = useApiQuery<any[]>(["payments", "my"], "/payments/my");

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      paid: "badge-paid",
      pending: "badge-pending",
      overdue: "badge-overdue",
      cancelled: "badge-cancelled",
    };
    return badges[status] || "badge-pending";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: "Pago",
      pending: "Pendente",
      overdue: "Atrasado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Histórico de Pagamentos</h1>
          <p className="text-muted-foreground mt-2">Visualize todas as suas faturas e pagamentos</p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Pagamentos e Faturas</CardTitle>
          </CardHeader>
          <CardContent>
            {!payments || payments.length === 0 ? (
              <div className="py-12 text-center">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum pagamento registrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referência</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Pagamento</TableHead>
                    <TableHead>Método</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.referenceMonth}</TableCell>
                      <TableCell className="font-semibold">R$ {payment.amount}</TableCell>
                      <TableCell>{new Date(payment.dueDate).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <span className={getStatusBadge(payment.status)}>{getStatusLabel(payment.status)}</span>
                      </TableCell>
                      <TableCell>
                        {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("pt-BR") : "-"}
                      </TableCell>
                      <TableCell>{payment.paymentMethod || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
