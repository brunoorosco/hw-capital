import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Upload,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import BpoLayout from "@/components/BpoLayout";
import { maskCurrency } from "@/lib/validators";

// Mock data - substituir por dados reais da API
const mockReconciliation = {
  id: 1,
  client: "Empresa ABC Ltda",
  bank: "Banco do Brasil",
  account: "12345-6",
  period: "Janeiro 2026",
  startBalance: 45320.00,
  endBalance: 52180.00,
  bankBalance: 52180.00,
  systemBalance: 51980.00,
  difference: 200.00,
  transactions: 127,
  pending: 3,
  approved: 120,
  rejected: 4,
  status: "em_andamento",
  dueDate: "2026-02-15",
  responsible: "João Silva",
  startDate: "2026-02-01",
};

const mockPendingTransactions = [
  {
    id: 1,
    date: "2026-01-28",
    description: "TED Recebido - Cliente XYZ",
    type: "credit",
    amount: 15000.00,
    status: "pending",
    category: "Recebimento",
    document: "TED123456",
  },
  {
    id: 2,
    date: "2026-01-29",
    description: "Pagamento Fornecedor ABC",
    type: "debit",
    amount: 8500.00,
    status: "pending",
    category: "Fornecedor",
    document: "BOL789012",
  },
  {
    id: 3,
    date: "2026-01-30",
    description: "Tarifa Bancária",
    type: "debit",
    amount: 45.00,
    status: "pending",
    category: "Tarifa",
    document: "TAR345678",
  },
];

const mockDivergencias = [
  {
    id: 1,
    date: "2026-01-25",
    description: "Diferença de valor - Boleto 12345",
    expectedValue: 1500.00,
    actualValue: 1485.00,
    difference: -15.00,
    status: "investigating",
    observation: "Possível desconto não registrado",
  },
  {
    id: 2,
    date: "2026-01-27",
    description: "Lançamento duplicado - TED 67890",
    expectedValue: 0.00,
    actualValue: 3200.00,
    difference: 3200.00,
    status: "resolved",
    observation: "Lançamento duplicado removido do sistema",
  },
];

const mockTimeline = [
  {
    id: 1,
    date: "2026-02-10 14:30",
    user: "João Silva",
    action: "Iniciou reconciliação",
    type: "start",
  },
  {
    id: 2,
    date: "2026-02-10 15:45",
    user: "João Silva",
    action: "Aprovou 50 transações",
    type: "approval",
  },
  {
    id: 3,
    date: "2026-02-10 16:20",
    user: "Sistema",
    action: "Identificou 3 divergências",
    type: "alert",
  },
  {
    id: 4,
    date: "2026-02-10 17:00",
    user: "João Silva",
    action: "Adicionou observação na divergência #1",
    type: "comment",
  },
];

export default function ReconciliationDetail() {
  const [isTreatmentDialogOpen, setIsTreatmentDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [treatmentData, setTreatmentData] = useState({
    action: "",
    observation: "",
    adjustedValue: "",
  });

  const data = mockReconciliation;

  const handleApprove = () => {
    toast.success("Transação aprovada!");
  };

  const handleReject = () => {
    toast.error("Transação rejeitada!");
  };

  const openTreatmentDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setTreatmentData({
      action: "",
      observation: "",
      adjustedValue: maskCurrency(transaction.amount.toString()),
    });
    setIsTreatmentDialogOpen(true);
  };

  const handleSubmitTreatment = () => {
    toast.success("Tratativa registrada com sucesso!");
    setIsTreatmentDialogOpen(false);
  };

  const progressPercentage = ((data.approved / data.transactions) * 100).toFixed(1);

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/bpo/reconciliation">
            <Button variant="outline" size="sm" className="border-gold/30">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
              Reconciliação Bancária
            </h1>
            <p className="text-charcoal-light mt-1">{data.client} - {data.period}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-gold/30">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button className="bg-gold hover:bg-gold-light text-emerald-dark">
              <Upload className="w-4 h-4 mr-2" />
              Importar Extrato
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-charcoal-light">Saldo Inicial</p>
                  <p className="text-2xl font-bold text-charcoal">
                    R$ {data.startBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-gold opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-charcoal-light">Saldo Final (Banco)</p>
                  <p className="text-2xl font-bold text-emerald">
                    R$ {data.bankBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-emerald opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-charcoal-light">Saldo Final (Sistema)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {data.systemBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={`luxury-card ${Math.abs(data.difference) > 0 ? 'bg-red-50 border-red-300' : 'bg-emerald/5 border-emerald/20'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-charcoal-light">Diferença</p>
                  <p className={`text-2xl font-bold ${Math.abs(data.difference) > 0 ? 'text-red-600' : 'text-emerald'}`}>
                    R$ {Math.abs(data.difference).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {Math.abs(data.difference) > 0 ? (
                  <AlertTriangle className="w-8 h-8 text-red-600 opacity-50" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-emerald opacity-50" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="luxury-card bg-ivory border-gold/20 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-charcoal">Progresso da Reconciliação</span>
              <span className="text-sm font-bold text-gold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gold h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-charcoal-light">
              <span>{data.approved} aprovadas</span>
              <span>{data.pending} pendentes</span>
              <span>{data.rejected} rejeitadas</span>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Transações Pendentes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Transactions */}
            <Card className="luxury-card bg-ivory border-gold/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-charcoal flex items-center justify-between" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <span>Transações Pendentes</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    {mockPendingTransactions.length} pendentes
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/20">
                      <TableHead className="text-charcoal font-semibold">Data</TableHead>
                      <TableHead className="text-charcoal font-semibold">Descrição</TableHead>
                      <TableHead className="text-charcoal font-semibold">Categoria</TableHead>
                      <TableHead className="text-charcoal font-semibold text-right">Valor</TableHead>
                      <TableHead className="text-charcoal font-semibold text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPendingTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="border-gold/10">
                        <TableCell className="text-charcoal-light text-sm">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-semibold text-charcoal">{transaction.description}</p>
                            <p className="text-xs text-charcoal-light">Doc: {transaction.document}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-gold/30">
                            {transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${transaction.type === 'credit' ? 'text-emerald' : 'text-red-600'}`}>
                            {transaction.type === 'credit' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-emerald/30 text-emerald hover:bg-emerald/10"
                              onClick={handleApprove}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={handleReject}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gold/30 hover:bg-gold/10"
                              onClick={() => openTreatmentDialog(transaction)}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Divergências */}
            <Card className="luxury-card bg-ivory border-gold/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-charcoal flex items-center justify-between" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <span>Divergências Identificadas</span>
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {mockDivergencias.filter(d => d.status === 'investigating').length} ativas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDivergencias.map((divergencia) => (
                    <div key={divergencia.id} className="border border-gold/20 rounded-sm p-4 hover:bg-cream/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <h4 className="font-semibold text-charcoal">{divergencia.description}</h4>
                          </div>
                          <p className="text-xs text-charcoal-light mb-2">
                            Data: {new Date(divergencia.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge className={divergencia.status === 'resolved' ? 'bg-emerald/10 text-emerald border-emerald/20' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                          {divergencia.status === 'resolved' ? 'Resolvida' : 'Investigando'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-xs text-charcoal-light">Valor Esperado</p>
                          <p className="font-semibold text-charcoal">
                            R$ {divergencia.expectedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-charcoal-light">Valor Real</p>
                          <p className="font-semibold text-charcoal">
                            R$ {divergencia.actualValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-charcoal-light">Diferença</p>
                          <p className={`font-bold ${divergencia.difference < 0 ? 'text-red-600' : 'text-emerald'}`}>
                            R$ {Math.abs(divergencia.difference).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      {divergencia.observation && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3 mt-2">
                          <p className="text-xs text-charcoal-light mb-1">Observação:</p>
                          <p className="text-sm text-charcoal">{divergencia.observation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Timeline e Info */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card className="luxury-card bg-ivory border-gold/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-charcoal-light">Banco</p>
                  <p className="font-semibold text-charcoal">{data.bank}</p>
                </div>
                <div>
                  <p className="text-xs text-charcoal-light">Conta</p>
                  <p className="font-semibold text-charcoal">{data.account}</p>
                </div>
                <div>
                  <p className="text-xs text-charcoal-light">Período</p>
                  <p className="font-semibold text-charcoal">{data.period}</p>
                </div>
                <div>
                  <p className="text-xs text-charcoal-light">Responsável</p>
                  <p className="font-semibold text-charcoal">{data.responsible}</p>
                </div>
                <div>
                  <p className="text-xs text-charcoal-light">Iniciado em</p>
                  <p className="font-semibold text-charcoal">
                    {new Date(data.startDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-charcoal-light">Prazo</p>
                  <p className="font-semibold text-red-600">
                    {new Date(data.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="luxury-card bg-ivory border-gold/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-charcoal flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <Clock className="w-5 h-5 text-gold" />
                  Timeline de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTimeline.map((item, index) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.type === 'start' ? 'bg-blue-100' :
                          item.type === 'approval' ? 'bg-emerald/10' :
                          item.type === 'alert' ? 'bg-red-100' :
                          'bg-yellow-100'
                        }`}>
                          {item.type === 'start' && <Clock className="w-4 h-4 text-blue-600" />}
                          {item.type === 'approval' && <CheckCircle2 className="w-4 h-4 text-emerald" />}
                          {item.type === 'alert' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                          {item.type === 'comment' && <MessageSquare className="w-4 h-4 text-yellow-600" />}
                        </div>
                        {index < mockTimeline.length - 1 && (
                          <div className="w-0.5 h-12 bg-gold/20 my-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-semibold text-charcoal">{item.action}</p>
                        <p className="text-xs text-charcoal-light mt-1">{item.user}</p>
                        <p className="text-xs text-charcoal-light">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Treatment Dialog */}
        <Dialog open={isTreatmentDialogOpen} onOpenChange={setIsTreatmentDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-ivory border-gold/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Registrar Tratativa
              </DialogTitle>
              <DialogDescription className="text-charcoal-light">
                Adicione uma tratativa para esta transação
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="grid gap-4 py-4">
                <div className="bg-cream border border-gold/20 rounded-sm p-4">
                  <p className="text-sm font-semibold text-charcoal mb-1">{selectedTransaction.description}</p>
                  <p className="text-xs text-charcoal-light">
                    {new Date(selectedTransaction.date).toLocaleDateString('pt-BR')} • Doc: {selectedTransaction.document}
                  </p>
                  <p className={`text-lg font-bold mt-2 ${selectedTransaction.type === 'credit' ? 'text-emerald' : 'text-red-600'}`}>
                    {selectedTransaction.type === 'credit' ? '+' : '-'}R$ {selectedTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="action" className="text-charcoal font-semibold">Ação *</Label>
                  <Select value={treatmentData.action} onValueChange={(value) => setTreatmentData({ ...treatmentData, action: value })}>
                    <SelectTrigger className="bg-cream border-gold/20">
                      <SelectValue placeholder="Selecione a ação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve_with_adjustment">Aprovar com Ajuste</SelectItem>
                      <SelectItem value="request_clarification">Solicitar Esclarecimento</SelectItem>
                      <SelectItem value="mark_as_duplicate">Marcar como Duplicado</SelectItem>
                      <SelectItem value="adjust_value">Ajustar Valor</SelectItem>
                      <SelectItem value="cancel">Cancelar Transação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {treatmentData.action === 'adjust_value' && (
                  <div className="grid gap-2">
                    <Label htmlFor="adjustedValue" className="text-charcoal font-semibold">Valor Ajustado</Label>
                    <Input
                      id="adjustedValue"
                      value={treatmentData.adjustedValue}
                      onChange={(e) => setTreatmentData({ ...treatmentData, adjustedValue: maskCurrency(e.target.value) })}
                      className="bg-cream border-gold/20"
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="observation" className="text-charcoal font-semibold">Observação *</Label>
                  <Textarea
                    id="observation"
                    value={treatmentData.observation}
                    onChange={(e) => setTreatmentData({ ...treatmentData, observation: e.target.value })}
                    placeholder="Descreva a tratativa aplicada..."
                    className="bg-cream border-gold/20 min-h-[120px]"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTreatmentDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitTreatment} className="bg-gold hover:bg-gold-light text-emerald-dark">
                Registrar Tratativa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BpoLayout>
  );
}
