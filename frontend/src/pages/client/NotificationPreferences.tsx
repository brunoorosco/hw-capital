import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Bell, Mail, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NotificationPreferences() {
  const queryClient = useQueryClient();
  const { data: preferences, isLoading, refetch } = useApiQuery<any>(["notification-preferences"], "/notification-preferences");
  const updateMutation = useApiMutation("/notification-preferences", "PATCH", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });

  const [formData, setFormData] = useState<any>(null);

  // Initialize form data when preferences load
  if (preferences && !formData) {
    setFormData(preferences);
  }

  const handleToggle = (field: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSliderChange = (field: string, value: number[]) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value[0],
    }));
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      refetch();
      toast.success("Preferências atualizadas com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar preferências");
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-3">
          <Bell className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Preferências de Notificação</h1>
          <p className="text-sm text-gray-600">
            Customize como você deseja receber notificações
          </p>
        </div>
      </div>

      {/* Canais de Comunicação */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Mail className="h-5 w-5 text-blue-600" />
          Canais de Comunicação
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Notificações por E-mail</Label>
              <p className="text-sm text-gray-600">
                Receba atualizações importantes por e-mail
              </p>
            </div>
            <Switch
              checked={formData.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Notificações por SMS</Label>
              <p className="text-sm text-gray-600">
                Receba alertas urgentes via mensagem de texto
              </p>
            </div>
            <Switch
              checked={formData.smsNotifications}
              onCheckedChange={() => handleToggle("smsNotifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Notificações no App</Label>
              <p className="text-sm text-gray-600">
                Veja notificações direto na plataforma
              </p>
            </div>
            <Switch
              checked={formData.inAppNotifications}
              onCheckedChange={() => handleToggle("inAppNotifications")}
            />
          </div>
        </div>
      </Card>

      {/* Tipos de Notificações */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          Tipos de Notificações
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Novos Documentos</Label>
              <p className="text-sm text-gray-600">
                Seja notificado quando novos documentos forem disponibilizados
              </p>
            </div>
            <Switch
              checked={formData.newDocumentAlert}
              onCheckedChange={() => handleToggle("newDocumentAlert")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Lembretes de Pagamento</Label>
              <p className="text-sm text-gray-600">
                Receba lembretes antes dos pagamentos vencerem
              </p>
            </div>
            <Switch
              checked={formData.paymentReminder}
              onCheckedChange={() => handleToggle("paymentReminder")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Alertas de Pagamento Atrasado</Label>
              <p className="text-sm text-gray-600">
                Seja notificado sobre pagamentos vencidos
              </p>
            </div>
            <Switch
              checked={formData.paymentOverdueAlert}
              onCheckedChange={() => handleToggle("paymentOverdueAlert")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Resumo Semanal</Label>
              <p className="text-sm text-gray-600">
                Receba um resumo semanal de todas as atividades
              </p>
            </div>
            <Switch
              checked={formData.weeklyDigest}
              onCheckedChange={() => handleToggle("weeklyDigest")}
            />
          </div>
        </div>
      </Card>

      {/* Configurações Avançadas */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          Configurações Avançadas
        </h2>
        <div className="space-y-6">
          <div>
            <div className="mb-4">
              <Label className="text-base font-medium">
                Dias de Antecedência para Lembrete de Pagamento
              </Label>
              <p className="text-sm text-gray-600">
                Receba lembretes quantos dias antes do vencimento?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[formData.reminderDaysBefore]}
                onValueChange={(value) => handleSliderChange("reminderDaysBefore", value)}
                min={1}
                max={14}
                step={1}
                className="flex-1"
              />
              <div className="min-w-12 rounded-lg bg-blue-100 px-3 py-2 text-center font-semibold text-blue-600">
                {formData.reminderDaysBefore}d
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Você receberá lembretes {formData.reminderDaysBefore} dia{formData.reminderDaysBefore !== 1 ? "s" : ""} antes da data de vencimento
            </p>
          </div>
        </div>
      </Card>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">Dica:</p>
            <p>
              Mantenha pelo menos um canal de comunicação ativo para não perder informações importantes sobre seus pagamentos e documentos.
            </p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex-1"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Preferências"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => setFormData(preferences)}
          disabled={updateMutation.isPending}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
