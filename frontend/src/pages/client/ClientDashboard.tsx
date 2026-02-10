import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/lib/hooks";
import { FileText, CreditCard, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function ClientDashboard() {
  const { data: subscriptionData } = useApiQuery<any>(["subscriptions", "my-with-plan"], "/subscriptions/my-with-plan");
  const { data: documents = [] } = useApiQuery<any[]>(["documents", "my"], "/documents/my");
  const { data: payments = [] } = useApiQuery<any[]>(["payments", "my"], "/payments/my");

  const subscription = subscriptionData?.subscription;
  const plan = subscriptionData?.plan;

  const recentDocuments = documents?.slice(0, 5) || [];
  const recentPayments = payments?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Dashboard</h1>
          <p className="text-muted-foreground mt-2">Bem-vindo à sua área de cliente HW Capital</p>
        </div>

        {/* Subscription Card */}
        {subscription && plan ? (
          <Card className="shadow-elegant-lg border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">Plano atual</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {subscription.customPrice ? `R$ ${subscription.customPrice}` : `R$ ${plan.price}`}
                  </div>
                  <div className="text-sm text-muted-foreground">/mês</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={subscription.status === "active" ? "badge-active" : "badge-pending"}>
                    {subscription.status === "active" ? "Ativa" : subscription.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Data de início:</span>
                  <span className="font-medium">{new Date(subscription.startDate).toLocaleDateString("pt-BR")}</span>
                </div>
                {plan.features && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold mb-3">Serviços incluídos:</p>
                    <ul className="space-y-2">
                      {JSON.parse(plan.features).slice(0, 4).map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-elegant">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Você ainda não possui um plano ativo</p>
              <Button className="mt-4" asChild>
                <Link href="/">Ver Planos Disponíveis</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Documents */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Documentos Recentes
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/documents">Ver todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentDocuments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum documento disponível</p>
              ) : (
                <div className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{doc.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          Abrir
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Pagamentos Recentes
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/payments">Ver todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum pagamento registrado</p>
              ) : (
                <div className="space-y-3">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">R$ {payment.amount}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vencimento: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <span
                        className={
                          payment.status === "paid"
                            ? "badge-paid"
                            : payment.status === "overdue"
                              ? "badge-overdue"
                              : "badge-pending"
                        }
                      >
                        {payment.status === "paid"
                          ? "Pago"
                          : payment.status === "overdue"
                            ? "Atrasado"
                            : "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
