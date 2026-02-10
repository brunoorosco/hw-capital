import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLoginUrl } from "@/lib/const";
import {
  CheckCircle2,
  Mail,
  Phone,
  TrendingUp,
  FileText,
  Users,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const plans = [
    {
      name: "Essencial",
      price: "R$ 500",
      period: "/mês",
      description:
        "Ideal para pequenas empresas que precisam de controle financeiro básico",
      features: [
        "Conciliação bancária",
        "Contas a pagar e a receber",
        "Fluxo de caixa",
        "Relatório financeiro mensal",
      ],
      highlighted: false,
    },
    {
      name: "Gestão Completa",
      price: "R$ 1.000",
      period: "/mês",
      description:
        "Para empresas que buscam relatórios gerenciais e suporte estratégico",
      features: [
        "Tudo do Plano Essencial",
        "Relatórios gerenciais",
        "DRE simplificada",
        "Suporte estratégico para decisões financeiras",
      ],
      highlighted: true,
    },
    {
      name: "Premium",
      price: "R$ 2.000",
      period: "/mês",
      description: "Solução completa com consultoria e planejamento financeiro",
      features: [
        "Tudo do Plano Gestão Completa",
        "Consultoria financeira",
        "Planejamento financeiro",
        "Reuniões mensais de alinhamento",
      ],
      highlighted: false,
    },
    {
      name: "Personalizado",
      price: "Sob consulta",
      period: "",
      description:
        "Desenvolvido sob medida para necessidades específicas da sua empresa",
      features: [
        "Escopo personalizado",
        "Diagnóstico financeiro completo",
        "Soluções adaptadas ao seu negócio",
        "Suporte dedicado",
      ],
      highlighted: false,
    },
  ];

  const services = [
    {
      icon: TrendingUp,
      title: "Gestão Estratégica",
      description:
        "Transformamos dados financeiros em insights estratégicos para o crescimento do seu negócio.",
    },
    {
      icon: FileText,
      title: "Relatórios Completos",
      description:
        "DRE, fluxo de caixa, conciliação bancária e relatórios gerenciais para decisões assertivas.",
    },
    {
      icon: BarChart3,
      title: "Análise de Performance",
      description:
        "Acompanhamento contínuo dos indicadores financeiros com suporte especializado.",
    },
    {
      icon: Users,
      title: "Consultoria Dedicada",
      description:
        "Time de especialistas focado em otimizar a saúde financeira da sua empresa.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">HW</span>
              </div>
              <span className="text-xl font-semibold text-foreground">
                HW Capital
              </span>
            </div>
            <nav className="flex items-center gap-6">
              {isAuthenticated ? (
                <Link href={user?.role === "admin" ? "/admin" : "/dashboard"}>
                  <Button>Acessar Plataforma</Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button>Entrar</Button>
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              BPO Financeiro <span className="text-primary">HW Capital</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Cuidamos da gestão financeira do seu negócio para que você tenha
              controle, clareza e mais tempo para crescer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#planos">
                <Button size="lg" className="text-lg px-8">
                  Conheça os Planos
                </Button>
              </a>
              <a href="#contato">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Fale Conosco
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Nossos Serviços
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Soluções completas em gestão financeira para empresas de
              investimento, trade e mercado imobiliário.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="shadow-elegant hover:shadow-elegant-lg transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Planos e Preços
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o seu negócio. Todos incluem suporte
              especializado.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`shadow-elegant hover:shadow-elegant-lg transition-all ${
                  plan.highlighted ? "border-primary border-2 scale-105" : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                    Mais Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <CardDescription className="mt-4 text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    Contratar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-elegant-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Entre em Contato</CardTitle>
                <CardDescription className="text-lg">
                  Estamos prontos para atender sua empresa. Fale conosco e
                  descubra como podemos ajudar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">WhatsApp</p>
                    <a
                      href="https://wa.me/5511981142921"
                      className="text-primary hover:underline"
                    >
                      (11) 98114-2921
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">E-mail</p>
                    <a
                      href="mailto:contato@hwcapital.com.br"
                      className="text-primary hover:underline"
                    >
                      contato@hwcapital.com.br
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              © {new Date().getFullYear()} HW Capital. Todos os direitos
              reservados.
            </p>
            <p className="text-xs mt-2">
              Gestão financeira especializada para investimentos, trade e
              mercado imobiliário.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
