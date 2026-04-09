# Frontend Integration Example - Google OAuth

Este arquivo demonstra como integrar o Google OAuth com seu frontend para fazer login via Google.

## 1. Setup no Frontend (React + react-google-login ou @react-oauth/google)

### Usando @react-oauth/google (Recomendado - mais novo)

```bash
npm install @react-oauth/google
```

### Configurar Provider

```jsx
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

export default function Root() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  );
}
```

### `.env` (Frontend)

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-from-google-console.apps.googleusercontent.com
VITE_API_URL=http://localhost:3333
```

## 2. Component de Login

```jsx
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setLoading(true);
      setError(null);

      try {
        // Enviar token para backend
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/google`,
          {
            token: codeResponse.access_token,
          }
        );

        // Extrair dados
        const { user, token } = response.data;

        // Guardar token no localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Redirecionar para dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Authentication failed:', err);
        setError(
          err.response?.data?.message || 'Failed to authenticate with Google'
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Failed to connect with Google');
    },
    flow: 'implicit', // ou 'auth-code' dependendo da configuração
  });

  return (
    <div>
      <button 
        onClick={() => login()} 
        disabled={loading}
        className="google-sign-in-button"
      >
        {loading ? 'Conectando...' : 'Entrar com Google'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

## 3. API Client com Token Automático

```jsx
// api.ts ou apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Adicionar token em todas as requisições
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Tratar respostas 401 (token expirado)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirou - fazer logout
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## 4. Context de Autenticação

```jsx
// useAuth.ts
import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar usuário do localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse user:', err);
      }
    }

    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getCurrentUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        getCurrentUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
```

## 5. Protected Route Component

```jsx
// ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function ProtectedRoute({ element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
}
```

## 6. Exemplo de Página de Login

```jsx
// LoginPage.tsx
import { GoogleSignInButton } from './GoogleSignInButton';

export default function LoginPage() {
  return (
    <div className="login-container">
      <h1>Bem-vindo</h1>
      
      <div className="login-options">
        <GoogleSignInButton />
        
        {/* Ou login tradicional */}
        <form>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Senha" />
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
```

## 7. App Navigation com Rotas

```jsx
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { ProtectedRoute } from './ProtectedRoute';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
      />
      <Route
        path="/dashboard"
        element={<ProtectedRoute element={<DashboardPage />} />}
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## 8. Exemplo de Página Autenticada

```jsx
// DashboardPage.tsx
import { useAuth } from './useAuth';
import apiClient from './api';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/some-protected-endpoint');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div className="user-profile">
        {user?.picture && <img src={user.picture} alt={user.name} />}
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
        <button onClick={logout}>Logout</button>
      </div>

      {data && (
        <div className="content">
          {/* Mostrar conteúdo protegido */}
        </div>
      )}
    </div>
  );
}
```

## 9. Setup Completo do Root

```jsx
// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
```

## 10. Configurar Variáveis de Ambiente

### `.env`
```env
VITE_GOOGLE_CLIENT_ID=sua-client-id.apps.googleusercontent.com
VITE_API_URL=http://localhost:3333
```

### `.env.production`
```env
VITE_GOOGLE_CLIENT_ID=sua-client-id.apps.googleusercontent.com
VITE_API_URL=https://api.seudomain.com
```

## 11. Package.json

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@react-oauth/google": "^0.12.0",
    "axios": "^1.3.2"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^4.9.0",
    "vite": "^4.1.0"
  }
}
```

## 12. Tratamento de Erros Comum

```jsx
// errorHandler.ts
export const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    return 'Sessão expirada. Faça login novamente.';
  }
  
  if (error.response?.status === 403) {
    return 'Você não tem permissão para acessar isso.';
  }
  
  if (error.response?.status === 400) {
    return error.response.data?.message || 'Request inválido.';
  }
  
  if (!error.response) {
    return 'Erro de conexão com servidor.';
  }
  
  return 'Erro desconhecido. Tente novamente.';
};
```

## 13. Testing

```jsx
// LoginPage.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('should render Google sign-in button', () => {
    render(<LoginPage />);
    expect(screen.getByText(/entrar com google/i)).toBeInTheDocument();
  });

  it('should call Google login on button click', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const button = screen.getByText(/entrar com google/i);
    await user.click(button);
    
    // Verificar se função foi chamada
  });
});
```

## Fluxo Completo

```
1. User clica em "Entrar com Google"
2. Google OAuth Dialog aparece
3. User faz login no Google
4. Google retorna access_token
5. Frontend envia token para /auth/google
6. Backend valida token com Google API
7. Backend cria/atualiza usuário no banco
8. Backend retorna JWT + dados do usuário
9. Frontend armazena JWT no localStorage
10. Frontend redireciona para dashboard
11. Todas as requisições incluem JWT no header
12. Backend valida JWT em cada requisição
```

## Referências

- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
- [Google OAuth Setup](https://developers.google.com/identity/gsi/web/guides/setup)
- [JWT - jwt.io](https://jwt.io/)
- [Axios Interceptors](https://github.com/axios/axios#interceptors)
- [React Router](https://reactrouter.com/)

## Próximas Funcionalidades para Adicionar

- [ ] Remember me / "Manter conectado"
- [ ] Social linking (conectar múltiplas contas sociais)
- [ ] Refresh tokens automáticos
- [ ] Logout de outros dispositivos
- [ ] 2FA
- [ ] Session management

---

**Precisa de ajuda?** Revise a documentação backend em:
- [GOOGLE_AUTH_QUICKSTART.md](../GOOGLE_AUTH_QUICKSTART.md)
- [GOOGLE_AUTH_GUIDE.md](../GOOGLE_AUTH_GUIDE.md)
