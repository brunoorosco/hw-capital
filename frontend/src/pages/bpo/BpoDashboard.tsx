import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, TrendingUp, DollarSign } from "lucide-react";
import BpoLayout from "@/components/BpoLayout";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const revenueData = [
  { month: "Jul", value: 38500 },
  { month: "Ago", value: 42000 },
  { month: "Set", value: 39800 },
  { month: "Out", value: 43200 },
  { month: "Nov", value: 41500 },
  { month: "Dez", value: 45000 },
  { month: "Jan", value: 45800 },
];

const clientsData = [
  { month: "Jul", ativos: 18, novos: 2 },
  { month: "Ago", ativos: 19, novos: 1 },
  { month: "Set", ativos: 20, novos: 1 },
  { month: "Out", ativos: 21, novos: 1 },
  { month: "Nov", ativos: 22, novos: 1 },
  { month: "Dez", ativos: 23, novos: 1 },
  { month: "Jan", ativos: 24, novos: 2 },
];

export default function BpoDashboard() {
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
              <div className="text-3xl font-bold text-charcoal">24</div>
              <p className="text-xs text-charcoal-light mt-1">+2 este mês</p>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">
                Faturamento Mensal
              </CardTitle>
              <DollarSign className="w-4 h-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">R$ 45.8K</div>
              <p className="text-xs text-emerald mt-1">+12.5% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">
                Conciliações Pendentes
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">8</div>
              <p className="text-xs text-charcoal-light mt-1">3 atrasadas</p>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-light">
                Taxa de Conclusão
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-charcoal">94%</div>
              <p className="text-xs text-emerald mt-1">+2% vs mês anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { client: "Empresa ABC Ltda", activity: "Conciliação bancária concluída", time: "2h atrás" },
                  { client: "XYZ Comércio", activity: "DRE mensal enviado", time: "5h atrás" },
                  { client: "Tech Solutions", activity: "Fluxo de caixa atualizado", time: "1d atrás" },
                  { client: "Serviços Pro", activity: "Relatório gerencial gerado", time: "2d atrás" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-gold/10 last:border-0">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-charcoal">{item.client}</p>
                      <p className="text-xs text-charcoal-light">{item.activity}</p>
                    </div>
                    <span className="text-xs text-charcoal-light">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Próximas Entregas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { client: "Comércio XYZ", task: "Fechamento mensal", date: "15/02/2026", priority: "alta" },
                  { client: "Indústria ABC", task: "Conciliação bancária", date: "17/02/2026", priority: "média" },
                  { client: "Serviços DEF", task: "Relatório DRE", date: "20/02/2026", priority: "média" },
                  { client: "Tech GHI", task: "Planejamento financeiro", date: "25/02/2026", priority: "baixa" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-gold/10 last:border-0">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.priority === "alta" ? "bg-red-100 text-red-800" :
                      item.priority === "média" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {item.priority}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-charcoal">{item.client}</p>
                      <p className="text-xs text-charcoal-light">{item.task}</p>
                    </div>
                    <span className="text-xs text-charcoal-light">{item.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Revenue Chart */}
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Evolução de Faturamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C9A961" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#4A5043" />
                  <YAxis stroke="#4A5043" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#F5F1E8', border: '1px solid #C9A961' }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#C9A961" 
                    strokeWidth={3}
                    dot={{ fill: '#2F5233', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Clients Chart */}
          <Card className="luxury-card bg-ivory border-gold/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-charcoal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Crescimento de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C9A961" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#4A5043" />
                  <YAxis stroke="#4A5043" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#F5F1E8', border: '1px solid #C9A961' }}
                  />
                  <Legend />
                  <Bar dataKey="ativos" fill="#2F5233" name="Clientes Ativos" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="novos" fill="#C9A961" name="Novos Clientes" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </BpoLayout>
  );
}
