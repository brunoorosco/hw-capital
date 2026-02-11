import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, CheckCircle2, AlertCircle, Clock, Download, Plus, Upload, X } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import BpoLayout from "@/components/BpoLayout";
import { maskCurrency } from "@/lib/validators";

const mockReconciliations = [
  {
    id: 1,
    client: "Empresa ABC Ltda",
    bank: "Banco do Brasil",
    period: "Janeiro 2026",
    startBalance: "R$ 45.320,00",
    endBalance: "R$ 52.180,00",
    transactions: 127,
    pending: 3,
    status: "pendente",
    dueDate: "2026-02-15",
  },
  {
    id: 2,
    client: "XYZ Comércio",
    bank: "Itaú",
    period: "Janeiro 2026",
    startBalance: "R$ 23.450,00",
    endBalance: "R$ 28.920,00",
    transactions: 89,
    pending: 0,
    status: "concluído",
    dueDate: "2026-02-10",
  },
  {
    id: 3,
    client: "Tech Solutions",
    bank: "Santander",
    period: "Janeiro 2026",
    startBalance: "R$ 98.200,00",
    endBalance: "R$ 105.340,00",
    transactions: 234,
    pending: 8,
    status: "em_andamento",
    dueDate: "2026-02-18",
  },
  {
    id: 4,
    client: "Serviços Pro Ltda",
    bank: "Bradesco",
    period: "Dezembro 2025",
    startBalance: "R$ 67.890,00",
    endBalance: "R$ 71.230,00",
    transactions: 156,
    pending: 12,
    status: "atrasado",
    dueDate: "2026-01-31",
  },
];

export default function Reconciliation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    client: "",
    bank: "",
    account: "",
    period: "",
    startBalance: "",
    responsible: "",
    dueDate: "",
    observations: "",
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "concluído":
        return { label: "Concluído", color: "bg-emerald/10 text-emerald border-emerald/20", icon: CheckCircle2 };
      case "em_andamento":
        return { label: "Em Andamento", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock };
      case "pendente":
        return { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertCircle };
      case "atrasado":
        return { label: "Atrasado", color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800 border-gray-200", icon: Clock };
    }
  };

  const filteredReconciliations = mockReconciliations.filter(rec => {
    const matchesSearch = rec.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.bank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockReconciliations.length,
    concluido: mockReconciliations.filter(r => r.status === "concluído").length,
    pendente: mockReconciliations.filter(r => r.status === "pendente").length,
    atrasado: mockReconciliations.filter(r => r.status === "atrasado").length,
  };

  const resetForm = () => {
    setFormData({
      client: "",
      bank: "",
      account: "",
      period: "",
      startBalance: "",
      responsible: "",
      dueDate: "",
      observations: "",
    });
    setUploadedFile(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`Arquivo ${file.name} carregado!`);
    }
  };

  const handleCreateReconciliation = async () => {
    if (!formData.client || !formData.bank || !formData.period) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Reconciliação criada com sucesso!");
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao criar reconciliação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Conciliação Bancária
            </h1>
            <p className="text-charcoal-light">Gerencie e reconcilie as movimentações bancárias dos clientes</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gold hover:bg-gold-light text-emerald-dark font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Reconciliação
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-charcoal">{stats.total}</p>
                <p className="text-sm text-charcoal-light mt-1">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="luxury-card bg-emerald/5 border-emerald/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald">{stats.concluido}</p>
                <p className="text-sm text-charcoal-light mt-1">Concluídas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="luxury-card bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-800">{stats.pendente}</p>
                <p className="text-sm text-charcoal-light mt-1">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="luxury-card bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-800">{stats.atrasado}</p>
                <p className="text-sm text-charcoal-light mt-1">Atrasadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="luxury-card bg-ivory border-gold/20 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por cliente ou banco..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-cream border-gold/20 focus:border-gold"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-cream border-gold/20">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="concluído">Concluído</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-gold hover:bg-gold-light text-emerald-dark font-semibold">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reconciliations Table */}
        <Card className="luxury-card bg-ivory border-gold/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
              Conciliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gold/20">
                    <TableHead className="text-charcoal font-semibold">Cliente</TableHead>
                    <TableHead className="text-charcoal font-semibold">Banco</TableHead>
                    <TableHead className="text-charcoal font-semibold">Período</TableHead>
                    <TableHead className="text-charcoal font-semibold">Saldo Inicial</TableHead>
                    <TableHead className="text-charcoal font-semibold">Saldo Final</TableHead>
                    <TableHead className="text-charcoal font-semibold text-center">Transações</TableHead>
                    <TableHead className="text-charcoal font-semibold text-center">Pendentes</TableHead>
                    <TableHead className="text-charcoal font-semibold">Prazo</TableHead>
                    <TableHead className="text-charcoal font-semibold">Status</TableHead>
                    <TableHead className="text-charcoal font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReconciliations.map((rec) => {
                    const statusInfo = getStatusInfo(rec.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <TableRow key={rec.id} className="border-gold/10 hover:bg-cream/50">
                        <TableCell className="font-semibold text-charcoal">{rec.client}</TableCell>
                        <TableCell className="text-charcoal-light">{rec.bank}</TableCell>
                        <TableCell className="text-charcoal-light">{rec.period}</TableCell>
                        <TableCell className="text-charcoal-light">{rec.startBalance}</TableCell>
                        <TableCell className="text-charcoal-light font-semibold">{rec.endBalance}</TableCell>
                        <TableCell className="text-center text-charcoal-light">{rec.transactions}</TableCell>
                        <TableCell className="text-center">
                          {rec.pending > 0 ? (
                            <span className="text-red-600 font-semibold">{rec.pending}</span>
                          ) : (
                            <span className="text-emerald font-semibold">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-charcoal-light text-sm">
                          {new Date(rec.dueDate).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusInfo.color} border`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/bpo/reconciliation/${rec.id}`}>
                            <Button size="sm" variant="outline" className="border-gold/30 hover:bg-gold/10">
                              Abrir
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredReconciliations.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-charcoal-light mx-auto mb-4 opacity-50" />
                <p className="text-lg text-charcoal-light">Nenhuma conciliação encontrada</p>
                <p className="text-sm text-charcoal-light mt-2">Tente ajustar seus filtros</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Reconciliation Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[700px] bg-ivory border-gold/30 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Nova Reconciliação Bancária
              </DialogTitle>
              <DialogDescription className="text-charcoal-light">
                Inicie uma nova reconciliação bancária para um cliente
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Cliente e Banco */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="client" className="text-charcoal font-semibold">Cliente *</Label>
                  <Select value={formData.client} onValueChange={(value) => setFormData({ ...formData, client: value })}>
                    <SelectTrigger className="bg-cream border-gold/20">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empresa-abc">Empresa ABC Ltda</SelectItem>
                      <SelectItem value="xyz-comercio">XYZ Comércio</SelectItem>
                      <SelectItem value="tech-solutions">Tech Solutions</SelectItem>
                      <SelectItem value="servicos-pro">Serviços Pro Ltda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bank" className="text-charcoal font-semibold">Banco *</Label>
                  <Select value={formData.bank} onValueChange={(value) => setFormData({ ...formData, bank: value })}>
                    <SelectTrigger className="bg-cream border-gold/20">
                      <SelectValue placeholder="Selecione o banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bb">Banco do Brasil</SelectItem>
                      <SelectItem value="itau">Itaú</SelectItem>
                      <SelectItem value="santander">Santander</SelectItem>
                      <SelectItem value="bradesco">Bradesco</SelectItem>
                      <SelectItem value="caixa">Caixa Econômica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conta e Período */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="account" className="text-charcoal font-semibold">Conta</Label>
                  <Input
                    id="account"
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                    placeholder="12345-6"
                    className="bg-cream border-gold/20"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="period" className="text-charcoal font-semibold">Período *</Label>
                  <Input
                    id="period"
                    type="month"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="bg-cream border-gold/20"
                  />
                </div>
              </div>

              {/* Saldo Inicial e Responsável */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startBalance" className="text-charcoal font-semibold">Saldo Inicial</Label>
                  <Input
                    id="startBalance"
                    value={formData.startBalance}
                    onChange={(e) => setFormData({ ...formData, startBalance: maskCurrency(e.target.value) })}
                    placeholder="R$ 0,00"
                    className="bg-cream border-gold/20"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="responsible" className="text-charcoal font-semibold">Responsável</Label>
                  <Input
                    id="responsible"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder="Nome do responsável"
                    className="bg-cream border-gold/20"
                  />
                </div>
              </div>

              {/* Prazo */}
              <div className="grid gap-2">
                <Label htmlFor="dueDate" className="text-charcoal font-semibold">Prazo para Conclusão</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="bg-cream border-gold/20"
                />
              </div>

              {/* Upload de Extrato */}
              <div className="grid gap-2">
                <Label className="text-charcoal font-semibold">Extrato Bancário</Label>
                <div className="border-2 border-dashed border-gold/30 rounded-sm p-6 bg-cream hover:bg-cream/70 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.xlsx,.xls,.csv,.ofx"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-10 h-10 text-gold mb-2" />
                    <p className="text-sm font-semibold text-charcoal">Clique para fazer upload</p>
                    <p className="text-xs text-charcoal-light mt-1">PDF, Excel, CSV ou OFX</p>
                  </label>
                </div>
                {uploadedFile && (
                  <div className="flex items-center justify-between bg-emerald/10 border border-emerald/20 rounded-sm p-3 mt-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald" />
                      <span className="text-sm font-semibold text-charcoal">{uploadedFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div className="grid gap-2">
                <Label htmlFor="observations" className="text-charcoal font-semibold">Observações</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Informações adicionais sobre esta reconciliação..."
                  className="bg-cream border-gold/20 min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateReconciliation} 
                className="bg-gold hover:bg-gold-light text-emerald-dark"
                disabled={isLoading}
              >
                {isLoading ? "Criando..." : "Criar Reconciliação"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BpoLayout>
  );
}
