import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Building2, Mail, Phone, MoreVertical, Eye, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import BpoLayout from "@/components/BpoLayout";
import { 
  maskCNPJ, 
  maskPhone, 
  maskCurrency,
  validateClientForm,
  type ValidationErrors 
} from "@/lib/validators";
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

const mockClients = [
  {
    id: 1,
    name: "Empresa ABC Ltda",
    email: "contato@empresaabc.com.br",
    phone: "(11) 98765-4321",
    status: "Ativo",
    plan: "Premium",
    monthlyValue: "R$ 2.500,00"
  },
  {
    id: 2,
    name: "XYZ Comércio",
    email: "financeiro@xyzcomercio.com.br",
    phone: "(11) 97654-3210",
    status: "Ativo",
    plan: "Básico",
    monthlyValue: "R$ 1.200,00"
  },
  {
    id: 3,
    name: "Tech Solutions",
    email: "admin@techsolutions.com",
    phone: "(11) 96543-2109",
    status: "Ativo",
    plan: "Enterprise",
    monthlyValue: "R$ 5.000,00"
  },
  {
    id: 4,
    name: "Serviços Pro Ltda",
    email: "contato@servicospro.com.br",
    phone: "(11) 95432-1098",
    status: "Ativo",
    plan: "Premium",
    monthlyValue: "R$ 2.500,00"
  },
];

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  plan: string;
  monthlyValue: string;
  cnpj: string;
  address: string;
  notes: string;
}

export default function BpoClients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<typeof mockClients[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    email: "",
    phone: "",
    plan: "Básico",
    monthlyValue: "",
    cnpj: "",
    address: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      plan: "Básico",
      monthlyValue: "",
      cnpj: "",
      address: "",
      notes: "",
    });
    setErrors({});
  };

  const handleCreateClient = async () => {
    // Validar formulário
    const validationErrors = validateClientForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setIsLoading(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aqui você faria a chamada à API para criar o cliente
      toast.success("Cliente criado com sucesso!");
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao criar cliente. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClient = async () => {
    // Validar formulário
    const validationErrors = validateClientForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setIsLoading(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aqui você faria a chamada à API para editar o cliente
      toast.success("Cliente atualizado com sucesso!");
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao atualizar cliente. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateClient = async () => {
    if (!selectedClient) return;
    
    setIsLoading(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aqui você faria a chamada à API para desativar o cliente
      toast.success(`Cliente ${selectedClient.name} desativado com sucesso!`);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
    } catch (error) {
      toast.error("Erro ao desativar cliente. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (client: typeof mockClients[0]) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (client: typeof mockClients[0]) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      plan: client.plan,
      monthlyValue: client.monthlyValue,
      cnpj: "",
      address: "",
      notes: "",
    });
    setIsEditDialogOpen(true);
  };

  const openDetailsDialog = (client: typeof mockClients[0]) => {
    setSelectedClient(client);
    setIsDetailsDialogOpen(true);
  };

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Clientes BPO
            </h1>
            <p className="text-charcoal-light">Gerencie seus clientes de BPO Financeiro</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gold hover:bg-gold-light text-emerald-dark font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="luxury-card bg-ivory border-gold/20 mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar clientes por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-cream border-gold/20 focus:border-gold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald/10 rounded-sm flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal">{mockClients.length}</p>
                  <p className="text-sm text-charcoal-light">Total de Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gold/10 rounded-sm flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal">{mockClients.filter(c => c.status === "Ativo").length}</p>
                  <p className="text-sm text-charcoal-light">Clientes Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-light/20 rounded-sm flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald-dark" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal">R$ 11,2K</p>
                  <p className="text-sm text-charcoal-light">Receita Mensal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="luxury-card bg-ivory border-gold/20 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald text-gold rounded-sm flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-charcoal mb-2">{client.name}</h3>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-charcoal-light">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-charcoal-light">Plano</p>
                      <p className="text-sm font-semibold text-charcoal">{client.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-charcoal-light">Mensalidade</p>
                      <p className="text-sm font-bold text-emerald">{client.monthlyValue}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald/10 text-emerald text-xs font-semibold rounded-full">
                      {client.status}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetailsDialog(client)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(client)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <History className="w-4 h-4 mr-2" />
                          Histórico
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => openDeleteDialog(client)}
                        >
                          Desativar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardContent className="pt-12 pb-12 text-center">
              <Building2 className="w-16 h-16 text-charcoal-light mx-auto mb-4 opacity-50" />
              <p className="text-lg text-charcoal-light">Nenhum cliente encontrado</p>
              <p className="text-sm text-charcoal-light mt-2">Tente ajustar sua busca</p>
            </CardContent>
          </Card>
        )}

      {/* Create Client Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-ivory border-gold/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
              Novo Cliente BPO
            </DialogTitle>
            <DialogDescription className="text-charcoal-light">
              Preencha os dados do novo cliente para BPO Financeiro
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-charcoal font-semibold">Nome da Empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                placeholder="Ex: Empresa ABC Ltda"
                className={`bg-cream border-gold/20 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cnpj" className="text-charcoal font-semibold">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => {
                    const masked = maskCNPJ(e.target.value);
                    setFormData({ ...formData, cnpj: masked });
                    if (errors.cnpj) setErrors({ ...errors, cnpj: "" });
                  }}
                  placeholder="00.000.000/0000-00"
                  className={`bg-cream border-gold/20 ${errors.cnpj ? 'border-red-500' : ''}`}
                />
                {errors.cnpj && <p className="text-xs text-red-600">{errors.cnpj}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-charcoal font-semibold">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const masked = maskPhone(e.target.value);
                    setFormData({ ...formData, phone: masked });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  placeholder="(11) 98765-4321"
                  className={`bg-cream border-gold/20 ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-charcoal font-semibold">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="contato@empresa.com.br"
                className={`bg-cream border-gold/20 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-charcoal font-semibold">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, bairro, cidade - UF"
                className="bg-cream border-gold/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="plan" className="text-charcoal font-semibold">Plano *</Label>
                <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                  <SelectTrigger className="bg-cream border-gold/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Básico">Básico</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="monthlyValue" className="text-charcoal font-semibold">Valor Mensal *</Label>
                <Input
                  id="monthlyValue"
                  value={formData.monthlyValue}
                  onChange={(e) => {
                    const masked = maskCurrency(e.target.value);
                    setFormData({ ...formData, monthlyValue: masked });
                    if (errors.monthlyValue) setErrors({ ...errors, monthlyValue: "" });
                  }}
                  placeholder="R$ 2.500,00"
                  className={`bg-cream border-gold/20 ${errors.monthlyValue ? 'border-red-500' : ''}`}
                />
                {errors.monthlyValue && <p className="text-xs text-red-600">{errors.monthlyValue}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-charcoal font-semibold">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações adicionais sobre o cliente..."
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
              onClick={handleCreateClient} 
              className="bg-gold hover:bg-gold-light text-emerald-dark"
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-ivory border-gold/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
              Editar Cliente
            </DialogTitle>
            <DialogDescription className="text-charcoal-light">
              Atualize as informações do cliente
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-charcoal font-semibold">Nome da Empresa *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className={`bg-cream border-gold/20 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-cnpj" className="text-charcoal font-semibold">CNPJ *</Label>
                <Input
                  id="edit-cnpj"
                  value={formData.cnpj}
                  onChange={(e) => {
                    const masked = maskCNPJ(e.target.value);
                    setFormData({ ...formData, cnpj: masked });
                    if (errors.cnpj) setErrors({ ...errors, cnpj: "" });
                  }}
                  className={`bg-cream border-gold/20 ${errors.cnpj ? 'border-red-500' : ''}`}
                />
                {errors.cnpj && <p className="text-xs text-red-600">{errors.cnpj}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone" className="text-charcoal font-semibold">Telefone *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const masked = maskPhone(e.target.value);
                    setFormData({ ...formData, phone: masked });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  className={`bg-cream border-gold/20 ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email" className="text-charcoal font-semibold">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className={`bg-cream border-gold/20 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-plan" className="text-charcoal font-semibold">Plano *</Label>
                <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                  <SelectTrigger className="bg-cream border-gold/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Básico">Básico</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-monthlyValue" className="text-charcoal font-semibold">Valor Mensal *</Label>
                <Input
                  id="edit-monthlyValue"
                  value={formData.monthlyValue}
                  onChange={(e) => {
                    const masked = maskCurrency(e.target.value);
                    setFormData({ ...formData, monthlyValue: masked });
                    if (errors.monthlyValue) setErrors({ ...errors, monthlyValue: "" });
                  }}
                  className={`bg-cream border-gold/20 ${errors.monthlyValue ? 'border-red-500' : ''}`}
                />
                {errors.monthlyValue && <p className="text-xs text-red-600">{errors.monthlyValue}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => { setIsEditDialogOpen(false); resetForm(); }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditClient} 
              className="bg-gold hover:bg-gold-light text-emerald-dark"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-ivory border-gold/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
              Detalhes do Cliente
            </DialogTitle>
            <DialogDescription className="text-charcoal-light">
              Informações completas e histórico do cliente
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6 py-4">
              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-charcoal-light text-xs">Nome da Empresa</Label>
                  <p className="text-charcoal font-semibold">{selectedClient.name}</p>
                </div>
                <div>
                  <Label className="text-charcoal-light text-xs">Status</Label>
                  <div>
                    <Badge className="bg-emerald/10 text-emerald border-emerald/20">
                      {selectedClient.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-charcoal-light text-xs">Email</Label>
                  <p className="text-charcoal font-semibold">{selectedClient.email}</p>
                </div>
                <div>
                  <Label className="text-charcoal-light text-xs">Telefone</Label>
                  <p className="text-charcoal font-semibold">{selectedClient.phone}</p>
                </div>
                <div>
                  <Label className="text-charcoal-light text-xs">Plano</Label>
                  <p className="text-charcoal font-semibold">{selectedClient.plan}</p>
                </div>
                <div>
                  <Label className="text-charcoal-light text-xs">Valor Mensal</Label>
                  <p className="text-emerald font-bold text-lg">{selectedClient.monthlyValue}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="font-bold text-charcoal mb-3 pb-2 border-b border-gold/20">
                  Atividades Recentes
                </h4>
                <div className="space-y-3">
                  {[
                    { date: "2026-02-08", activity: "DRE Janeiro/2026 enviado", type: "relatorio" },
                    { date: "2026-02-05", activity: "Conciliação bancária concluída", type: "conciliacao" },
                    { date: "2026-01-28", activity: "Pagamento recebido", type: "pagamento" },
                    { date: "2026-01-15", activity: "Reunião de planejamento", type: "reuniao" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b border-gold/10 last:border-0">
                      <div className="w-2 h-2 bg-gold rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-charcoal">{item.activity}</p>
                        <p className="text-xs text-charcoal-light mt-1">
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="luxury-card bg-emerald/5 border-emerald/20">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-charcoal-light text-center mb-1">Tempo de Cliente</p>
                    <p className="text-xl font-bold text-emerald text-center">8 meses</p>
                  </CardContent>
                </Card>
                <Card className="luxury-card bg-gold/5 border-gold/20">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-charcoal-light text-center mb-1">Relatórios Gerados</p>
                    <p className="text-xl font-bold text-gold text-center">24</p>
                  </CardContent>
                </Card>
                <Card className="luxury-card bg-blue-50 border-blue-200">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-charcoal-light text-center mb-1">Conciliações</p>
                    <p className="text-xl font-bold text-blue-600 text-center">16</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Fechar
            </Button>
            <Button 
              onClick={() => {
                setIsDetailsDialogOpen(false);
                if (selectedClient) openEditDialog(selectedClient);
              }}
              className="bg-gold hover:bg-gold-light text-emerald-dark"
            >
              Editar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-ivory border-gold/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
              Confirmar Desativação
            </AlertDialogTitle>
            <AlertDialogDescription className="text-charcoal-light">
              Tem certeza que deseja desativar o cliente <strong className="text-charcoal">{selectedClient?.name}</strong>?
              <br /><br />
              Esta ação pode ser revertida posteriormente, mas o cliente ficará inativo no sistema.
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
              onClick={handleDeactivateClient}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Desativando..." : "Desativar Cliente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </BpoLayout>
  );
}
