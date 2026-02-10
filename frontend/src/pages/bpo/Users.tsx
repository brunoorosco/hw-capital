import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Mail, Shield, UserCog } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import BpoLayout from "@/components/BpoLayout";
import { maskPhone, validateEmail } from "@/lib/validators";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "user";
  active: boolean;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: "Admin HW Capital",
    email: "admin@hwcapital.com.br",
    phone: "(11) 98765-4321",
    role: "admin",
    active: true,
    createdAt: "2025-01-15",
  },
  {
    id: 2,
    name: "Maria Silva",
    email: "maria.silva@hwcapital.com.br",
    phone: "(11) 97654-3210",
    role: "user",
    active: true,
    createdAt: "2025-02-01",
  },
  {
    id: 3,
    name: "João Santos",
    email: "joao.santos@hwcapital.com.br",
    phone: "(11) 96543-2109",
    role: "user",
    active: true,
    createdAt: "2025-02-05",
  },
];

export default function Users() {
  const [users] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user" as "admin" | "user",
    password: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "user",
      password: "",
    });
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Email inválido");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Usuário criado com sucesso!");
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao criar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Usuário atualizado com sucesso!");
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao atualizar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Usuário excluído com sucesso!");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error("Erro ao excluir usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Gestão de Usuários
              </h1>
              <p className="text-charcoal-light">Gerencie os usuários da plataforma</p>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gold hover:bg-gold-light text-emerald-dark font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>

          {/* Search */}
          <Card className="luxury-card bg-ivory border-gold/20 mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-cream border-gold/20 focus:border-gold"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="luxury-card bg-ivory border-gold/20 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald text-gold rounded-sm flex items-center justify-center shrink-0">
                        <UserCog className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-charcoal">{user.name}</h3>
                          <Badge className={user.role === "admin" ? "bg-gold text-emerald-dark" : "bg-emerald/10 text-emerald border-emerald/20"}>
                            {user.role === "admin" ? "Admin" : "Usuário"}
                          </Badge>
                          <Badge className={user.active ? "bg-emerald/10 text-emerald border-emerald/20" : "bg-gray-100 text-gray-600 border-gray-200"}>
                            {user.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-charcoal-light">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            <span>{user.phone}</span>
                          </div>
                        </div>
                        <p className="text-xs text-charcoal-light mt-2">
                          Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gold/30 hover:bg-gold/10"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => openDeleteDialog(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card className="luxury-card bg-ivory border-gold/20">
              <CardContent className="pt-12 pb-12 text-center">
                <UserCog className="w-16 h-16 text-charcoal-light mx-auto mb-4 opacity-50" />
                <p className="text-lg text-charcoal-light">Nenhum usuário encontrado</p>
                <p className="text-sm text-charcoal-light mt-2">Tente ajustar sua busca</p>
              </CardContent>
            </Card>
          )}

          {/* Create User Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[600px] bg-ivory border-gold/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Criar Novo Usuário
                </DialogTitle>
                <DialogDescription className="text-charcoal-light">
                  Adicione um novo usuário à plataforma
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-charcoal font-semibold">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Maria Silva"
                    className="bg-cream border-gold/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-charcoal font-semibold">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@hwcapital.com.br"
                    className="bg-cream border-gold/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-charcoal font-semibold">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                    placeholder="(11) 98765-4321"
                    className="bg-cream border-gold/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-charcoal font-semibold">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="bg-cream border-gold/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role" className="text-charcoal font-semibold">Perfil *</Label>
                  <Select value={formData.role} onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="bg-cream border-gold/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
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
                  onClick={handleCreateUser} 
                  className="bg-gold hover:bg-gold-light text-emerald-dark"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando..." : "Criar Usuário"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] bg-ivory border-gold/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Editar Usuário
                </DialogTitle>
                <DialogDescription className="text-charcoal-light">
                  Atualize as informações do usuário
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name" className="text-charcoal font-semibold">Nome Completo *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-cream border-gold/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email" className="text-charcoal font-semibold">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-cream border-gold/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone" className="text-charcoal font-semibold">Telefone *</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                    className="bg-cream border-gold/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-password" className="text-charcoal font-semibold">Nova Senha (deixe em branco para manter)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="bg-cream border-gold/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role" className="text-charcoal font-semibold">Perfil *</Label>
                  <Select value={formData.role} onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="bg-cream border-gold/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
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
                  onClick={handleEditUser} 
                  className="bg-gold hover:bg-gold-light text-emerald-dark"
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
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
                  Tem certeza que deseja excluir o usuário <strong className="text-charcoal">{selectedUser?.name}</strong>?
                  <br /><br />
                  Esta ação não pode ser desfeita.
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
                  onClick={handleDeleteUser}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Excluindo..." : "Excluir Usuário"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </div>
    </BpoLayout>
  );
}
