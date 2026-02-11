import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

// Criar instância do axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hw-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !isLoginRequest) {
      // Sessão expirada (mas não é erro de login)
      localStorage.removeItem('hw-token');
      localStorage.removeItem('hw-user');
      window.location.href = '/login';
      toast.error('Sessão expirada. Faça login novamente.');
    } else if (!isLoginRequest) {
      // Mostrar toast apenas se NÃO for requisição de login
      // (deixar o LoginPage.tsx tratar seus próprios erros)
      const message = error.response?.data?.message || 'Erro ao processar requisição';
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'USER';
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export const authAPI = {
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    localStorage.setItem('hw-token', response.data.token);
    localStorage.setItem('hw-user', JSON.stringify(response.data.user));
    return response.data;
  },

  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    localStorage.setItem('hw-token', response.data.token);
    localStorage.setItem('hw-user', JSON.stringify(response.data.user));
    return response.data;
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('hw-token');
    localStorage.removeItem('hw-user');
    window.location.href = '/';
  },
};

// ============================================
// CLIENTS API
// ============================================

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address?: string;
  plan: string;
  monthlyValue: number;
  status: string;
  notes?: string;
  responsibleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDTO {
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address?: string;
  plan: string;
  monthlyValue: number;
  notes?: string;
  responsibleId?: string;
}

export const clientsAPI = {
  list: async (params?: { search?: string; status?: string }) => {
    const response = await api.get<Client[]>('/clients', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  create: async (data: CreateClientDTO) => {
    const response = await api.post<Client>('/clients', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateClientDTO>) => {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/clients/${id}`);
  },

  deactivate: async (id: string) => {
    const response = await api.patch<Client>(`/clients/${id}/deactivate`);
    return response.data;
  },
};

// ============================================
// RECONCILIATIONS API
// ============================================

export interface Reconciliation {
  id: string;
  clientId: string;
  bank: string;
  account?: string;
  period: string;
  startBalance: number;
  endBalance?: number;
  bankBalance?: number;
  systemBalance?: number;
  difference?: number;
  status: string;
  responsible?: string;
  startDate: string;
  dueDate?: string;
  completedAt?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReconciliationDTO {
  clientId: string;
  bank: string;
  account?: string;
  period: string;
  startBalance: number;
  responsible?: string;
  dueDate?: string;
  observations?: string;
}

export const reconciliationsAPI = {
  list: async (params?: { clientId?: string; status?: string }) => {
    const response = await api.get<Reconciliation[]>('/reconciliations', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<Reconciliation>(`/reconciliations/${id}`);
    return response.data;
  },

  create: async (data: CreateReconciliationDTO) => {
    const response = await api.post<Reconciliation>('/reconciliations', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Reconciliation>) => {
    const response = await api.put<Reconciliation>(`/reconciliations/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/reconciliations/${id}`);
  },
};

// ============================================
// CASH FLOW API
// ============================================

export interface CashFlowMovement {
  id: string;
  clientId: string;
  type: 'ENTRADA' | 'SAIDA';
  description: string;
  amount: number;
  date: string;
  category?: string;
  document?: string;
  observation?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCashFlowDTO {
  clientId: string;
  type: 'ENTRADA' | 'SAIDA';
  description: string;
  amount: number;
  date: string;
  category?: string;
  document?: string;
  observation?: string;
}

export interface CashFlowSummary {
  entradas: number;
  saidas: number;
  saldo: number;
  totalMovimentos: number;
}

export const cashflowAPI = {
  list: async (params?: { 
    clientId?: string; 
    type?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get<CashFlowMovement[]>('/cashflow', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<CashFlowMovement>(`/cashflow/${id}`);
    return response.data;
  },

  create: async (data: CreateCashFlowDTO) => {
    const response = await api.post<CashFlowMovement>('/cashflow', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateCashFlowDTO>) => {
    const response = await api.put<CashFlowMovement>(`/cashflow/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/cashflow/${id}`);
  },

  summary: async (params?: { 
    clientId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get<CashFlowSummary>('/cashflow/summary', { params });
    return response.data;
  },
};
