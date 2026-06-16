import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, ArrowUpCircle, ArrowDownCircle, Calendar, Plus, Filter, Eye, Edit, Trash2, Download, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import BpoLayout from "@/components/BpoLayout";
import { maskCurrency, unmaskCurrency } from "@/lib/validators";
import { cashflowAPI, clientsAPI, type CashFlowMovement, type CashFlowSummary, type Client } from "@/lib/api-client";

interface MonthlyData {
  month: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

function buildMonthlyData(movements: CashFlowMovement[]): MonthlyData[] {
  const map = new Map<string, { entradas: number; saidas: number }>();

  for (const m of movements) {
    const date = new Date(m.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const entry = map.get(key) || { entradas: 0, saidas: 0 };

    if (m.type === "ENTRADA") {
      entry.entradas += m.amount;
    } else {
      entry.saidas += m.amount;
    }

    map.set(key, entry);
  }

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const result: MonthlyData[] = [];
  const sortedKeys = Array.from(map.keys()).sort();

  for (const key of sortedKeys) {
    const [, monthNum] = key.split("-");
    const monthIndex = parseInt(monthNum, 10) - 1;
    const data = map.get(key)!;
    result.push({
      month: monthNames[monthIndex],
      entradas: data.entradas,
      saidas: data.saidas,
      saldo: data.entradas - data.saidas,
    });
  }

  return result;
}

export default function CashFlow() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [isAddMovementDialogOpen, setIsAddMovementDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<CashFlowMovement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("todos");

  const [summary, setSummary] = useState<CashFlowSummary | null>(null);
  const [movements, setMovements] = useState<CashFlowMovement[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  const [formData, setFormData] = useState({
    type: "entrada" as "entrada" | "saida",
    description: "",
    amount: "",
    date: "",
    category: "",
    document: "",
    observation: "",
  });

  useEffect(() => {
    clientsAPI.list().then(data => {
      setClients(data);
      if (data.length > 0) {
        setSelectedClient(data[0].id);
      }
    }).catch(() => {
      toast.error("Erro ao carregar clientes");
    }).finally(() => {
      setIsPageLoading(false);
    });
  }, []);

  const fetchData = useCallback(async (clientId: string) => {
    if (!clientId) return;

    setIsLoading(true);
    try {
      const [summaryData, movementsData] = await Promise.all([
        cashflowAPI.summary({ clientId }),
        cashflowAPI.list({ clientId }),
      ]);

      setSummary(summaryData);
      setMovements(movementsData);
      setMonthlyData(buildMonthlyData(movementsData));
    } catch {
      toast.error("Erro ao carregar dados de fluxo de caixa");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchData(selectedClient);
    }
  }, [selectedClient, fetchData]);

  const resetForm = () => {
    setFormData({
      type: "entrada",
      description: "",
      amount: "",
      date: "",
      category: "",
      document: "",
      observation: "",
    });
  };

  const handleAddMovement = async () => {
    if (!formData.description || !formData.amount || !formData.date) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      const amount = parseFloat(unmaskCurrency(formData.amount)) / 100;

      await cashflowAPI.create({
        clientId: selectedClient,
        type: formData.type === "entrada" ? "ENTRADA" : "SAIDA",
        description: formData.description,
        amount,
        date: formData.date,
        category: formData.category || undefined,
        document: formData.document || undefined,
        observation: formData.observation || undefined,
      });

      toast.success("Movimentação adicionada com sucesso!");
      setIsAddMovementDialogOpen(false);
      resetForm();
      fetchData(selectedClient);
    } catch {
      toast.error("Erro ao adicionar movimentação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMovement = async () => {
    if (!selectedMovement) return;

    setIsLoading(true);
    try {
      await cashflowAPI.delete(selectedMovement.id);
      toast.success("Movimentação excluída com sucesso!");
      setIsDeleteDialogOpen(false);
      setSelectedMovement(null);
      fetchData(selectedClient);
    } catch {
      toast.error("Erro ao excluir movimentação");
    } finally {
      setIsLoading(false);
    }
  };

  const goToEdit = () => {
    setIsDetailsDialogOpen(false);
    if (selectedMovement) {
      setFormData({
        type: selectedMovement.type === "ENTRADA" ? "entrada" : "saida",
        description: selectedMovement.description,
        amount: (selectedMovement.amount * 100).toString(),
        date: selectedMovement.date.split("T")[0],
        category: selectedMovement.category || "",
        document: selectedMovement.document || "",
        observation: selectedMovement.observation || "",
      });
      setIsAddMovementDialogOpen(true);
    }
  };

  const openDetailsDialog = (movement: CashFlowMovement) => {
    setSelectedMovement(movement);
    setIsDetailsDialogOpen(true);
  };

  const confirmDelete = (movement: CashFlowMovement) => {
    setSelectedMovement(movement);
    setIsDeleteDialogOpen(true);
  };

  const filteredTransactions = movements.filter(t => {
    if (typeFilter === "todos") return true;
    return t.type === (typeFilter === "entrada" ? "ENTRADA" : "SAIDA");
  });

  const maxMonthly = Math.max(
    ...monthlyData.map(m => Math.max(m.entradas, m.saidas, 1)),
    1
  );

  if (isPageLoading) {
    return (
      <BpoLayout>
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </BpoLayout>
    );
  }

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Fluxo de Caixa
            </h1>
            <p className="text-charcoal-light">Acompanhe o fluxo de caixa dos seus clientes</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-48 bg-cream border-gold/20">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32 bg-cream border-gold/20">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-charcoal-light mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Carregando dados...</span>
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="luxury-card bg-emerald/5 border-emerald/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald/10 rounded-sm flex items-center justify-center">
                  <ArrowUpCircle className="w-5 h-5 text-emerald" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-light">Entradas</p>
                  <p className="text-lg font-bold text-emerald">
                    {summary ? `R$ ${summary.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-sm flex items-center justify-center">
                  <ArrowDownCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-light">Saídas</p>
                  <p className="text-lg font-bold text-red-600">
                    {summary ? `R$ ${summary.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-light">Fluxo Líquido</p>
                  <p className="text-lg font-bold text-blue-600">
                    {summary ? `R$ ${summary.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold/10 rounded-sm flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-light">Total Movimentações</p>
                  <p className="text-lg font-bold text-charcoal">
                    {summary ? summary.totalMovimentos : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Evolução Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length === 0 ? (
                <p className="text-sm text-charcoal-light text-center py-8">Nenhum dado disponível para este cliente</p>
              ) : (
                <div className="space-y-4">
                  {monthlyData.map((month, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-charcoal">{month.month}</span>
                        <span className={`text-sm font-bold ${month.saldo >= 0 ? "text-emerald" : "text-red-600"}`}>
                          R$ {month.saldo.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex gap-2 h-8">
                        <div
                          className="bg-emerald/20 rounded-sm flex items-center justify-center text-xs font-semibold text-emerald transition-all"
                          style={{ width: `${(month.entradas / maxMonthly) * 100}%` }}
                        >
                          {month.entradas > maxMonthly * 0.6 && `R$ ${(month.entradas / 1000).toFixed(0)}k`}
                        </div>
                        <div
                          className="bg-red-200 rounded-sm flex items-center justify-center text-xs font-semibold text-red-800 transition-all"
                          style={{ width: `${(month.saidas / maxMonthly) * 100}%` }}
                        >
                          {month.saidas > maxMonthly * 0.6 && `R$ ${(month.saidas / 1000).toFixed(0)}k`}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 justify-center pt-4 border-t border-gold/10">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald/20 rounded-sm"></div>
                      <span className="text-xs text-charcoal-light">Entradas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-200 rounded-sm"></div>
                      <span className="text-xs text-charcoal-light">Saídas</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Movimentações
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32 bg-cream border-gold/20 h-8 text-xs">
                      <Filter className="w-3 h-3 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="entrada">Entradas</SelectItem>
                      <SelectItem value="saida">Saídas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <p className="text-sm text-charcoal-light text-center py-8">Nenhuma movimentação encontrada</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-start gap-3 pb-3 border-b border-gold/10 last:border-0">
                      <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${
                        transaction.type === "ENTRADA" ? "bg-emerald/10" : "bg-red-50"
                      }`}>
                        {transaction.type === "ENTRADA" ? (
                          <ArrowUpCircle className="w-4 h-4 text-emerald" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-charcoal truncate">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {transaction.category && (
                            <Badge variant="outline" className="text-xs border-gold/30">
                              {transaction.category}
                            </Badge>
                          )}
                          <span className="text-xs text-charcoal-light">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold shrink-0 ${
                          transaction.type === "ENTRADA" ? "text-emerald" : "text-red-600"
                        }`}>
                          {transaction.type === "ENTRADA" ? "+" : "-"}R$ {transaction.amount.toLocaleString('pt-BR')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => openDetailsDialog(transaction)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" className="border-gold/30 hover:bg-gold/10">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button
            onClick={() => setIsAddMovementDialogOpen(true)}
            className="bg-gold hover:bg-gold-light text-emerald-dark font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Movimentação
          </Button>
        </div>

        {/* Add Movement Dialog */}
        <Dialog open={isAddMovementDialogOpen} onOpenChange={setIsAddMovementDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-ivory border-gold/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Nova Movimentação
              </DialogTitle>
              <DialogDescription className="text-charcoal-light">
                Adicione uma nova movimentação ao fluxo de caixa
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-charcoal font-semibold">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value: "entrada" | "saida") => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-cream border-gold/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="w-4 h-4 text-emerald" />
                        Entrada
                      </div>
                    </SelectItem>
                    <SelectItem value="saida">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="w-4 h-4 text-red-600" />
                        Saída
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-charcoal font-semibold">Descrição *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Recebimento de Cliente XYZ"
                  className="bg-cream border-gold/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount" className="text-charcoal font-semibold">Valor *</Label>
                  <Input
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: maskCurrency(e.target.value) })}
                    placeholder="R$ 0,00"
                    className="bg-cream border-gold/20"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="date" className="text-charcoal font-semibold">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-cream border-gold/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category" className="text-charcoal font-semibold">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="bg-cream border-gold/20">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="fornecedores">Fornecedores</SelectItem>
                      <SelectItem value="salarios">Salários</SelectItem>
                      <SelectItem value="despesas-fixas">Despesas Fixas</SelectItem>
                      <SelectItem value="investimentos">Investimentos</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="document" className="text-charcoal font-semibold">Documento</Label>
                  <Input
                    id="document"
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    placeholder="Ex: NF-12345"
                    className="bg-cream border-gold/20"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="observation" className="text-charcoal font-semibold">Observação</Label>
                <Textarea
                  id="observation"
                  value={formData.observation}
                  onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                  placeholder="Informações adicionais..."
                  className="bg-cream border-gold/20 min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => { setIsAddMovementDialogOpen(false); resetForm(); }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddMovement}
                className="bg-gold hover:bg-gold-light text-emerald-dark"
                disabled={isLoading}
              >
                {isLoading ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Movement Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-ivory border-gold/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Detalhes da Movimentação
              </DialogTitle>
            </DialogHeader>
            {selectedMovement && (
              <div className="space-y-4 py-4">
                <div className={`p-4 rounded-sm border-2 ${
                  selectedMovement.type === "ENTRADA"
                    ? "bg-emerald/5 border-emerald/20"
                    : "bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    {selectedMovement.type === "ENTRADA" ? (
                      <ArrowUpCircle className="w-6 h-6 text-emerald" />
                    ) : (
                      <ArrowDownCircle className="w-6 h-6 text-red-600" />
                    )}
                    <Badge className={selectedMovement.type === "ENTRADA"
                      ? "bg-emerald/10 text-emerald border-emerald/20"
                      : "bg-red-100 text-red-800 border-red-200"
                    }>
                      {selectedMovement.type === "ENTRADA" ? "Entrada" : "Saída"}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-charcoal mb-1">{selectedMovement.description}</h3>
                  <p className={`text-3xl font-bold ${
                    selectedMovement.type === "ENTRADA" ? "text-emerald" : "text-red-600"
                  }`}>
                    {selectedMovement.type === "ENTRADA" ? "+" : "-"}R$ {selectedMovement.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-charcoal-light">Data</p>
                    <p className="font-semibold text-charcoal">
                      {new Date(selectedMovement.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-light">Categoria</p>
                    <Badge variant="outline" className="mt-1 border-gold/30">
                      {selectedMovement.category || "—"}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gold/20">
                  <Button
                    variant="outline"
                    className="flex-1 border-gold/30 hover:bg-gold/10"
                    onClick={goToEdit}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => { setIsDetailsDialogOpen(false); confirmDelete(selectedMovement); }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-ivory border-gold/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription className="text-charcoal-light">
                {selectedMovement && (
                  <>
                    Tem certeza que deseja excluir esta movimentação?
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-sm">
                      <p className="text-sm font-semibold text-charcoal mb-1">
                        {selectedMovement.description}
                      </p>
                      <p className={`text-lg font-bold ${
                        selectedMovement.type === "ENTRADA" ? "text-emerald" : "text-red-600"
                      }`}>
                        {selectedMovement.type === "ENTRADA" ? "+" : "-"}R$ {selectedMovement.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-charcoal-light mt-1">
                        {new Date(selectedMovement.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-red-600">
                      ⚠️ Esta ação não pode ser desfeita.
                    </p>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="border-gold/30"
                disabled={isLoading}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMovement}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Excluindo..." : "Excluir Movimentação"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </BpoLayout>
  );
}
