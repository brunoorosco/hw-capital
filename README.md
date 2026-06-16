# HW Capital — Plataforma de BPO Financeiro

Sistema SaaS de gestão financeira para terceirização de processos de negócio (BPO Financeiro), desenvolvido pela **Orostec Capital**. Oferece reconciliação bancária, fluxo de caixa, gestão de clientes e planos de assinatura com dois portais de acesso: **investimentos** (cliente) e **bpo** (operações).

---

## Sumário

- [Arquitetura](#arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Modelos de Dados](#modelos-de-dados)
- [API REST](#api-rest)
- [Frontend — Rotas](#frontend--rotas)
- [Autenticação](#autenticação)
- [Sistema de Auditoria](#sistema-de-auditoria)
- [Armazenamento de Arquivos](#armazenamento-de-arquivos)
- [Configuração e Setup](#configuração-e-setup)
- [Scripts](#scripts)
- [Docker](#docker)

---

## Arquitetura

### Backend — Clean Architecture

O backend segue os princípios de **Clean Architecture** com três camadas principais:

```
domain/         → Entidades, interfaces de repositório e casos de uso
infrastructure/ → Implementações concretas (Prisma, Express, Cloudflare R2)
```

Injeção de dependência via **TSyringe** mantém o baixo acoplamento entre camadas.

### Frontend — SPA com React

Single Page Application construída com **React 19 + Vite 7**, utilizando:

- **Wouter** para roteamento leve
- **TanStack React Query 5** para gerenciamento de estado servidor
- **shadcn/ui + Tailwind CSS** com tema Art Déco de luxo (ouro, esmeralda, carvão, marfim)
- **Framer Motion** para animações
- **Recharts** para gráficos

### Separação de Projetos

`backend/` e `frontend/` são projetos Node.js independentes, cada um com seu próprio `package.json`, sem ferramentas de monorepo.

---

## Stack Tecnológica

### Backend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Node.js | 22+ | Runtime |
| TypeScript | 5.7 | Linguagem |
| Express.js | 4.21 | Framework HTTP |
| Prisma | 5.22 | ORM (PostgreSQL) |
| PostgreSQL | — | Banco de dados |
| TSyringe | 4.8 | Injeção de dependência |
| Zod | 3.24 | Validação de schemas |
| Pino | 10 | Logging estruturado |
| AWS SDK S3 | — | Cloudflare R2 (S3-compatible) |
| JWT (jsonwebtoken) | — | Autenticação |
| Bcryptjs | — | Hash de senhas |
| tsup | 8.3 | Bundler de build |
| tsx | 4.19 | Dev server |

### Frontend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 19 | UI |
| TypeScript | 5.9 | Linguagem |
| Vite | 7 | Build / dev server |
| Wouter | 3.3 | Roteamento |
| TanStack React Query | 5 | Estado servidor |
| Tailwind CSS | 3.4 | CSS utilitário |
| shadcn/ui | — | 53 componentes de UI |
| Radix UI | — | Primitivas headless |
| Framer Motion | 12 | Animações |
| Recharts | 2.15 | Gráficos |
| React Hook Form | 7 | Formulários |
| Zod | 4 | Validação |
| Axios | — | HTTP client |
| @react-oauth/google | — | Login Google |
| next-themes | — | Tema dark/light |
| lucide-react | — | Ícones |
| date-fns | 4 | Datas |

---

## Estrutura do Projeto

```
hw-capital/
├── backend/                     # API REST (Express + TypeScript)
│   ├── src/
│   │   ├── server.ts           # Entry point (porta 3333)
│   │   ├── domain/
│   │   │   ├── entities/       # User, AuditLog + enums
│   │   │   ├── repositories/   # Interfaces IUserRepository, IAuditLogRepository
│   │   │   └── use-cases/      # Casos de uso (ex: Google Login)
│   │   └── infrastructure/
│   │       ├── container/      # DI container TSyringe
│   │       ├── database/       # PrismaClient + repositórios Prisma
│   │       ├── http/
│   │       │   ├── controllers/    # Auth, Client, Reconciliation, CashFlow, Plan, User
│   │       │   ├── middlewares/     # auth, audit, errorHandler, logger
│   │       │   └── routes/         # Agregador de rotas + health check
│   │       ├── logger/         # Pino logger
│   │       └── storage/        # CloudflareR2Storage (S3)
│   ├── prisma/
│   │   ├── schema.prisma       # Schema completo (8 modelos)
│   │   ├── seed.ts             # Dados de exemplo
│   │   └── migrations/         # Migrations do banco
│   ├── types/                  # Augmentação Express.Request
│   ├── Dockerfile              # Build multi-stage Alpine
│   ├── docker-compose.yml      # Traefik + app
│   └── *.md                    # Documentação auxiliar
│
├── frontend/                   # SPA (React + Vite)
│   ├── src/
│   │   ├── main.tsx            # Entry point React
│   │   ├── App.tsx             # Componente raiz + rotas
│   │   ├── types/              # Interfaces TypeScript
│   │   ├── contexts/           # ThemeContext, AccessTypeContext
│   │   ├── hooks/              # useAuth, useMobile, etc.
│   │   ├── lib/                # api-client, utils, validators, const
│   │   ├── components/
│   │   │   ├── ui/             # 53 componentes shadcn/ui
│   │   │   ├── AIChatBox.tsx   # Chat com IA
│   │   │   ├── BpoLayout.tsx   # Layout BPO
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── MobileSidebar.tsx
│   │   │   ├── GoogleLoginButton.tsx
│   │   │   └── ...
│   │   └── pages/
│   │       ├── LandingPage.tsx       # Página inicial pública
│   │       ├── PricingPage.tsx       # Planos e preços
│   │       ├── LoginPage.tsx
│   │       ├── RegisterPage.tsx
│   │       ├── Home.tsx
│   │       ├── client/               # Portal do cliente (11 páginas)
│   │       │   ├── Dashboard.tsx
│   │       │   ├── ProfilePage.tsx
│   │       │   ├── PortfolioPage.tsx
│   │       │   ├── InvestmentsPage.tsx
│   │       │   ├── Documents.tsx
│   │       │   ├── Payments.tsx
│   │       │   ├── Notifications.tsx
│   │       │   ├── SubscriptionPage.tsx
│   │       │   └── ...
│   │       ├── bpo/                  # Portal BPO (11 páginas)
│   │       │   ├── BpoDashboard.tsx
│   │       │   ├── BpoClients.tsx
│   │       │   ├── Reconciliation.tsx
│   │       │   ├── ReconciliationDetail.tsx
│   │       │   ├── CashFlow.tsx
│   │       │   ├── Reports.tsx
│   │       │   ├── Plans.tsx
│   │       │   ├── Users.tsx
│   │       │   └── ...
│   │       └── admin/                # Páginas administrativas
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── vercel.json                   # Deploy Vercel SPA
```

---

## Modelos de Dados

8 modelos no banco PostgreSQL (`backend/prisma/schema.prisma`):

| Modelo | Tabela | Finalidade |
|---|---|---|
| **User** | `users` | Usuários (ADMIN/USER), autenticação local + Google |
| **Client** | `clients` | Clientes BPO (empresa, plano, responsável) |
| **Reconciliation** | `reconciliations` | Reconciliações bancárias (banco, período, saldos) |
| **ReconciliationTransaction** | `reconciliation_transactions` | Transações individuais da reconciliação |
| **Divergence** | `divergences` | Divergências encontradas na reconciliação |
| **CashFlowMovement** | `cash_flow_movements` | Movimentações de fluxo de caixa (entrada/saída) |
| **Plan** | `plans` | Planos de assinatura com features |
| **AuditLog** | `audit_logs` | Log de auditoria de todas as mutações |
| **File** | `files` | Metadados de arquivos no Cloudflare R2 |

---

## API REST

Todas as rotas sob o prefixo `/api`.

### Pública

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Health check |

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login email/senha |
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/google` | Login Google OAuth |
| GET | `/api/auth/me` | Dados do usuário atual |

### Recursos Protegidos (JWT)

| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/clients` | Listar / criar clientes |
| GET/PUT/DELETE | `/api/clients/:id` | CRUD de cliente |
| PATCH | `/api/clients/:id/deactivate` | Desativar cliente |
| GET/POST | `/api/reconciliations` | Listar / criar reconciliações |
| GET/PUT/DELETE | `/api/reconciliations/:id` | CRUD de reconciliação |
| GET/POST | `/api/cashflow` | Listar / criar fluxo de caixa |
| GET | `/api/cashflow/summary` | Sumário de fluxo de caixa |
| GET/PUT/DELETE | `/api/cashflow/:id` | CRUD de movimento |
| GET/POST | `/api/plans` | Listar / criar planos |
| GET/PUT/DELETE | `/api/plans/:id` | CRUD de plano |
| GET/POST | `/api/users` | Listar / criar usuários |
| GET/PUT/DELETE | `/api/users/:id` | CRUD de usuário |

---

## Frontend — Rotas

### Públicas

| Path | Página |
|---|---|
| `/` | Landing Page |
| `/pricing` | Planos e preços |
| `/login` | Login |
| `/register` | Cadastro |

### Painel do Cliente (Investimentos)

| Path | Página |
|---|---|
| `/dashboard` | Dashboard do cliente |
| `/dashboard/subscription` | Assinatura |
| `/dashboard/investments` | Investimentos |
| `/dashboard/portfolio` | Portfólio |
| `/documents` | Documentos |
| `/payments` | Pagamentos |
| `/profile` | Perfil |

### Painel BPO (Operações)

| Path | Página |
|---|---|
| `/bpo/dashboard` | Dashboard BPO |
| `/bpo/clients` | Gestão de clientes |
| `/bpo/reconciliation` | Reconciliações bancárias |
| `/bpo/reconciliation/:id` | Detalhe da reconciliação |
| `/bpo/cashflow` | Fluxo de caixa |
| `/bpo/reports` | Relatórios |
| `/bpo/plans` | Planos |
| `/bpo/users` | Usuários |

---

## Autenticação

- **JWT** (JSON Web Token) para sessões
- **Login local** via email + senha (bcryptjs)
- **Google OAuth 2.0** via `@react-oauth/google` (frontend) + verificação no backend com a API userinfo do Google
- **Roles**: `ADMIN` e `USER`
- Fallback para dados do `localStorage` em caso de erro de rede

---

## Sistema de Auditoria

Toda requisição mutante (POST, PUT, PATCH, DELETE) é interceptada pelo `auditMiddleware` e registrada na tabela `audit_logs` com:

- Usuário autenticado
- Data/hora
- Entidade e ID afetados
- Dados anteriores (`oldData`) e novos (`newData`)
- IP de origem e User-Agent
- Status HTTP retornado

---

## Armazenamento de Arquivos

Integração com **Cloudflare R2** (compatível com S3) via AWS SDK. O modelo `File` armazena metadados como nome original, tipo MIME, tamanho, bucket e chave no bucket, com referência à entidade relacionada.

---

## Configuração e Setup

### Backend

```bash
cd backend
cp .env.example .env    # Configurar variáveis de ambiente
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed      # Dados de exemplo
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env    # Configurar VITE_API_URL
npm install
npm run dev
```

### Variáveis de Ambiente

**Backend (`.env`)**

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Chave secreta JWT |
| `PORT` | Porta do servidor (default: 3333) |
| `CORS_ORIGIN` | Origem permitida para CORS |
| `R2_ENDPOINT` | Endpoint Cloudflare R2 |
| `R2_ACCESS_KEY_ID` | Access key R2 |
| `R2_SECRET_ACCESS_KEY` | Secret key R2 |
| `R2_BUCKET_NAME` | Nome do bucket R2 |
| `R2_PUBLIC_URL` | URL pública do bucket |

**Frontend (`.env`)**

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL da API backend |

---

## Scripts

### Backend

| Script | Comando |
|---|---|
| `npm run dev` | Servidor dev com hot-reload |
| `npm run build` | Build produção (tsup) |
| `npm start` | Iniciar produção |
| `npm run prisma:generate` | Gerar Prisma Client |
| `npm run prisma:migrate` | Rodar migrations |
| `npm run prisma:studio` | Abrir Prisma Studio |
| `npm run prisma:seed` | Popular banco com dados de exemplo |

### Frontend

| Script | Comando |
|---|---|
| `npm run dev` | Servidor dev Vite |
| `npm run build` | TypeScript check + build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview build produção |

---

## Docker

O backend possui Dockerfile multi-stage (Alpine) e `docker-compose.yml` com configuração de proxy reverso Traefik, facilitando o deploy em produção.

---

## Testes

O projeto **não possui testes automatizados** implementados no momento.

---

## Temas e Design

Tema **Art Déco Luxury** com paleta de cores:
- **Ouro** (#D4AF37) — acentos e destaques
- **Esmeralda** — elementos secundários
- **Carvão** — texto e fundos escuros
- **Marfim** — fundos claros

Suporte a **modo escuro e claro** via `next-themes`.

---

## Observações Técnicas

- O repositório contém arquivos `.old.tsx` no diretório BPO, indicando refatoração de versões anteriores da UI
- As páginas de admin estão parcialmente comentadas no roteador
- O sistema de notificações (push/email) não está implementado; existe apenas a interface de configuração de preferências
- O módulo de IA (AIChatBox) está presente no frontend mas sem integração documentada com backend
