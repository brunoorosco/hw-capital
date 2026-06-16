import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import BpoLayout from "@/components/BpoLayout";
import { api } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  mercadopagoId: string | null;
  paidAt: string | null;
  dueDate: string;
  createdAt: string;
  subscription: {
    user: { id: string; name: string; email: string };
    plan: { id: string; name: string };
  };
}

const statusLabels: Record<string, { label: string; variant: string }> = {
  PAID: { label: "Pago", variant: "bg-green-500" },
  PENDING: { label: "Pendente", variant: "bg-yellow-500" },
  OVERDUE: { label: "Vencido", variant: "bg-red-500" },
  CANCELED: { label: "Cancelado", variant: "bg-gray-500" },
  REFUNDED: { label: "Reembolsado", variant: "bg-purple-500" },
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
}

export default function AdminPayments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: payments = [], isLoading } = useQuery<AdminPayment[]>({
    queryKey: ["saas-admin-payments", statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/saas/admin/payments", { params });
      return res.data;
    },
  });

  const filtered = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.subscription.user.name.toLowerCase().includes(q) ||
      p.subscription.user.email.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
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

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Histórico de Pagamentos
          </h1>
          <p className="text-charcoal-light">
            Acompanhe todos os pagamentos das assinaturas
          </p>
        </div>

        <Card className="mb-6 border-gold/20">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                <Input
                  placeholder="Buscar por usuário ou ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-cream border-gold/20"
                />
              </div>
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gold/20 bg-cream text-charcoal text-sm"
                >
                  <option value="">Todos os status</option>
                  <option value="PAID">Pagos</option>
                  <option value="PENDING">Pendentes</option>
                  <option value="OVERDUE">Vencidos</option>
                  <option value="CANCELED">Cancelados</option>
                  <option value="REFUNDED">Reembolsados</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold/20">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/20 bg-emerald text-cream">
                    <th className="text-left p-4 text-sm font-semibold">Usuário</th>
                    <th className="text-left p-4 text-sm font-semibold">Plano</th>
                    <th className="text-left p-4 text-sm font-semibold">Valor</th>
                    <th className="text-left p-4 text-sm font-semibold">Vencimento</th>
                    <th className="text-left p-4 text-sm font-semibold">Pagamento</th>
                    <th className="text-left p-4 text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-charcoal-light">
                        Nenhum pagamento encontrado
                      </td>
                    </tr>
                  ) : (
                    filtered.map((payment) => {
                      const st = statusLabels[payment.status] || { label: payment.status, variant: "bg-gray-500" };
                      return (
                        <tr key={payment.id} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="text-sm font-medium text-charcoal">{payment.subscription.user.name}</p>
                              <p className="text-xs text-charcoal-light">{payment.subscription.user.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-charcoal">{payment.subscription.plan.name}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-semibold text-charcoal">{formatCurrency(Number(payment.amount))}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-charcoal">{formatDate(payment.dueDate)}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-charcoal">{payment.paidAt ? formatDate(payment.paidAt) : "—"}</span>
                          </td>
                          <td className="p-4">
                            <Badge className={`${st.variant} text-white`}>
                              {st.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </BpoLayout>
  );
}
