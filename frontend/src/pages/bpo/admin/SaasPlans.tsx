import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, CheckCircle2 } from "lucide-react";
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
import { api } from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SaasPlan {
  id: string;
  name: string;
  price: number;
  maxClients: number;
  description: string | null;
  features: string[];
  active: boolean;
  mercadopagoPlanId: string | null;
}

const defaultForm = {
  name: "",
  price: "",
  maxClients: "5",
  description: "",
  features: "",
};

export default function SaasPlans() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SaasPlan | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: plans = [], isLoading } = useQuery<SaasPlan[]>({
    queryKey: ["saas-admin-plans"],
    queryFn: async () => {
      const res = await api.get("/saas/admin/plans?includeInactive=true");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      price: number;
      maxClients: number;
      description?: string;
      features: string[];
    }) => {
      const res = await api.post("/saas/admin/plans", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saas-admin-plans"] });
      toast.success("Plano criado com sucesso!");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao criar plano");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SaasPlan>;
    }) => {
      const res = await api.put(`/saas/admin/plans/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saas-admin-plans"] });
      toast.success("Plano atualizado com sucesso!");
      setIsEditOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar plano");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/saas/admin/plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saas-admin-plans"] });
      toast.success("Plano desativado com sucesso!");
      setIsDeleteOpen(false);
      setSelectedPlan(null);
    },
    onError: () => {
      toast.error("Erro ao desativar plano");
    },
  });

  const resetForm = () => setForm(defaultForm);

  const openEdit = (plan: SaasPlan) => {
    setSelectedPlan(plan);
    setForm({
      name: plan.name,
      price: String(plan.price),
      maxClients: String(plan.maxClients),
      description: plan.description || "",
      features: plan.features.join("\n"),
    });
    setIsEditOpen(true);
  };

  const handleCreate = () => {
    createMutation.mutate({
      name: form.name,
      price: Number(form.price.replace(",", ".")),
      maxClients: Number(form.maxClients),
      description: form.description || undefined,
      features: form.features.split("\n").filter(Boolean),
    });
  };

  const handleUpdate = () => {
    if (!selectedPlan) return;
    updateMutation.mutate({
      id: selectedPlan.id,
      data: {
        name: form.name,
        price: Number(form.price.replace(",", ".")),
        maxClients: Number(form.maxClients),
        description: form.description || undefined,
        features: form.features.split("\n").filter(Boolean),
      },
    });
  };

  const handleDelete = () => {
    if (!selectedPlan) return;
    deleteMutation.mutate(selectedPlan.id);
  };

  const formatPrice = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (isLoading) {
    return (
      <BpoLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
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
              Planos de Assinatura
            </h1>
            <p className="text-charcoal-light">
              Gerencie os planos de assinatura SaaS da plataforma
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gold hover:bg-gold-light text-emerald-dark font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="luxury-card bg-ivory border-gold/20 hover:shadow-lg transition-shadow">
              <CardHeader className="bg-emerald text-cream">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {plan.name}
                    </CardTitle>
                    <p className="text-gold text-3xl font-bold mt-2">
                      {formatPrice(plan.price)}
                    </p>
                    <p className="text-cream/80 text-sm mt-1">por mês</p>
                  </div>
                  <Badge className={plan.active ? "bg-gold text-emerald-dark" : "bg-gray-500 text-white"}>
                    {plan.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {plan.description && (
                  <p className="text-charcoal-light mb-4">{plan.description}</p>
                )}
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-semibold text-charcoal">
                    Máx. clientes: <span className="font-normal">{plan.maxClients}</span>
                  </p>
                </div>
                {plan.features.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <p className="text-sm font-semibold text-charcoal">Recursos:</p>
                    <ul className="space-y-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-charcoal-light flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gold/30 hover:bg-gold/10"
                    onClick={() => openEdit(plan)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {plans.length === 0 && (
          <Card className="shadow-elegant">
            <CardContent className="py-12 text-center">
              <p className="text-charcoal-light">
                Nenhum plano de assinatura cadastrado ainda
              </p>
            </CardContent>
          </Card>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[600px] bg-ivory border-gold/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Novo Plano de Assinatura
              </DialogTitle>
              <DialogDescription className="text-charcoal-light">
                Defina os detalhes do novo plano SaaS
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-charcoal font-semibold">Nome do Plano *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Premium" className="bg-cream border-gold/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-charcoal font-semibold">Preço Mensal (R$) *</Label>
                  <Input id="price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="99,90" className="bg-cream border-gold/20" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxClients" className="text-charcoal font-semibold">Máx. Clientes</Label>
                  <Input id="maxClients" type="number" value={form.maxClients} onChange={(e) => setForm({ ...form, maxClients: e.target.value })} className="bg-cream border-gold/20" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-charcoal font-semibold">Descrição</Label>
                <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva o plano..." className="bg-cream border-gold/20 min-h-[80px]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="features" className="text-charcoal font-semibold">Recursos (um por linha)</Label>
                <Textarea id="features" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Conciliação bancária&#10;Relatórios financeiros&#10;Suporte prioritário" className="bg-cream border-gold/20 min-h-[120px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }} disabled={createMutation.isPending}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} className="bg-gold hover:bg-gold-light text-emerald-dark" disabled={createMutation.isPending || !form.name || !form.price}>
                {createMutation.isPending ? "Criando..." : "Criar Plano"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
                <Input id="edit-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-cream border-gold/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price" className="text-charcoal font-semibold">Preço Mensal (R$) *</Label>
                  <Input id="edit-price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-cream border-gold/20" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxClients" className="text-charcoal font-semibold">Máx. Clientes</Label>
                  <Input id="edit-maxClients" type="number" value={form.maxClients} onChange={(e) => setForm({ ...form, maxClients: e.target.value })} className="bg-cream border-gold/20" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="text-charcoal font-semibold">Descrição</Label>
                <Textarea id="edit-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-cream border-gold/20 min-h-[80px]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-features" className="text-charcoal font-semibold">Recursos (um por linha)</Label>
                <Textarea id="edit-features" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="bg-cream border-gold/20 min-h-[120px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }} disabled={updateMutation.isPending}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} className="bg-gold hover:bg-gold-light text-emerald-dark" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="bg-ivory border-gold/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Desativar Plano
              </AlertDialogTitle>
              <AlertDialogDescription className="text-charcoal-light">
                Tem certeza que deseja desativar o plano <strong className="text-charcoal">{selectedPlan?.name}</strong>?
                <br /><br />
                Assinaturas ativas neste plano continuarão válidas, mas o plano não ficará disponível para novas assinaturas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gold/30" disabled={deleteMutation.isPending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white" disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Desativando..." : "Desativar Plano"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </BpoLayout>
  );
}
