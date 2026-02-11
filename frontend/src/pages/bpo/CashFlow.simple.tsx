import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Plus, Edit, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import BpoLayout from "@/components/BpoLayout";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

interface Client {
  id: string;
  name: string;
}

interface CashFlowMovement {
  id: string;
  clientId: string;
  client?: Client;
  type: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  status: string;
}

export default function CashFlow() {
  const [clients, setClients] = useState<Client[]>([]);
  const [movements, setMovements] = useState<CashFlowMovement[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<CashFlowMovement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    clientId: "",
    type: "ENTRADA",
    description: "",
    amount: "",
    date: "",
    category: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsRes, cashflowRes] = await Promise.all([
        api.get<Client[]>('/clients'),
        api.get<CashFlowMovement[]>('/cashflow'),
      ]);

      const activeClients = clientsRes.data.filter((c: any) => c.status === 'active');
      setClients(activeClients);
      setMovements(cashflowRes.data);
      
      if (activeClients.length > 0 && !selectedClient) {
        setSelectedClient(activeClients[0].id);
      }
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
      const response = await api.post<CashFlowMovement>('/cashflow', {
        ...formData,
        amount: parseFloat(formData.amount),
      });

      setMovements([...movements, response.data]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Movimentação criada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar movimentação:', error);
      toast.error('Erro ao criar movimentação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMovement) return;

    try {
      setSubmitting(true);
      const response = await api.put<CashFlowMovement>(`/cashflow/${selectedMovement.id}`, {
        ...formData,
        amount: parseFloat(formData.amount),
      });

      setMovements(movements.map(m => m.id === selectedMovement.id ? response.data : m));
      setIsEditDialogOpen(false);
      setSelectedMovement(null);
      resetForm();
      toast.success('Movimentação atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar movimentação:', error);
      toast.error('Erro ao atualizar movimentação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMovement) return;

    try {
      await api.delete(`/cashflow/${selectedMovement.id}`);
      setMovements(movements.filter(m => m.id !== selectedMovement.id));
      setIsDeleteDialogOpen(false);
      setSelectedMovement(null);
      toast.success('Movimentação deletada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao deletar movimentação:', error);
      toast.error('Erro ao deletar movimentação');
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setFormData(prev => ({ ...prev, clientId: selectedClient }));
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (movement: CashFlowMovement) => {
    setSelectedMovement(movement);
    setFormData({
      clientId: movement.clientId,
      type: movement.type,
      description: movement.description,
      amount: movement.amount.toString(),
      date: movement.date.split('T')[0],
      category: movement.category,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (movement: CashFlowMovement) => {
    setSelectedMovement(movement);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      clientId: selectedClient,
      type: "ENTRADA",
      description: "",
      amount: "",
      date: "",
      category: "",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredMovements = selectedClient
    ? movements.filter(m => m.clientId === selectedClient)
    : movements;

  const totalEntradas = filteredMovements
    .filter(m => m.type === 'ENTRADA')
    .reduce((sum, m) => sum + Number(m.amount), 0);

  const totalSaidas = filteredMovements
    .filter(m => m.type === 'SAIDA')
    .reduce((sum, m) => sum + Number(m.amount), 0);

  const saldo = totalEntradas - totalSaidas;

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

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
            Fluxo de Caixa
          </h1>
          <Button 
            onClick={openCreateDialog} 
            className="bg-gradient-to-r from-gold to-gold-dark text-white hover:from-gold-dark hover:to-gold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>

        {/* Client Filter */}
        <Card className="luxury-card bg-ivory border-gold/20 mb-6">
          <CardContent className="pt-6">
            <Label>Selecione o Cliente</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">Total Entradas</CardTitle>
              <ArrowUpCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(totalEntradas)}</div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">Total Saídas</CardTitle>
              <ArrowDownCircle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{formatCurrency(totalSaidas)}</div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">Saldo</CardTitle>
              <DollarSign className="w-4 h-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(saldo)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movements List */}
        <Card className="luxury-card bg-ivory border-gold/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
              Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMovements.length === 0 ? (
              <p className="text-center text-charcoal-light py-8">Nenhuma movimentação encontrada</p>
            ) : (
              <div className="space-y-4">
                {filteredMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-4 bg-cream rounded-sm border border-gold/10 hover:border-gold/30 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      {movement.type === 'ENTRADA' ? (
                        <ArrowUpCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-6 h-6 text-red-600" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-charcoal">{movement.description}</p>
                        <div className="flex gap-4 text-sm text-charcoal-light mt-1">
                          <span>{movement.category}</span>
                          <span>•</span>
                          <span>{new Date(movement.date).toLocaleDateString('pt-BR')}</span>
                          {movement.client && (
                            <>
                              <span>•</span>
                              <span>{movement.client.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${movement.type === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.type === 'ENTRADA' ? '+' : '-'} {formatCurrency(Number(movement.amount))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(movement)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDeleteDialog(movement)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl bg-ivory border-gold/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                {isEditDialogOpen ? 'Editar Movimentação' : 'Nova Movimentação'}
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
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRADA">Entrada</SelectItem>
                    <SelectItem value="SAIDA">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="col-span-2">
                <Label>Descrição</Label>
                <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <Label>Categoria</Label>
                <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="Ex: Vendas, Folha, Fornecedores" />
              </div>
              <div>
                <Label>Valor</Label>
                <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
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
                Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita.
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
