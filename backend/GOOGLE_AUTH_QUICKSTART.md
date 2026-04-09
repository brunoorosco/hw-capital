# 🔐 Google Authentication Setup Guide

## Quick Start

A autenticação via Google foi implementada no projeto! Aqui está como começar:

### 1. Configurar Variables de Ambiente

Abra o arquivo `.env` na raiz do projeto e configure:

```env
# JWT Secret - generate a strong random string
JWT_SECRET=openssl_rand_-base64_32_output_here
JWT_EXPIRES_IN=7d

# Seu frontend Google Client ID
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 2. Database Já Está Pronto

✅ A migration foi criada e aplicada automaticamente!

Os campos foram adicionados ao modelo `User`:
- `googleId` - ID único do Google
- `picture` - Avatar do usuário
- `provider` - "local" ou "google"
- `password` - Agora opcional

### 3. Usar a Autenticação

#### No Backend

O endpoint já está disponível:

```
POST /auth/google
Content-Type: application/json

{
  "token": "google_access_token"
}
```

Response:
```json
{
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "picture": "..."
  },
  "token": "jwt_token_here"
}
```

#### No Frontend (React/Vue/etc)

```javascript
// Após o usuário fazer login com Google
const googleAccessToken = await getGoogleToken();

const response = await fetch('/auth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: googleAccessToken }),
});

const { user, token } = await response.json();

// Usar o token para requisições autenticadas
localStorage.setItem('authToken', token);
```

## 📚 Documentação Completa

Para mais detalhes, veja:

- **[GOOGLE_AUTH_GUIDE.md](./GOOGLE_AUTH_GUIDE.md)** - Guia técnico completo
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Resumo de todas as mudanças
- **[GOOGLE_AUTH_EXAMPLES.http](./GOOGLE_AUTH_EXAMPLES.http)** - Exemplos HTTP para testar

## 🧪 Como Testar

### 1. Com cURL (requer token válido do Google)

```bash
curl -X POST http://localhost:3333/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_GOOGLE_TOKEN"}'
```

### 2. Com Insomnia/Postman

1. Importe [GOOGLE_AUTH_EXAMPLES.http](./GOOGLE_AUTH_EXAMPLES.http)
2. Configure seu token do Google
3. Execute a requisição

### 3. Obter Token do Google para Teste

Visite: https://developers.google.com/oauthplayground
- Selecione qualquer Google API
- Clique "Authorize APIs"
- Copie o access_token

## 📦 Arquivos Criados

```
src/domain/
├── repositories/
│   └── IUserRepository.ts              # Interface de repositório
└── use-cases/auth/
    ├── ILoginGoogleUsecase.ts          # Interface use-case
    └── google.ts                       # Implementação (CORRIGIDA)

src/infrastructure/
├── container/
│   └── index.ts                        # DI registrado
└── database/prisma/repositories/
    └── PrismaUserRepository.ts         # Implementação Prisma

prisma/
└── migrations/
    └── 20260409124357_add_google_auth_to_user/  # Migration

Documentação:
├── GOOGLE_AUTH_GUIDE.md                # Guia técnico
├── IMPLEMENTATION_SUMMARY.md           # Resumo de mudanças
└── GOOGLE_AUTH_EXAMPLES.http          # Exemplos de teste
```

## 🔄 Fluxo de Autenticação

```
Frontend                          Backend                    Google
   |                                |                          |
   |-- Click "Sign with Google" --->|                          |
   |<-- Redireciona para Google  ---|                          |
   |                                |                          |
   |<----------- Usuário faz login e concede permissões ------>|
   |<----------- Google retorna access_token ------------------|
   |                                |                          |
   |-- POST /auth/google ---------->|                          |
   |    { token: access_token }     |-- Valida token -------->|
   |                                |<-- Dados de usuário ---|
   |                                |                          |
   |                                |-- Cria/atualiza usuário  |
   |                                |-- Gera JWT              |
   |<-- { user, token } JWT --------|                          |
   |                                |                          |
   |-- Usa token em requisições ---|                          |
```

## 📝 Estrutura de Dados

### User Model (Banco de Dados)

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password        VARCHAR(255),  -- Opcional
  googleId        VARCHAR(255) UNIQUE,  -- Novo
  picture         TEXT,  -- Novo (URL da foto)
  provider        VARCHAR(50) DEFAULT 'local',  -- Novo
  role            VARCHAR(50) DEFAULT 'USER',
  active          BOOLEAN DEFAULT true,
  createdAt       TIMESTAMP DEFAULT now(),
  updatedAt       TIMESTAMP DEFAULT now()
);
```

## 🚀 Usar em Produção

### Antes de fazer deploy:

1. **Gere um JWT_SECRET forte:**
   ```bash
   openssl rand -base64 32
   ```

2. **Configure HTTPS:**
   - OAuth do Google requer HTTPS em produção
   - Configure seu servidor com SSL/TLS

3. **Adicione as variáveis de ambiente:**
   ```bash
   JWT_SECRET=seu-valor-aqui
   VITE_GOOGLE_CLIENT_ID=seu-client-id
   DATABASE_URL=sua-url-postgres
   ```

4. **Execute a migration:**
   ```bash
   npx prisma migrate deploy
   ```

5. **Build e start:**
   ```bash
   npm run build
   npm run start
   ```

## 🆘 Problemas Comuns?

### "Invalid Google token"
- Token expirou
- Token é inválido
- Teste no Google OAuth Playground

### "Email já cadastrado"
- Dois usuários tentando usar o mesmo email
- Solução: Usuário precisa usar email diferente ou fazer login sem Google

### Erro de Migration
- Verifique permissões no banco de dados
- Verifique conexão DATABASE_URL
- Rode: `npx prisma db push` para sincronizar

### Token não funciona em requisições
- Verifique se está usando: `Authorization: Bearer token`
- Verifique se o token não expirou
- Decodifique em jwt.io para verificar validade

## 💡 Dicas

✅ O Google Auth agora está **100% funcional**
✅ Suporta usuários novos e existentes
✅ Passwordless para usuários do Google
✅ Avatar é armazenado no banco

## 📞 Próximas Melhorias

- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] Email verification
- [ ] Mais provedores (GitHub, Microsoft)
- [ ] 2FA com Google Authenticator

---

**Precisa de ajuda?** Veja os arquivos de documentação:
- 📄 [GOOGLE_AUTH_GUIDE.md](./GOOGLE_AUTH_GUIDE.md) - Investigação técnica completa
- 📄 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - O que foi mudado
- 📄 [GOOGLE_AUTH_EXAMPLES.http](./GOOGLE_AUTH_EXAMPLES.http) - Como testar
