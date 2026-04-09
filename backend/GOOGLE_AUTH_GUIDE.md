# Autenticação Google - Guia de Implementação

## Resumo das Mudanças

Este guia documenta as mudanças realizadas para implementar autenticação via Google no projeto.

### 1. Schema Prisma Atualizado

O modelo `User` agora suporta múltiplos provedores de autenticação:

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String?  // Agora opcional para usuários do Google
  googleId  String?  @unique
  picture   String?
  provider  String   @default("local")
  role      UserRole @default(USER)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // ...
}
```

**Mudanças principais:**
- `password` agora é opcional (`String?`) pois usuários Google não têm senha
- Adicionado campo `googleId` com índice único
- Adicionado campo `picture` para armazenar avatar do Google
- Adicionado campo `provider` para rastrear o provedor de autenticação (local/google)

### 2. Entidade User Atualizada

Arquivo: `src/domain/entities/User.ts`

```typescript
export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export class User {
  id: string;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  picture?: string;
  provider: AuthProvider;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  // ...
}
```

### 3. Interfaces e Repositórios

#### IUserRepository
Arquivo: `src/domain/repositories/IUserRepository.ts`

Interface que define operações de usuário:
- `create()` - Criar novo usuário
- `findByEmail()` - Buscar por email
- `findById()` - Buscar por ID
- `findByGoogleId()` - Buscar por Google ID
- `update()` - Atualizar usuário
- `updateAccessToken()` - Atualizar token de acesso
- `findAll()` - Listar usuários

#### PrismaUserRepository
Arquivo: `src/infrastructure/database/prisma/repositories/PrismaUserRepository.ts`

Implementação com Prisma que:
- Realiza operações CRUD em usuários
- Valida dados através de DTOs
- Mapeia modelos Prisma para entidades de domínio

### 4. Use Case: LoginGoogleUsecase

Arquivo: `src/domain/use-cases/auth/google.ts`

**Fluxo:**
1. Valida token de acesso enviado pelo cliente
2. Faz requisição à API do Google para validar token
3. Extrai dados do usuário (email, name, picture, googleId)
4. Busca usuário existente por googleId
5. Se não existe:
   - Verifica se há usuário com esse email
   - Se não, cria novo usuário
   - Se sim, atualiza usuário com dados do Google
6. Gera JWT com informações do usuário
7. Retorna token e dados do usuário

**Interface:**
```typescript
interface TLoginGoogleUsecase.Params {
  token: string; // Token de acesso do Google
}

interface TLoginGoogleUsecase.Result {
  accessToken: string; // Token JWT
  user: {
    id: string;
    name: string;
    email: string;
    picture?: string;
  };
}
```

### 5. Controller: AuthController

Arquivo: `src/infrastructure/http/controllers/AuthController.ts`

Nuevo método `google()`:
- Recebe token do cliente
- Injeta dependência do use-case
- Executa lógica de autenticação
- Gera JWT assinado com JWT_SECRET
- Retorna token e dados do usuário

### 6. Container de Injeção de Dependências

Arquivo: `src/infrastructure/container/index.ts`

Registros adicionados:
```typescript
// Repositórios
container.registerSingleton<IUserRepository>(
  'PrismaUserRepository',
  PrismaUserRepository
);

// Use-cases
container.registerSingleton<LoginGoogleUsecase>(
  'LoginGoogleUsecase',
  LoginGoogleUsecase
);
```

### 7. Rotas de Autenticação

Arquivo: `src/infrastructure/http/routes/auth.routes.ts`

**Novo endpoint:**
```
POST /auth/google
Body: { "token": "google_access_token" }

Response:
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "picture": "https://..."
  },
  "token": "jwt_token"
}
```

## Como Usar

### 1. No Frontend (Client)

```javascript
// Obtenha o token do Google OAuth 2.0
const googleToken = await getGoogleAccessToken(); // seu código de OAuth

// Envie para o backend
const response = await fetch('/auth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: googleToken }),
});

const { user, token } = await response.json();

// Use o token para requisições autenticadas
localStorage.setItem('authToken', token);
```

### 2. Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Não necessário armazenar credenciais do Google no backend
# A validação é feita direto com a API do Google
```

### 3. Testar via cURL

```bash
curl -X POST http://localhost:3333/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_GOOGLE_ACCESS_TOKEN"}'
```

## Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND/CLIENT                         │
└──────────┬──────────────────────────────────────────────────┘
           │
           │ 1. User clicks "Sign in with Google"
           │
           ├─── Google Sign-In Dialog
           │       ↓
           │    User grants access
           │       ↓
           │    Google returns access_token
           │
           │ 2. Send token to backend
           ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND                                │
│                                                              │
│  POST /auth/google                                           │
│  ├─ Validate token with Google API                          │
│  ├─ Extract user info (email, name, picture)                │
│  ├─ Find or create user in database                         │
│  ├─ Generate JWT token                                      │
│  └─ Return user + JWT                                       │
└──────────┬──────────────────────────────────────────────────┘
           │
           │ 3. Return JWT token + user data
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND/CLIENT                         │
│                                                              │
│  ├─ Store JWT in localStorage                               │
│  └─ Use JWT for subsequent API requests                     │
└─────────────────────────────────────────────────────────────┘
```

## Casos de Uso Suportados

### 1. **Novo Usuário via Google**
- Email não existe no sistema
- Cria novo usuário com dados do Google
- Define provider como 'google'
- User inicia como ativo

### 2. **Usuário Existente (Email)**
- Email já existe no sistema
- Atualiza usuário com googleId
- Próximo login pode ser via Google

### 3. **Re-login via Google**
- googleId encontrado
- Retorna dados do usuário existente
- Valida se usuário está ativo

## Segurança

✅ **Implementado:**
- Token validado direto com API Google
- Senha opcional e não obrigatória
- JWT assinado com secret privado
- Usuário inativo não consegue fazer login

## Próximos Passos (Opcional)

1. **Refresh Tokens:** Implementar refresh token para melhor segurança
2. **Social Login Providers:** Adicionar GitHub, Microsoft, etc.
3. **Email Verification:** Revalidar email em determinados intervalos
4. **Session Management:** Implementar sessions em Redis
5. **Rate Limiting:** Implementar rate limiting em endpoints de auth

## Troubleshooting

### Erro: "Invalid Google token"
- Verifique se o token está correto
- Verifique se não expirou
- Valide no: https://developers.google.com/oauthplayground

### Erro: "Email já cadastrado"
- Dois usuários com o mesmo email
- Execute migration para sincronizar GoogleId

### Erro: "User not found"
- Verifique se o usuário foi criado corretamente
- Verifique permissões do banco de dados
