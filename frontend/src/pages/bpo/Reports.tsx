import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, TrendingUp, FileBarChart, FileSpreadsheet, Building2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BpoLayout from "@/components/BpoLayout";

const mockClients = [
  { id: 1, name: "Empresa ABC Ltda" },
  { id: 2, name: "XYZ Comércio" },
  { id: 3, name: "Tech Solutions" },
  { id: 4, name: "Serviços Pro Ltda" },
];

const reportTypes = [
  {
    id: "dre",
    name: "DRE - Demonstrativo de Resultados",
    icon: FileBarChart,
    description: "Demonstrativo completo de receitas, custos e despesas",
    color: "bg-emerald/10 text-emerald border-emerald/20",
  },
  {
    id: "balanco",
    name: "Balanço Patrimonial",
    icon: FileSpreadsheet,
    description: "Ativo, passivo e patrimônio líquido",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "fluxo",
    name: "Demonstrativo de Fluxo de Caixa",
    icon: TrendingUp,
    description: "Análise detalhada das movimentações financeiras",
    color: "bg-gold/10 text-gold border-gold/20",
  },
  {
    id: "gerencial",
    name: "Relatório Gerencial",
    icon: FileText,
    description: "Análises e indicadores de performance",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
];

const mockDREData = {
  period: "Janeiro 2026",
  client: "Empresa ABC Ltda",
  receitas: {
    vendasProdutos: 250000,
    vendasServicos: 180000,
    outrasReceitas: 25000,
    total: 455000,
  },
  custosVariaveis: {
    cme: 120000,
    comissoes: 35000,
    impostos: 45000,
    total: 200000,
  },
  margemBruta: 255000,
  despesasOperacionais: {
    salarios: 85000,
    aluguel: 12000,
    marketing: 18000,
    administrativas: 22000,
    outras: 8000,
    total: 145000,
  },
  ebitda: 110000,
  depreciacaoAmortizacao: 15000,
  resultadoOperacional: 95000,
  resultadoFinanceiro: -8000,
  lucroLiquido: 87000,
};

const recentReports = [
  { id: 1, client: "Empresa ABC Ltda", type: "DRE", period: "Janeiro 2026", date: "2026-02-08", status: "Disponível" },
  { id: 2, client: "XYZ Comércio", type: "Balanço", period: "Janeiro 2026", date: "2026-02-07", status: "Disponível" },
  { id: 3, client: "Tech Solutions", type: "Gerencial", period: "Janeiro 2026", date: "2026-02-06", status: "Em processamento" },
  { id: 4, client: "Serviços Pro Ltda", type: "DRE", period: "Dezembro 2025", date: "2026-01-10", status: "Disponível" },
  { id: 5, client: "Empresa ABC Ltda", type: "Fluxo de Caixa", period: "Dezembro 2025", date: "2026-01-08", status: "Disponível" },
];

export default function Reports() {
  const [selectedClient, setSelectedClient] = useState("1");
  const [selectedPeriod, setSelectedPeriod] = useState("202601");
  const [viewMode, setViewMode] = useState<"list" | "dre">("list");

  const dreData = mockDREData;
  const margemBrutaPercentual = ((dreData.margemBruta / dreData.receitas.total) * 100).toFixed(1);
  const margemLiquidaPercentual = ((dreData.lucroLiquido / dreData.receitas.total) * 100).toFixed(1);
  const ebitdaPercentual = ((dreData.ebitda / dreData.receitas.total) * 100).toFixed(1);

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Relatórios Financeiros
            </h1>
            <p className="text-charcoal-light">Relatórios gerenciais e demonstrativos contábeis</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-gold hover:bg-gold-light text-emerald-dark" : ""}
            >
              Lista de Relatórios
            </Button>
            <Button 
              variant={viewMode === "dre" ? "default" : "outline"}
              onClick={() => setViewMode("dre")}
              className={viewMode === "dre" ? "bg-gold hover:bg-gold-light text-emerald-dark" : ""}
            >
              Gerar DRE
            </Button>
          </div>
        </div>

        {viewMode === "list" ? (
          <>
            {/* Report Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <Card key={report.id} className="luxury-card bg-ivory border-gold/20 hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className={`w-16 h-16 rounded-sm flex items-center justify-center ${report.color} border`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-bold text-charcoal mb-1">{report.name}</h3>
                          <p className="text-xs text-charcoal-light">{report.description}</p>
                        </div>
                        <Button size="sm" className="w-full bg-gold hover:bg-gold-light text-emerald-dark">
                          Gerar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Reports */}
            <Card className="luxury-card bg-ivory border-gold/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Relatórios Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border border-gold/10 rounded-sm hover:bg-cream/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald/10 rounded-sm flex items-center justify-center">
                          <FileText className="w-6 h-6 text-emerald" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-charcoal">{report.client}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="text-xs border-gold/30">
                              {report.type}
                            </Badge>
                            <span className="text-xs text-charcoal-light">{report.period}</span>
                            <span className="text-xs text-charcoal-light">
                              {new Date(report.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={report.status === "Disponível" ? "bg-emerald/10 text-emerald border-emerald/20" : "bg-yellow-100 text-yellow-800 border-yellow-200"}>
                          {report.status}
                        </Badge>
                        {report.status === "Disponível" && (
                          <Button size="sm" variant="outline" className="border-gold/30 hover:bg-gold/10">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* DRE Generator */}
            <div className="flex gap-4 mb-6">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-64 bg-cream border-gold/20">
                  <Building2 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48 bg-cream border-gold/20">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="202601">Janeiro 2026</SelectItem>
                  <SelectItem value="202512">Dezembro 2025</SelectItem>
                  <SelectItem value="202511">Novembro 2025</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-gold hover:bg-gold-light text-emerald-dark font-semibold ml-auto">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>

            {/* DRE Display */}
            <Card className="luxury-card bg-ivory border-gold/20 mb-6">
              <CardHeader className="bg-emerald text-cream">
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    DRE - Demonstrativo de Resultados do Exercício
                  </CardTitle>
                  <p className="text-cream/90">{dreData.client}</p>
                  <p className="text-cream/80 text-sm">{dreData.period}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Receitas */}
                  <div>
                    <h3 className="font-bold text-lg text-charcoal mb-3 pb-2 border-b-2 border-gold/30">
                      RECEITA OPERACIONAL BRUTA
                    </h3>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Vendas de Produtos</span>
                        <span className="font-semibold">R$ {dreData.receitas.vendasProdutos.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Vendas de Serviços</span>
                        <span className="font-semibold">R$ {dreData.receitas.vendasServicos.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Outras Receitas</span>
                        <span className="font-semibold">R$ {dreData.receitas.outrasReceitas.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gold/20">
                        <span className="font-bold text-charcoal">RECEITA BRUTA TOTAL</span>
                        <span className="font-bold text-emerald text-lg">R$ {dreData.receitas.total.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Custos e Deduções */}
                  <div>
                    <h3 className="font-bold text-lg text-charcoal mb-3 pb-2 border-b-2 border-gold/30">
                      (-) CUSTOS VARIÁVEIS E DEDUÇÕES
                    </h3>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">CMV/CPV</span>
                        <span className="font-semibold text-red-600">R$ {dreData.custosVariaveis.cme.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Comissões</span>
                        <span className="font-semibold text-red-600">R$ {dreData.custosVariaveis.comissoes.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Impostos sobre Vendas</span>
                        <span className="font-semibold text-red-600">R$ {dreData.custosVariaveis.impostos.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gold/20">
                        <span className="font-bold text-charcoal">TOTAL CUSTOS VARIÁVEIS</span>
                        <span className="font-bold text-red-600 text-lg">R$ {dreData.custosVariaveis.total.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Margem Bruta */}
                  <div className="bg-emerald/5 p-4 rounded-sm border border-emerald/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-xl text-charcoal">MARGEM BRUTA</span>
                        <span className="ml-3 text-sm text-emerald font-semibold">({margemBrutaPercentual}%)</span>
                      </div>
                      <span className="font-bold text-emerald text-2xl">R$ {dreData.margemBruta.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Despesas Operacionais */}
                  <div>
                    <h3 className="font-bold text-lg text-charcoal mb-3 pb-2 border-b-2 border-gold/30">
                      (-) DESPESAS OPERACIONAIS
                    </h3>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Salários e Encargos</span>
                        <span className="font-semibold text-red-600">R$ {dreData.despesasOperacionais.salarios.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Aluguel</span>
                        <span className="font-semibold text-red-600">R$ {dreData.despesasOperacionais.aluguel.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Marketing e Publicidade</span>
                        <span className="font-semibold text-red-600">R$ {dreData.despesasOperacionais.marketing.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Despesas Administrativas</span>
                        <span className="font-semibold text-red-600">R$ {dreData.despesasOperacionais.administrativas.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Outras Despesas</span>
                        <span className="font-semibold text-red-600">R$ {dreData.despesasOperacionais.outras.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gold/20">
                        <span className="font-bold text-charcoal">TOTAL DESPESAS OPERACIONAIS</span>
                        <span className="font-bold text-red-600 text-lg">R$ {dreData.despesasOperacionais.total.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* EBITDA */}
                  <div className="bg-blue-50 p-4 rounded-sm border border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-xl text-charcoal">EBITDA</span>
                        <span className="ml-3 text-sm text-blue-600 font-semibold">({ebitdaPercentual}%)</span>
                      </div>
                      <span className="font-bold text-blue-600 text-2xl">R$ {dreData.ebitda.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Depreciação */}
                  <div className="ml-4">
                    <div className="flex justify-between">
                      <span className="text-charcoal-light">(-) Depreciação e Amortização</span>
                      <span className="font-semibold text-red-600">R$ {dreData.depreciacaoAmortizacao.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Resultado Operacional */}
                  <div className="bg-gold/10 p-4 rounded-sm border border-gold/30">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xl text-charcoal">RESULTADO OPERACIONAL</span>
                      <span className="font-bold text-gold text-2xl">R$ {dreData.resultadoOperacional.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Resultado Financeiro */}
                  <div className="ml-4">
                    <div className="flex justify-between">
                      <span className="text-charcoal-light">Resultado Financeiro (Receitas - Despesas Financeiras)</span>
                      <span className="font-semibold text-red-600">R$ {dreData.resultadoFinanceiro.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Lucro Líquido */}
                  <div className="bg-emerald text-cream p-6 rounded-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-2xl">LUCRO LÍQUIDO</span>
                        <span className="ml-3 text-lg text-gold font-semibold">({margemLiquidaPercentual}%)</span>
                      </div>
                      <span className="font-bold text-gold text-3xl">R$ {dreData.lucroLiquido.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="luxury-card bg-emerald/5 border-emerald/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-charcoal-light mb-2">Margem Bruta</p>
                    <p className="text-3xl font-bold text-emerald">{margemBrutaPercentual}%</p>
                    <p className="text-xs text-charcoal-light mt-2">
                      {parseFloat(margemBrutaPercentual) > 50 ? "Excelente" : "Bom"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="luxury-card bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-charcoal-light mb-2">EBITDA %</p>
                    <p className="text-3xl font-bold text-blue-600">{ebitdaPercentual}%</p>
                    <p className="text-xs text-charcoal-light mt-2">
                      {parseFloat(ebitdaPercentual) > 20 ? "Excelente" : "Bom"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="luxury-card bg-gold/5 border-gold/30">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-charcoal-light mb-2">Margem Líquida</p>
                    <p className="text-3xl font-bold text-gold">{margemLiquidaPercentual}%</p>
                    <p className="text-xs text-charcoal-light mt-2">
                      {parseFloat(margemLiquidaPercentual) > 15 ? "Excelente" : "Bom"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </BpoLayout>
  );
}
