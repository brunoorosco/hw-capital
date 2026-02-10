import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, CheckCircle2, AlertCircle, Clock, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BpoLayout from "@/components/BpoLayout";

const mockReconciliations = [
  {
    id: 1,
    client: "Empresa ABC Ltda",
    bank: "Banco do Brasil",
    period: "Janeiro 2026",
    startBalance: "R$ 45.320,00",
    endBalance: "R$ 52.180,00",
    transactions: 127,
    pending: 3,
    status: "pendente",
    dueDate: "2026-02-15",
  },
  {
    id: 2,
    client: "XYZ Comércio",
    bank: "Itaú",
    period: "Janeiro 2026",
    startBalance: "R$ 23.450,00",
    endBalance: "R$ 28.920,00",
    transactions: 89,
    pending: 0,
    status: "concluído",
    dueDate: "2026-02-10",
  },
  {
    id: 3,
    client: "Tech Solutions",
    bank: "Santander",
    period: "Janeiro 2026",
    startBalance: "R$ 98.200,00",
    endBalance: "R$ 105.340,00",
    transactions: 234,
    pending: 8,
    status: "em_andamento",
    dueDate: "2026-02-18",
  },
  {
    id: 4,
    client: "Serviços Pro Ltda",
    bank: "Bradesco",
    period: "Dezembro 2025",
    startBalance: "R$ 67.890,00",
    endBalance: "R$ 71.230,00",
    transactions: 156,
    pending: 12,
    status: "atrasado",
    dueDate: "2026-01-31",
  },
];

export default function Reconciliation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "concluído":
        return { label: "Concluído", color: "bg-emerald/10 text-emerald border-emerald/20", icon: CheckCircle2 };
      case "em_andamento":
        return { label: "Em Andamento", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock };
      case "pendente":
        return { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertCircle };
      case "atrasado":
        return { label: "Atrasado", color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800 border-gray-200", icon: Clock };
    }
  };

  const filteredReconciliations = mockReconciliations.filter(rec => {
    const matchesSearch = rec.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.bank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockReconciliations.length,
    concluido: mockReconciliations.filter(r => r.status === "concluído").length,
    pendente: mockReconciliations.filter(r => r.status === "pendente").length,
    atrasado: mockReconciliations.filter(r => r.status === "atrasado").length,
  };

  return (
    <BpoLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Conciliação Bancária
          </h1>
          <p className="text-charcoal-light">Gerencie e reconcilie as movimentações bancárias dos clientes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-charcoal">{stats.total}</p>
                <p className="text-sm text-charcoal-light mt-1">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="luxury-card bg-emerald/5 border-emerald/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald">{stats.concluido}</p>
                <p className="text-sm text-charcoal-light mt-1">Concluídas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="luxury-card bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-800">{stats.pendente}</p>
                <p className="text-sm text-charcoal-light mt-1">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="luxury-card bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-800">{stats.atrasado}</p>
                <p className="text-sm text-charcoal-light mt-1">Atrasadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="luxury-card bg-ivory border-gold/20 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por cliente ou banco..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-cream border-gold/20 focus:border-gold"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-cream border-gold/20">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="concluído">Concluído</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-gold hover:bg-gold-light text-emerald-dark font-semibold">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reconciliations Table */}
        <Card className="luxury-card bg-ivory border-gold/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
              Conciliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gold/20">
                    <TableHead className="text-charcoal font-semibold">Cliente</TableHead>
                    <TableHead className="text-charcoal font-semibold">Banco</TableHead>
                    <TableHead className="text-charcoal font-semibold">Período</TableHead>
                    <TableHead className="text-charcoal font-semibold">Saldo Inicial</TableHead>
                    <TableHead className="text-charcoal font-semibold">Saldo Final</TableHead>
                    <TableHead className="text-charcoal font-semibold text-center">Transações</TableHead>
                    <TableHead className="text-charcoal font-semibold text-center">Pendentes</TableHead>
                    <TableHead className="text-charcoal font-semibold">Prazo</TableHead>
                    <TableHead className="text-charcoal font-semibold">Status</TableHead>
                    <TableHead className="text-charcoal font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReconciliations.map((rec) => {
                    const statusInfo = getStatusInfo(rec.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <TableRow key={rec.id} className="border-gold/10 hover:bg-cream/50">
                        <TableCell className="font-semibold text-charcoal">{rec.client}</TableCell>
                        <TableCell className="text-charcoal-light">{rec.bank}</TableCell>
                        <TableCell className="text-charcoal-light">{rec.period}</TableCell>
                        <TableCell className="text-charcoal-light">{rec.startBalance}</TableCell>
                        <TableCell className="text-charcoal-light font-semibold">{rec.endBalance}</TableCell>
                        <TableCell className="text-center text-charcoal-light">{rec.transactions}</TableCell>
                        <TableCell className="text-center">
                          {rec.pending > 0 ? (
                            <span className="text-red-600 font-semibold">{rec.pending}</span>
                          ) : (
                            <span className="text-emerald font-semibold">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-charcoal-light text-sm">
                          {new Date(rec.dueDate).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusInfo.color} border`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="border-gold/30 hover:bg-gold/10">
                            Abrir
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredReconciliations.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-charcoal-light mx-auto mb-4 opacity-50" />
                <p className="text-lg text-charcoal-light">Nenhuma conciliação encontrada</p>
                <p className="text-sm text-charcoal-light mt-2">Tente ajustar seus filtros</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BpoLayout>
  );
}
