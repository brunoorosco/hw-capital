import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Eye, Users, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import BpoLayout from "@/components/BpoLayout";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address: string;
  plan: string;
  monthlyValue: number;
  status: string;
  notes: string | null;
  responsible?: {
    id: string;
    name: string;
  };
}

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function BpoClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cnpj: "",
    address: "",
    plan: "",
    monthlyValue: "",
    status: "active",
    notes: "",
    responsibleId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsRes, plansRes, usersRes] = await Promise.all([
        api.get<Client[]>('/clients'),
        api.get<Plan[]>('/plans'),
        api.get<User[]>('/users'),
      ]);

      setClients(clientsRes.data);
      setPlans(plansRes.data);
      setUsers(usersRes.data);
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
      const response = await api.post<Client>('/clients', {
        ...formData,
        monthlyValue: parseFloat(formData.monthlyValue),
      });

      setClients([...clients, response.data]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Cliente criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      toast.error('Erro ao criar cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedClient) return;

    try {
      setSubmitting(true);
      const response = await api.put<Client>(`/clients/${selectedClient.id}`, {
        ...formData,
        monthlyValue: parseFloat(formData.monthlyValue),
      });

      setClients(clients.map(c => c.id === selectedClient.id ? response.data : c));
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      resetForm();
      toast.success('Cliente atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      await api.delete(`/clients/${selectedClient.id}`);
      setClients(clients.filter(c => c.id !== selectedClient.id));
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
      toast.success('Cliente deletado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao deletar cliente:', error);
      toast.error('Erro ao deletar cliente');
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      cnpj: client.cnpj,
      address: client.address,
      plan: client.plan,
      monthlyValue: client.monthlyValue.toString(),
      status: client.status,
      notes: client.notes || "",
      responsibleId: client.responsible?.id || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const openDetailsDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      cnpj: "",
      address: "",
      plan: "",
      monthlyValue: "",
      status: "active",
      notes: "",
      responsibleId: "",
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cnpj.includes(searchTerm)
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Ativo' : 'Inativo';
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

  const activeClients = clients.filter(c => c.status === 'active');
  const totalRevenue = activeClients.reduce((sum, c) => sum + Number(c.monthlyValue), 0);

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
            Clientes BPO
          </h1>
          <Button 
            onClick={openCreateDialog} 
            className="bg-gradient-to-r from-gold to-gold-dark text-white hover:from-gold-dark hover:to-gold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">Total de Clientes</CardTitle>
              <Users className="w-4 h-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">{clients.length}</div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">Clientes Ativos</CardTitle>
              <TrendingUp className="w-4 h-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">{activeClients.length}</div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">Receita Mensal</CardTitle>
              <DollarSign className="w-4 h-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="luxury-card bg-ivory border-gold/20 mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light w-5 h-5" />
              <Input
                placeholder="Buscar por nome, email ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredClients.length === 0 ? (
            <Card className="luxury-card bg-ivory border-gold/20">
              <CardContent className="pt-6 text-center text-charcoal-light">
                Nenhum cliente encontrado
              </CardContent>
            </Card>
          ) : (
            filteredClients.map((client) => (
              <Card key={client.id} className="luxury-card bg-ivory border-gold/20 hover:border-gold/40 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-charcoal">{client.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(client.status)}`}>
                          {getStatusLabel(client.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-charcoal-light">
                        <p><strong>Email:</strong> {client.email}</p>
                        <p><strong>Telefone:</strong> {client.phone}</p>
                        <p><strong>CNPJ:</strong> {client.cnpj}</p>
                        <p><strong>Plano:</strong> {client.plan}</p>
                        <p><strong>Valor Mensal:</strong> {formatCurrency(Number(client.monthlyValue))}</p>
                        {client.responsible && (
                          <p><strong>Responsável:</strong> {client.responsible.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => openDetailsDialog(client)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(client)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDeleteDialog(client)} className="text-red-600 hover:text-red-700">
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
                {isEditDialogOpen ? 'Editar Cliente' : 'Novo Cliente BPO'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input value={formData.cnpj} onChange={(e) => setFormData({...formData, cnpj: e.target.value})} />
              </div>
              <div>
                <Label>Plano</Label>
                <Select value={formData.plan} onValueChange={(value) => {
                  const selectedPlan = plans.find(p => p.name === value);
                  setFormData({
                    ...formData, 
                    plan: value,
                    monthlyValue: selectedPlan ? selectedPlan.price.toString() : formData.monthlyValue
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.name}>
                        {plan.name} - {formatCurrency(Number(plan.price))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Endereço</Label>
                <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div>
                <Label>Valor Mensal</Label>
                <Input type="number" value={formData.monthlyValue} onChange={(e) => setFormData({...formData, monthlyValue: e.target.value})} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Responsável</Label>
                <Select value={formData.responsibleId} onValueChange={(value) => setFormData({...formData, responsibleId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Observações</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} />
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
                Tem certeza que deseja excluir o cliente <strong>{selectedClient?.name}</strong>? Esta ação não pode ser desfeita.
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

        {/* Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="bg-ivory border-gold/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Detalhes do Cliente
              </DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <p className="text-charcoal font-medium">{selectedClient.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-charcoal">{selectedClient.email}</p>
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <p className="text-charcoal">{selectedClient.phone}</p>
                  </div>
                </div>
                <div>
                  <Label>CNPJ</Label>
                  <p className="text-charcoal">{selectedClient.cnpj}</p>
                </div>
                <div>
                  <Label>Endereço</Label>
                  <p className="text-charcoal">{selectedClient.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Plano</Label>
                    <p className="text-charcoal">{selectedClient.plan}</p>
                  </div>
                  <div>
                    <Label>Valor Mensal</Label>
                    <p className="text-charcoal font-bold">{formatCurrency(Number(selectedClient.monthlyValue))}</p>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <span className={`inline-block text-xs px-2 py-1 rounded ${getStatusColor(selectedClient.status)}`}>
                    {getStatusLabel(selectedClient.status)}
                  </span>
                </div>
                {selectedClient.responsible && (
                  <div>
                    <Label>Responsável</Label>
                    <p className="text-charcoal">{selectedClient.responsible.name}</p>
                  </div>
                )}
                {selectedClient.notes && (
                  <div>
                    <Label>Observações</Label>
                    <p className="text-charcoal">{selectedClient.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </BpoLayout>
  );
}
