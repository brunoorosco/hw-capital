import { useState, useMemo } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Trash2, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

type NotificationType = "new_document" | "payment_pending" | "payment_overdue" | "payment_received" | "subscription_updated" | "system_alert";

const notificationTypeLabels: Record<NotificationType, string> = {
  new_document: "Novo Documento",
  payment_pending: "Pagamento Pendente",
  payment_overdue: "Pagamento Atrasado",
  payment_received: "Pagamento Recebido",
  subscription_updated: "Assinatura Atualizada",
  system_alert: "Alerta do Sistema",
};

const notificationTypeColors: Record<NotificationType, string> = {
  new_document: "bg-blue-100 text-blue-800",
  payment_pending: "bg-yellow-100 text-yellow-800",
  payment_overdue: "bg-red-100 text-red-800",
  payment_received: "bg-green-100 text-green-800",
  subscription_updated: "bg-purple-100 text-purple-800",
  system_alert: "bg-orange-100 text-orange-800",
};

export default function Notifications() {
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, refetch } = useApiQuery<any[]>(
    ["notifications", "my", { type: selectedType, limit: 100 }],
    "/notifications/my",
    {
      type: selectedType,
      limit: 100,
    }
  );

  const { data: unreadCount = { count: 0 } } = useApiQuery<{ count: number }>(["notifications", "unread-count"], "/notifications/unread-count");
  const markAsReadMutation = useApiMutation<any, { id: number }>(
    (vars) => `/notifications/${vars.id}/read`,
    "PATCH",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
    }
  );
  const markAllAsReadMutation = useApiMutation("/notifications/mark-all-read", "POST", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const deleteNotificationMutation = useApiMutation<any, { id: number }>(
    (vars) => `/notifications/${vars.id}`,
    "DELETE",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
    }
  );

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync({ id });
      refetch();
      toast.success("Notificação marcada como lida");
    } catch (error) {
      toast.error("Erro ao marcar notificação como lida");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync({});
      refetch();
      toast.success("Todas as notificações marcadas como lidas");
    } catch (error) {
      toast.error("Erro ao marcar notificações como lidas");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotificationMutation.mutateAsync({ id });
      refetch();
      toast.success("Notificação deletada");
    } catch (error) {
      toast.error("Erro ao deletar notificação");
    }
  };

  const unreadNotifications = useMemo(
    () => notifications?.filter((n: any) => !n.isRead) || [],
    [notifications]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-3">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notificações</h1>
            <p className="text-sm text-gray-600">
              {unreadCount?.count || 0} notificação{(unreadCount?.count || 0) !== 1 ? "s" : ""} não lida{(unreadCount?.count || 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {unreadCount && unreadCount.count > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Marcando...
              </>
            ) : (
              "Marcar todas como lidas"
            )}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">
            Todas ({notifications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Não lidas ({unreadNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(undefined)}
            >
              Todas
            </Button>
            {Object.entries(notificationTypeLabels).map(([type, label]) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification: any) => (
                <Card
                  key={notification.id}
                  className={`p-4 transition-colors ${
                    notification.isRead ? "bg-gray-50" : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="mt-1">
                      {notification.isRead ? (
                        <CheckCircle2 className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            <Badge
                              className={notificationTypeColors[notification.type as NotificationType]}
                              variant="secondary"
                            >
                              {notificationTypeLabels[notification.type as NotificationType]}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-gray-700">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-gray-500">
                            {format(new Date(notification.sentAt), "dd 'de' MMMM 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          title="Marcar como lida"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                        title="Deletar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhuma notificação encontrada</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : unreadNotifications.length > 0 ? (
            <div className="space-y-3">
              {unreadNotifications.map((notification: any) => (
                <Card
                  key={notification.id}
                  className="border-blue-200 bg-blue-50 p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Circle className="h-5 w-5 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            <Badge
                              className={notificationTypeColors[notification.type as NotificationType]}
                              variant="secondary"
                            >
                              {notificationTypeLabels[notification.type as NotificationType]}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-gray-700">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-gray-500">
                            {format(new Date(notification.sentAt), "dd 'de' MMMM 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markAsReadMutation.isPending}
                        title="Marcar como lida"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                        title="Deletar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-300 mb-4" />
              <p className="text-gray-500">Todas as notificações foram lidas!</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
