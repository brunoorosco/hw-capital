# HW Capital - Backend API

Backend para o sistema de BPO Financeiro da HW Capital.

## 🏗️ Arquitetura

- **Clean Architecture**: Separação clara entre camadas (Domain, Application, Infrastructure)
- **Dependency Injection**: Usando TSyringe para inversão de controle
- **TypeScript**: Tipagem forte e segurança de tipos
- **Prisma ORM**: Para gerenciamento do banco de dados PostgreSQL

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── domain/                 # Camada de Domínio (Entities, Repositories)
│   │   ├── entities/          # Entidades de negócio
│   │   ├── repositories/      # Interfaces de repositórios
│   │   └── use-cases/         # Casos de uso (regras de negócio)
│   ├── application/           # Camada de Aplicação
│   │   ├── dtos/             # Data Transfer Objects
│   │   └── services/         # Serviços de aplicação
│   └── infrastructure/        # Camada de Infraestrutura
│       ├── database/         # Prisma, Migrations
│       ├── http/             # Express, Controllers, Routes
│       ├── storage/          # Cloudflare R2
│       └── audit/            # Sistema de auditoria
├── prisma/
│   └── schema.prisma         # Schema do banco de dados
└── tests/                    # Testes unitários e integração
```

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados principal
- **TSyringe** - Injeção de dependência
- **JWT** - Autenticação
- **Zod** - Validação de schemas
- **Cloudflare R2** - Armazenamento de arquivos (compatível com S3)

## ⚙️ Configuração

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Executar migrations do Prisma:**
```bash
npm run prisma:migrate
npm run prisma:generate
```

4. **Iniciar servidor de desenvolvimento:**
```bash
npm run dev
```

## 📊 Banco de Dados

### Modelos Principais

- **Users**: Usuários do sistema (admin/user)
- **Clients**: Clientes BPO
- **Reconciliations**: Reconciliações bancárias
- **ReconciliationTransactions**: Transações de reconciliação
- **Divergences**: Divergências identificadas
- **CashFlowMovements**: Movimentações de fluxo de caixa
- **Plans**: Planos de assinatura
- **AuditLog**: **Auditoria completa de POST/PUT/DELETE**
- **Files**: Arquivos armazenados no Cloudflare R2

### Sistema de Auditoria

Todas as operações **POST**, **PUT** e **DELETE** são automaticamente auditadas:

- Usuário que executou
- Data/hora
- Entidade afetada
- Dados anteriores (oldData)
- Dados novos (newData)
- IP e User-Agent
- Status HTTP

## 🔐 Autenticação

JWT (JSON Web Token) com refresh token

## 📦 Scripts

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm start` - Iniciar produção
- `npm run prisma:migrate` - Executar migrations
- `npm run prisma:studio` - Abrir Prisma Studio
- `npm test` - Executar testes

## 🌐 Endpoints (a implementar)

- `/api/auth` - Autenticação
- `/api/clients` - Gestão de clientes
- `/api/reconciliations` - Reconciliações bancárias
- `/api/cashflow` - Fluxo de caixa
- `/api/plans` - Planos
- `/api/users` - Usuários
- `/api/files` - Upload/download de arquivos
- `/api/audit` - Logs de auditoria
