import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import BpoLayout from "@/components/BpoLayout";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

interface Client {
  id: string;
  name: string;
}

interface Reconciliation {
  id: string;
  clientId: string;
  client: Client;
  bank: string;
  account: string;
  period: string;
  startBalance: number;
  endBalance: number | null;
  bankBalance: number | null;
  systemBalance: number | null;
  difference: number | null;
  status: string;
  responsible: string;
  startDate: string;
  dueDate: string | null;
  completedAt: string | null;
  observations: string | null;
}

export default function Reconciliation() {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReconciliation, setSelectedReconciliation] = useState<Reconciliation | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    clientId: "",
    bank: "",
    account: "",
    period: "",
    startBalance: "",
    endBalance: "",
    bankBalance: "",
    systemBalance: "",
    status: "PENDING",
    responsible: "",
    startDate: "",
    dueDate: "",
    observations: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reconciliationsRes, clientsRes] = await Promise.all([
        api.get<Reconciliation[]>('/reconciliations'),
        api.get<Client[]>('/clients'),
      ]);

      setReconciliations(reconciliationsRes.data);
      setClients(clientsRes.data.filter((c: any) => c.status === 'active'));
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setSubmitting(true);
      const response = await api.post<Reconciliation>('/reconciliations', {
        ...formData,
        startBalance: parseFloat(formData.startBalance),
        endBalance: formData.endBalance ? parseFloat(formData.endBalance) : null,
        bankBalance: formData.bankBalance ? parseFloat(formData.bankBalance) : null,
        systemBalance: formData.systemBalance ? parseFloat(formData.systemBalance) : null,
      });

      setReconciliations([...reconciliations, response.data]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Reconciliação criada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar reconciliação:', error);
      toast.error('Erro ao criar reconciliação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedReconciliation) return;

    try {
      setSubmitting(true);
      const response = await api.put<Reconciliation>(`/reconciliations/${selectedReconciliation.id}`, {
        ...formData,
        startBalance: parseFloat(formData.startBalance),
        endBalance: formData.endBalance ? parseFloat(formData.endBalance) : null,
        bankBalance: formData.bankBalance ? parseFloat(formData.bankBalance) : null,
        systemBalance: formData.systemBalance ? parseFloat(formData.systemBalance) : null,
      });

      setReconciliations(reconciliations.map(r => r.id === selectedReconciliation.id ? response.data : r));
      setIsEditDialogOpen(false);
      setSelectedReconciliation(null);
      resetForm();
      toast.success('Reconciliação atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar reconciliação:', error);
      toast.error('Erro ao atualizar reconciliação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReconciliation) return;

    try {
      await api.delete(`/reconciliations/${selectedReconciliation.id}`);
      setReconciliations(reconciliations.filter(r => r.id !== selectedReconciliation.id));
      setIsDeleteDialogOpen(false);
      setSelectedReconciliation(null);
      toast.success('Reconciliação deletada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao deletar reconciliação:', error);
      toast.error('Erro ao deletar reconciliação');
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (reconciliation: Reconciliation) => {
    setSelectedReconciliation(reconciliation);
    setFormData({
      clientId: reconciliation.clientId,
      bank: reconciliation.bank,
      account: reconciliation.account,
      period: reconciliation.period,
      startBalance: reconciliation.startBalance.toString(),
      endBalance: reconciliation.endBalance?.toString() || "",
      bankBalance: reconciliation.bankBalance?.toString() || "",
      systemBalance: reconciliation.systemBalance?.toString() || "",
      status: reconciliation.status,
      responsible: reconciliation.responsible,
      startDate: reconciliation.startDate.split('T')[0],
      dueDate: reconciliation.dueDate ? reconciliation.dueDate.split('T')[0] : "",
      observations: reconciliation.observations || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (reconciliation: Reconciliation) => {
    setSelectedReconciliation(reconciliation);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      bank: "",
      account: "",
      period: "",
      startBalance: "",
      endBalance: "",
      bankBalance: "",
      systemBalance: "",
      status: "PENDING",
      responsible: "",
      startDate: "",
      dueDate: "",
      observations: "",
    });
  };

  const filteredReconciliations = reconciliations.filter(recon =>
    recon.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recon.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recon.period.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'IN_PROGRESS': 'text-blue-600 bg-blue-100',
      'COMPLETED': 'text-green-600 bg-green-100',
      'CANCELLED': 'text-red-600 bg-red-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'Pendente',
      'IN_PROGRESS': 'Em Progresso',
      'COMPLETED': 'Concluída',
      'CANCELLED': 'Cancelada',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <BpoLayout>
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <Card key={i} className="luxury-card bg-ivory border-gold/20">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </BpoLayout>
    );
  }

  const pendingCount = reconciliations.filter(r => r.status === 'PENDING').length;
  const inProgressCount = reconciliations.filter(r => r.status === 'IN_PROGRESS').length;
  const completedCount = reconciliations.filter(r => r.status === 'COMPLETED').length;

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
            Reconciliações Bancárias
          </h1>
          <Button 
            onClick={openCreateDialog} 
            className="bg-gradient-to-r from-gold to-gold-dark text-white hover:from-gold-dark hover:to-gold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Reconciliação
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">Pendentes</CardTitle>
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">{pendingCount}</div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">Em Progresso</CardTitle>
              <Clock className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">{inProgressCount}</div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">Concluídas</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">{completedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="luxury-card bg-ivory border-gold/20 mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light w-5 h-5" />
              <Input
                placeholder="Buscar por cliente, banco ou período..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reconciliations List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredReconciliations.length === 0 ? (
            <Card className="luxury-card bg-ivory border-gold/20">
              <CardContent className="pt-6 text-center text-charcoal-light">
                Nenhuma reconciliação encontrada
              </CardContent>
            </Card>
          ) : (
            filteredReconciliations.map((recon) => (
              <Card key={recon.id} className="luxury-card bg-ivory border-gold/20 hover:border-gold/40 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(recon.status)}
                        <h3 className="text-xl font-bold text-charcoal">{recon.client.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(recon.status)}`}>
                          {getStatusLabel(recon.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-charcoal-light">
                        <p><strong>Banco:</strong> {recon.bank}</p>
                        <p><strong>Conta:</strong> {recon.account}</p>
                        <p><strong>Período:</strong> {recon.period}</p>
                        <p><strong>Responsável:</strong> {recon.responsible}</p>
                        <p><strong>Saldo Inicial:</strong> {formatCurrency(Number(recon.startBalance))}</p>
                        <p><strong>Saldo Final:</strong> {formatCurrency(recon.endBalance ? Number(recon.endBalance) : null)}</p>
                        {recon.difference !== null && recon.difference !== 0 && (
                          <p className="text-red-600"><strong>Divergência:</strong> {formatCurrency(Number(recon.difference))}</p>
                        )}
                        {recon.dueDate && (
                          <p><strong>Prazo:</strong> {new Date(recon.dueDate).toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={`/bpo/reconciliation/${recon.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(recon)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDeleteDialog(recon)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-ivory border-gold/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                {isEditDialogOpen ? 'Editar Reconciliação' : 'Nova Reconciliação Bancária'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Cliente</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({...formData, clientId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Banco</Label>
                <Input value={formData.bank} onChange={(e) => setFormData({...formData, bank: e.target.value})} />
              </div>
              <div>
                <Label>Conta</Label>
                <Input value={formData.account} onChange={(e) => setFormData({...formData, account: e.target.value})} />
              </div>
              <div>
                <Label>Período</Label>
                <Input placeholder="Ex: Janeiro 2026" value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                    <SelectItem value="COMPLETED">Concluída</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Responsável</Label>
                <Input value={formData.responsible} onChange={(e) => setFormData({...formData, responsible: e.target.value})} />
              </div>
              <div>
                <Label>Data Início</Label>
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div>
                <Label>Data Prazo</Label>
                <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
              </div>
              <div>
                <Label>Saldo Inicial</Label>
                <Input type="number" step="0.01" value={formData.startBalance} onChange={(e) => setFormData({...formData, startBalance: e.target.value})} />
              </div>
              <div>
                <Label>Saldo Final</Label>
                <Input type="number" step="0.01" value={formData.endBalance} onChange={(e) => setFormData({...formData, endBalance: e.target.value})} />
              </div>
              <div>
                <Label>Saldo Banco</Label>
                <Input type="number" step="0.01" value={formData.bankBalance} onChange={(e) => setFormData({...formData, bankBalance: e.target.value})} />
              </div>
              <div>
                <Label>Saldo Sistema</Label>
                <Input type="number" step="0.01" value={formData.systemBalance} onChange={(e) => setFormData({...formData, systemBalance: e.target.value})} />
              </div>
              <div className="col-span-2">
                <Label>Observações</Label>
                <Textarea value={formData.observations} onChange={(e) => setFormData({...formData, observations: e.target.value})} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
                className="border-charcoal/20 text-charcoal hover:bg-charcoal/5"
              >
                Cancelar
              </Button>
              <Button 
                onClick={isEditDialogOpen ? handleUpdate : handleCreate} 
                disabled={submitting}
                className="bg-gradient-to-r from-gold to-gold-dark text-white hover:from-gold-dark hover:to-gold transition-all duration-300"
              >
                {submitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta reconciliação? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </BpoLayout>
  );
}
