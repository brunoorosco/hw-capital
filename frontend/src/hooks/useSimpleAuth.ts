import { useState, useEffect, useCallback } from "react";
import type { User } from "@/types";

export function useSimpleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há sessão salva no localStorage
    const authToken = localStorage.getItem("hw_capital_auth");
    const userData = localStorage.getItem("hw_capital_user");

    if (authToken === "true" && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        localStorage.removeItem("hw_capital_auth");
        localStorage.removeItem("hw_capital_user");
      }
    }
    
    setLoading(false);
  }, []);

  const login = useCallback((email: string) => {
    // Simular login - em produção, fazer chamada à API
    return new Promise<User>((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          name: "Investidor Demo",
          email: email,
          role: "client"
        };

        localStorage.setItem("hw_capital_auth", "true");
        localStorage.setItem("hw_capital_user", JSON.stringify(newUser));
        setUser(newUser);
        resolve(newUser);
      }, 1500);
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hw_capital_auth");
    localStorage.removeItem("hw_capital_user");
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout
  };
}
