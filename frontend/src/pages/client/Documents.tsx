import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/lib/hooks";
import { FileText, Download, Calendar } from "lucide-react";

export default function Documents() {
  const { data: documents = [] } = useApiQuery<any[]>(["documents", "my"], "/documents/my");

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      conciliacao_bancaria: "Conciliação Bancária",
      dre: "DRE",
      fluxo_caixa: "Fluxo de Caixa",
      relatorio_mensal: "Relatório Mensal",
      relatorio_gerencial: "Relatório Gerencial",
      planejamento_financeiro: "Planejamento Financeiro",
      outros: "Outros",
    };
    return labels[type] || type;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Documentos</h1>
          <p className="text-muted-foreground mt-2">Acesse todos os seus relatórios e documentos financeiros</p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Documentos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            {!documents || documents.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum documento disponível no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-elegant transition-shadow"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{doc.title}</h3>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground">
                            {getDocumentTypeLabel(doc.type)}
                          </span>
                          {doc.referenceMonth && <span>Ref: {doc.referenceMonth}</span>}
                        </div>
                      </div>
                    </div>
                    <Button asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
