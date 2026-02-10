import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import BpoLayout from "@/components/BpoLayout";
import { maskCurrency } from "@/lib/validators";

interface Plan {
  id: number;
  name: string;
  price: string;
  description: string;
  features: string[];
  active: boolean;
}

const mockPlans: Plan[] = [
  {
    id: 1,
    name: "Básico",
    price: "R$ 1.200,00",
    description: "Ideal para pequenas empresas que estão começando",
    features: ["Conciliação bancária", "Relatório DRE mensal", "Suporte por email"],
    active: true,
  },
  {
    id: 2,
    name: "Premium",
    price: "R$ 2.500,00",
    description: "Para empresas em crescimento que precisam de mais suporte",
    features: ["Conciliação bancária", "Relatórios completos", "Fluxo de caixa", "Suporte prioritário", "Consultoria mensal"],
    active: true,
  },
  {
    id: 3,
    name: "Enterprise",
    price: "R$ 5.000,00",
    description: "Solução completa para grandes empresas",
    features: ["Todos os recursos Premium", "Múltiplas empresas", "Consultoria semanal", "Suporte 24/7", "Relatórios customizados"],
    active: true,
  },
];

export default function Plans() {
  const [plans] = useState<Plan[]>(mockPlans);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    features: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      features: "",
    });
  };

  const handleCreatePlan = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Plano criado com sucesso!");
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao criar plano");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPlan = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Plano atualizado com sucesso!");
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao atualizar plano");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Plano excluído com sucesso!");
      setIsDeleteDialogOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      toast.error("Erro ao excluir plano");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      description: plan.description,
      features: plan.features.join("\n"),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Gestão de Planos
              </h1>
              <p className="text-charcoal-light">Configure e gerencie os planos de BPO Financeiro</p>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gold hover:bg-gold-light text-emerald-dark font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="luxury-card bg-ivory border-gold/20 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-emerald text-cream">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {plan.name}
                      </CardTitle>
                      <p className="text-gold text-3xl font-bold mt-2">{plan.price}</p>
                      <p className="text-cream/80 text-sm mt-1">por mês</p>
                    </div>
                    <Badge className={plan.active ? "bg-gold text-emerald-dark" : "bg-gray-500 text-white"}>
                      {plan.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-charcoal-light mb-4">{plan.description}</p>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm font-semibold text-charcoal">Recursos inclusos:</p>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-sm text-charcoal-light flex items-start gap-2">
                          <span className="text-gold mt-1">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-gold/30 hover:bg-gold/10"
                      onClick={() => openEditDialog(plan)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => openDeleteDialog(plan)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Plan Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[600px] bg-ivory border-gold/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Criar Novo Plano
                </DialogTitle>
                <DialogDescription className="text-charcoal-light">
                  Defina os detalhes do novo plano de BPO Financeiro
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-charcoal font-semibold">Nome do Plano *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Premium"
                    className="bg-cream border-gold/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-charcoal font-semibold">Preço Mensal *</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: maskCurrency(e.target.value) })}
                    placeholder="R$ 2.500,00"
                    className="bg-cream border-gold/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-charcoal font-semibold">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o plano..."
                    className="bg-cream border-gold/20 min-h-[80px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="features" className="text-charcoal font-semibold">Recursos (um por linha) *</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Conciliação bancária&#10;Relatório DRE mensal&#10;Suporte por email"
                    className="bg-cream border-gold/20 min-h-[120px]"
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
                  onClick={handleCreatePlan} 
                  className="bg-gold hover:bg-gold-light text-emerald-dark"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando..." : "Criar Plano"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Plan Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] bg-ivory border-gold/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Editar Plano
                </DialogTitle>
                <DialogDescription className="text-charcoal-light">
                  Atualize as informações do plano
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name" className="text-charcoal font-semibold">Nome do Plano *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-cream border-gold/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price" className="text-charcoal font-semibold">Preço Mensal *</Label>
                  <Input
                    id="edit-price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: maskCurrency(e.target.value) })}
                    className="bg-cream border-gold/20"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description" className="text-charcoal font-semibold">Descrição *</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-cream border-gold/20 min-h-[80px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-features" className="text-charcoal font-semibold">Recursos (um por linha) *</Label>
                  <Textarea
                    id="edit-features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="bg-cream border-gold/20 min-h-[120px]"
                  />
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
                  onClick={handleEditPlan} 
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
                  Tem certeza que deseja excluir o plano <strong className="text-charcoal">{selectedPlan?.name}</strong>?
                  <br /><br />
                  Esta ação não pode ser desfeita e pode afetar clientes que estão usando este plano.
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
                  onClick={handleDeletePlan}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Excluindo..." : "Excluir Plano"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </div>
    </BpoLayout>
  );
}
