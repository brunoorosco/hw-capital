import type { AccessType } from "@/contexts/AccessTypeContext";

/**
 * Determina a rota de redirecionamento após login baseado no role do usuário
 * e no tipo de acesso selecionado
 * 
 * NOTA: Tanto ADMIN quanto USER vão para as mesmas páginas (BPO ou Dashboard).
 * A diferença está nos menus/permissões que aparecem para cada role.
 */
export function getRedirectPath(userRole: string, accessType?: AccessType): string {
  // Normalizar role (backend retorna ADMIN/USER, frontend espera admin/client/bpo)
  const role = userRole.toLowerCase();

  console.log('[redirect-helper] getRedirectPath chamado:', { userRole, role, accessType });

  // Se selecionou BPO na landing page → vai para BPO Dashboard
  if (accessType === 'bpo') {
    console.log(`[redirect-helper] ${role.toUpperCase()} + BPO, redirecionando para /bpo/dashboard`);
    return '/bpo/dashboard';
  }

  // Padrão: Dashboard de investimentos/cliente
  console.log(`[redirect-helper] ${role.toUpperCase()} + investimentos (ou sem seleção), redirecionando para /dashboard`);
  return '/dashboard';
}

/**
 * Obtém o tipo de acesso salvo no localStorage
 */
export function getSavedAccessType(): AccessType | null {
  const saved = localStorage.getItem("hw-access-type");
  if (saved === "bpo" || saved === "investimentos") {
    return saved as AccessType;
  }
  return null;
}
