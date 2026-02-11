import { useState, useCallback } from "react";
import type { User } from "@/types";

export function useAuth() {
  // Lazy initialization - carrega do localStorage apenas 1x na inicialização
  const [user, setUser] = useState<User | null>(() => {
    console.log('[useAuth SIMPLIFIED] Inicializando estado do usuário');
    const token = localStorage.getItem('hw-token');
    const userDataStr = localStorage.getItem('hw-user');
    
    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        console.log('[useAuth SIMPLIFIED] Usuário carregado:', userData);
        return userData;
      } catch (error) {
        console.error('[useAuth SIMPLIFIED] Erro ao parsear dados:', error);
        return null;
      }
    }
    
    console.log('[useAuth SIMPLIFIED] Sem autenticação');
    return null;
  });
  
  const [loading] = useState(false); // Sempre false, pois carrega sincronamente

  const logout = useCallback(() => {
    console.log('[useAuth SIMPLIFIED] Logout');
    localStorage.removeItem('hw-token');
    localStorage.removeItem('hw-user');
    localStorage.removeItem('hw-access-type');
    localStorage.removeItem('manus-runtime-user-info');
    setUser(null);
    
    // Forçar redirecionamento para landing page
    window.location.href = '/';
  }, []);

  const refresh = useCallback(() => {
    console.log('[useAuth SIMPLIFIED] Refresh');
    const userDataStr = localStorage.getItem('hw-user');
    if (userDataStr) {
      try {
        setUser(JSON.parse(userDataStr));
      } catch (error) {
        console.error('[useAuth SIMPLIFIED] Erro no refresh:', error);
      }
    }
  }, []);

  return {
    user,
    loading,
    error: null,
    isAuthenticated: !!user,
    logout,
    refresh,
  };
}
