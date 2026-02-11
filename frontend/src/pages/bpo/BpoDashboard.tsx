import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, CheckCircle, Clock } from "lucide-react";
import BpoLayout from "@/components/BpoLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client"; // Usa api-client.ts que tem o token
import { Skeleton } from "@/components/ui/skeleton";

interface Client {
  id: string;
  name: string;
  plan: string;
  status: string;
  monthlyValue: number;
}

interface Reconciliation {
  id: string;
  client: {
    id: string;
    name: string;
  };
  period: string;
  status: string;
  dueDate: string | null;
}

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  pendingReconciliations: number;
  completedReconciliations: number;
}

export default function BpoDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
    pendingReconciliations: 0,
    completedReconciliations: 0,
  });
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [pendingReconciliations, setPendingReconciliations] = useState<Reconciliation[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar clientes
      const clientsResponse = await api.get<Client[]>('/clients');
      const clients = clientsResponse.data; // axios retorna data

      // Buscar reconciliações
      const reconciliationsResponse = await api.get<Reconciliation[]>('/reconciliations');
      const reconciliations = reconciliationsResponse.data; // axios retorna data

      // Calcular estatísticas
      const activeClients = clients.filter(c => c.status === 'active');
      const totalRevenue = activeClients.reduce((sum, c) => sum + Number(c.monthlyValue), 0);
      const pending = reconciliations.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS');
      const completed = reconciliations.filter(r => r.status === 'COMPLETED');

      setStats({
        totalClients: clients.length,
        activeClients: activeClients.length,
        totalRevenue,
        pendingReconciliations: pending.length,
        completedReconciliations: completed.length,
      });

      // Últimos 5 clientes
      setRecentClients(clients.slice(0, 5));

      // Reconciliações pendentes (apenas pendentes e em progresso)
      setPendingReconciliations(pending.slice(0, 5));

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'text-green-600 bg-green-100',
      'inactive': 'text-red-600 bg-red-100',
      'pending': 'text-yellow-600 bg-yellow-100',
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'IN_PROGRESS': 'text-blue-600 bg-blue-100',
      'COMPLETED': 'text-green-600 bg-green-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'pending': 'Pendente',
      'PENDING': 'Pendente',
      'IN_PROGRESS': 'Em Progresso',
      'COMPLETED': 'Concluída',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <BpoLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="luxury-card bg-ivory border-gold/20">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Dashboard BPO Financeiro
          </h1>
          <p className="text-charcoal-light">Visão geral da gestão financeira</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">
                Total de Clientes
              </CardTitle>
              <Users className="w-4 h-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">{stats.totalClients}</div>
              <p className="text-xs text-charcoal-light mt-1">{stats.activeClients} ativos</p>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">
                Receita Mensal
              </CardTitle>
              <DollarSign className="w-4 h-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                MRR dos clientes ativos
              </p>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">
                Reconciliações Pendentes
              </CardTitle>
              <Clock className="w-4 h-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">{stats.pendingReconciliations}</div>
              <p className="text-xs text-charcoal-light mt-1">Requerem atenção</p>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">
                Reconciliações Concluídas
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">{stats.completedReconciliations}</div>
              <p className="text-xs text-green-600 mt-1">Este mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Clients and Pending Reconciliations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Clients */}
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Clientes Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentClients.length === 0 ? (
                  <p className="text-charcoal-light text-center py-4">Nenhum cliente cadastrado</p>
                ) : (
                  recentClients.map(client => (
                    <div key={client.id} className="flex items-center justify-between p-4 bg-cream rounded-sm">
                      <div>
                        <p className="font-semibold text-charcoal">{client.name}</p>
                        <p className="text-sm text-charcoal-light">{client.plan}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-charcoal">{formatCurrency(Number(client.monthlyValue))}</p>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(client.status)}`}>
                          {getStatusLabel(client.status)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Reconciliations */}
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Reconciliações Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReconciliations.length === 0 ? (
                  <p className="text-charcoal-light text-center py-4">Nenhuma reconciliação pendente</p>
                ) : (
                  pendingReconciliations.map(recon => (
                    <div key={recon.id} className="flex items-center justify-between p-4 bg-cream rounded-sm">
                      <div>
                        <p className="font-semibold text-charcoal">{recon.client.name}</p>
                        <p className="text-sm text-charcoal-light">{recon.period}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(recon.status)}`}>
                          {getStatusLabel(recon.status)}
                        </span>
                        {recon.dueDate && (
                          <p className="text-xs text-charcoal-light mt-1">
                            Vence: {new Date(recon.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BpoLayout>
  );
}
