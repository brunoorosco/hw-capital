import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiQuery } from "@/lib/hooks";
import { CheckCircle2 } from "lucide-react";

export default function Plans() {
  const { data: plans = [] } = useApiQuery<any[]>(["plans"], "/plans");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestão de Planos
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualize e gerencie os planos disponíveis
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans?.map(plan => (
            <Card key={plan.id} className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.isCustom ? "Sob consulta" : `R$ ${plan.price}`}
                  </span>
                  {!plan.isCustom && (
                    <span className="text-muted-foreground text-sm">/mês</span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mt-4">
                    {plan.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {plan.features && (
                  <ul className="space-y-2">
                    {JSON.parse(plan.features).map(
                      (feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">
                            {feature}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                )}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={
                        plan.isActive ? "badge-active" : "badge-suspended"
                      }
                    >
                      {plan.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!plans || plans.length === 0) && (
          <Card className="shadow-elegant">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum plano cadastrado ainda
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
