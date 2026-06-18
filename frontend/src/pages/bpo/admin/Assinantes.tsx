import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, Loader2, Shield, ShieldOff } from "lucide-react";
import BpoLayout from "@/components/BpoLayout";
import { api } from "@/lib/api-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AssinanteUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  subscription: {
    id: string;
    status: string;
    plan: { id: string; name: string; price: number };
    trialEndsAt: string | null;
    currentPeriodEnd: string;
  } | null;
  _count: {
    clients: number;
  };
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  mercadopagoId: string | null;
  mercadopagoUrl: string | null;
  paidAt: string | null;
  dueDate: string;
  createdAt: string;
}

const subStatusLabels: Record<string, { label: string; variant: string }> = {
  ACTIVE: { label: "Ativo", variant: "bg-green-500" },
  TRIALING: { label: "Trial", variant: "bg-blue-500" },
  CANCELED: { label: "Cancelado", variant: "bg-gray-500" },
  EXPIRED: { label: "Expirado", variant: "bg-red-500" },
  OVERDUE: { label: "Vencido", variant: "bg-orange-500" },
};

const paymentStatusLabels: Record<string, { label: string; variant: string }> = {
  PAID: { label: "Pago", variant: "bg-green-500" },
  PENDING: { label: "Pendente", variant: "bg-yellow-500" },
  OVERDUE: { label: "Vencido", variant: "bg-red-500" },
  CANCELED: { label: "Cancelado", variant: "bg-gray-500" },
  REFUNDED: { label: "Reembolsado", variant: "bg-purple-500" },
};

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Assinantes() {
  const [search, setSearch] = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [selectedUser, setSelectedUser] = useState<AssinanteUser | null>(null);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsDialogOpen, setPaymentsDialogOpen] = useState(false);

  const fetchPayments = async (user: AssinanteUser) => {
    setSelectedUser(user);
    setPaymentsLoading(true);
    setPaymentsDialogOpen(true);
    try {
      const res = await api.get(`/saas/admin/users/${user.id}/payments`);
      setUserPayments(res.data.payments || []);
    } catch {
      setUserPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const queryClient = useQueryClient();
  const [roleLoading, setRoleLoading] = useState<string | null>(null);

  const handleToggleRole = async (user: AssinanteUser) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirmMsg = user.role === 'ADMIN'
      ? `Remover acesso de admin de "${user.name}"?`
      : `Tornar "${user.name}" um admin do SaaS?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setRoleLoading(user.id);
      await api.patch(`/saas/admin/users/${user.id}/role`);
      queryClient.invalidateQueries({ queryKey: ["saas-admin-users"] });
    } catch {
      // toast já é exibido pelo interceptor
    } finally {
      setRoleLoading(null);
    }
  };

  const { data: users = [], isLoading } = useQuery<AssinanteUser[]>({
    queryKey: ["saas-admin-users", filterSub],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filterSub === "com_assinatura") params.hasSubscription = "true";
      const res = await api.get("/saas/admin/users", { params });
      return res.data;
    },
  });

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
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
            Assinantes
          </h1>
          <p className="text-charcoal-light">
            Todos os usuários da plataforma
          </p>
        </div>

        <Card className="mb-6 border-gold/20">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-cream border-gold/20"
                />
              </div>
              <div className="w-full md:w-48">
                <select
                  value={filterSub}
                  onChange={(e) => setFilterSub(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gold/20 bg-cream text-charcoal text-sm"
                >
                  <option value="">Todos</option>
                  <option value="com_assinatura">Com assinatura</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/20 bg-emerald text-cream">
                  <th className="text-left p-4 text-sm font-semibold">Usuário</th>
                  <th className="text-left p-4 text-sm font-semibold">Plano</th>
                  <th className="text-left p-4 text-sm font-semibold">Status</th>
                  <th className="text-left p-4 text-sm font-semibold">Clientes BPO</th>
                  <th className="text-left p-4 text-sm font-semibold">Início</th>
                  <th className="text-left p-4 text-sm font-semibold">Vencimento</th>
                  <th className="text-right p-4 text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-charcoal-light">
                      Nenhum assinante encontrado
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const sub = user.subscription;
                    const st = sub ? subStatusLabels[sub.status] || { label: sub.status, variant: "bg-gray-500" } : null;

                    return (
                      <tr key={user.id} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-sm font-medium text-charcoal">{user.name}</p>
                              <p className="text-xs text-charcoal-light">{user.email}</p>
                            </div>
                            {user.role === 'ADMIN' && (
                              <Badge className="bg-purple-600 text-white text-xs gap-1" variant="default">
                                <Shield className="w-3 h-3" />
                                Admin
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {sub ? (
                            <div>
                              <p className="text-sm text-charcoal">{sub.plan.name}</p>
                              <p className="text-xs text-charcoal-light">{formatCurrency(Number(sub.plan.price))}/mês</p>
                            </div>
                          ) : (
                            <span className="text-sm text-charcoal-light">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          {st ? (
                            <Badge className={`${st.variant} text-white`}>{st.label}</Badge>
                          ) : (
                            <span className="text-sm text-charcoal-light">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-charcoal">{user._count.clients}</span>
                        </td>
                        <td className="p-4 text-sm text-charcoal">
                          {sub ? formatDate(sub.trialEndsAt || sub.currentPeriodEnd) : "—"}
                        </td>
                        <td className="p-4 text-sm text-charcoal">
                          {sub ? formatDate(sub.currentPeriodEnd) : "—"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {sub && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchPayments(user)}
                                className="text-gold hover:text-gold-dark hover:bg-gold/10"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleRole(user)}
                              disabled={roleLoading === user.id}
                              className={user.role === 'ADMIN' ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-100' : 'text-charcoal-light hover:text-charcoal hover:bg-charcoal/5'}
                              title={user.role === 'ADMIN' ? 'Remover admin' : 'Tornar admin'}
                            >
                              {roleLoading === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : user.role === 'ADMIN' ? (
                                <ShieldOff className="w-4 h-4" />
                              ) : (
                                <Shield className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payment History Dialog */}
        <Dialog open={paymentsDialogOpen} onOpenChange={setPaymentsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-ivory border-gold/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Histórico de Pagamentos
              </DialogTitle>
              {selectedUser && (
                <p className="text-charcoal-light">
                  {selectedUser.name} — {selectedUser.email}
                </p>
              )}
            </DialogHeader>

            {paymentsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : userPayments.length === 0 ? (
              <div className="text-center text-charcoal-light py-8">
                Nenhum pagamento encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gold/20 bg-emerald text-cream">
                      <th className="text-left p-3 text-sm font-semibold">Valor</th>
                      <th className="text-left p-3 text-sm font-semibold">Vencimento</th>
                      <th className="text-left p-3 text-sm font-semibold">Pagamento</th>
                      <th className="text-left p-3 text-sm font-semibold">Método</th>
                      <th className="text-left p-3 text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPayments.map((payment) => {
                      const st = paymentStatusLabels[payment.status] || { label: payment.status, variant: "bg-gray-500" };
                      const methodLabels: Record<string, string> = {
                        credit_card: "Cartão",
                        boleto: "Boleto",
                        pix: "Pix",
                      };
                      return (
                        <tr key={payment.id} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                          <td className="p-3 text-sm font-semibold text-charcoal">
                            {formatCurrency(Number(payment.amount))}
                          </td>
                          <td className="p-3 text-sm text-charcoal">
                            {formatDate(payment.dueDate)}
                          </td>
                          <td className="p-3 text-sm text-charcoal">
                            {payment.paidAt ? formatDate(payment.paidAt) : "—"}
                          </td>
                          <td className="p-3 text-sm text-charcoal">
                            {payment.paymentMethod ? methodLabels[payment.paymentMethod] || payment.paymentMethod : "—"}
                          </td>
                          <td className="p-3">
                            <Badge className={`${st.variant} text-white`}>
                              {st.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </BpoLayout>
  );
}
