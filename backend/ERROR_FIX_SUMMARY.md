# 🔧 Correção de Erro - Google Auth Callback

## Problema Identificado

Você estava recebendo erro **400** ao tentar fazer login com Google. O log mostrava:

```
[2026-04-09 13:28:17] ERROR: undefined - ← POST /api/auth/google 400 2ms
```

## Causa Raiz

O erro era causado por **falta de validação dentro do try-catch**. A validação do Zod estava ocorrendo FORA do bloco try-catch, então os erros de validação não eram tratados corretamente.

### Antes (❌ Errado):
```typescript
async google(req: Request, res: Response) {
  const { token } = z.object({ token: z.string() }).parse(req.body)  // ❌ Antes do try-catch!

  try {
    // ... código aqui
  } catch (error) {
    throw new AppError('Falha na autenticação com Google', 401)
  }
}
```

### Depois (✅ Correto):
```typescript
async google(req: Request, res: Response) {
  try {
    const { token } = z.object({ token: z.string().min(1) }).parse(req.body)  // ✅ Dentro do try-catch!
    // ... código aqui
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(`Erro de validação: ${error.errors[0]?.message}`, 400)
    }
    // ... outros tratamentos
  }
}
```

## Mudanças Realizadas

### 1. AuthController.ts

✅ **Validação movida para dentro do try-catch**
- Agora trata `ZodError` corretamente
- Mensagens de erro mais descritivas
- Melhor tratamento de `Error` genéricos

✅ **Melhor resolução do container**
- Adicionado try-catch para resolução do `LoginGoogleUsecase`
- Retorna erro 500 se houver problema de injeção

✅ **Tratamento de erros melhorado**
- Verifica `ZodError` → retorna 400
- Verifica `AppError` → retorna status correto
- Verifica `Error` → extrai mensagem
- Fallback genérico para erros desconhecidos

### 2. LoginGoogleUsecase.ts

✅ **Validação de Google API mais robusta**
- Verifica se email/name existem no response
- Diferencia entre erro 401 (token inválido) e outros erros
- Mensagens de erro mais específicas

✅ **Tratamento de erros em duas camadas**
- Erro ao validar com Google API
- Erro ao criar/atualizar usuário no banco

✅ **Logs melhorados**
- `console.error` para debug

## Fluxo de Erro Agora:

```
Frontend envia { token: "..." }
         ↓
Controller valida JSON com Zod
         ↓
  ✅ Token correto? → Prossegue
  ❌ Token inválido? → ZodError → 400 com mensagem
         ↓
UseCase valida token com Google API
         ↓
  ✅ Token válido? → Busca/cria usuário
  ❌ Token 401? → "Token do Google inválido ou expirado" → 401
  ❌ Perfil incompleto? → "Email e nome são obrigatórios" → 401
  ❌ Erro de rede? → "Erro ao validar token com Google" → 401
         ↓
Usuário criado/atualizado com sucesso
         ↓
  ✅ Retorna { user, token } → 200
  ❌ Erro no banco? → "Erro ao criar ou atualizar usuário" → 401
```

## Como Testar

### 1. Com cURL (Token Inválido - teste o erro handling)

```bash
curl -X POST http://localhost:3333/auth/google \
  -H "Content-Type: application/json" \
  -d '{}'

# Esperado: 400 "Erro de validação: Token é obrigatório"
```

```bash
curl -X POST http://localhost:3333/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid-token-here"}'

# Esperado: 401 "Erro ao validar token com Google"
```

### 2. Com Token Válido do Google

```bash
# Obter token em: https://developers.google.com/oauthplayground
curl -X POST http://localhost:3333/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_VALID_GOOGLE_TOKEN"}'

# Esperado: 200 com { user, token }
```

### 3. No Insomnia/Postman

1. Importe [GOOGLE_AUTH_EXAMPLES.http](./GOOGLE_AUTH_EXAMPLES.http)
2. Configure seu token do Google
3. Teste os diferentes cenários

## Checklist de Verificação

- ✅ Build compila sem erros (`npm run build`)
- ✅ Validação do token movida para try-catch
- ✅ Tratamento de `ZodError` implementado
- ✅ Tratamento de `AppError` preservado
- ✅ Mensagens de erro descritivas
- ✅ Container resolve `LoginGoogleUsecase` corretamente
- ✅ UseCase retorna mensagens específicas de erro

## Status

```
⚡️ Build success in 21ms
```

## Próxima Etapa

1. Teste o endpoint com:
   - Token inválido → deve retornar 400 ou 401 com mensagem clara
   - Token válido → deve criar usuário e retornar JWT

2. Monitore os logs:
   ```
   tail -f seu-arquivo-de-log.log
   ```

3. Se ainda houver erro, verifique:
   - [ ] JWT_SECRET está configurado no `.env`?
   - [ ] DATABASE_URL está correto?
   - [ ] Pode conectar ao PostgreSQL?
   - [ ] Token do Google é válido?

## Exemplos de Respostas Esperadas

### ✅ Sucesso (200)
```json
{
  "user": {
    "id": "uuid...",
    "name": "John Doe",
    "email": "john@gmail.com",
    "picture": "https://lh3.googleusercontent.com/..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### ❌ Erro - Token Vazio (400)
```json
{
  "error": "Erro de validação: Token é obrigatório"
}
```

### ❌ Erro - Token Inválido (401)
```json
{
  "error": "Token do Google inválido ou expirado"
}
```

### ❌ Erro - Google API Problema (401)
```json
{
  "error": "Erro ao validar token com Google"
}
```

---

**Todas as mudanças foram implementadas e o build passou com sucesso!** ✨

Agora teste o endpoint e verifique se os erros estão sendo tratados corretamente.
