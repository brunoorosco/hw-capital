export interface User {
  name: string;
  email: string;
  role: "client" | "admin" | "ADMIN" | "USER"; // Aceita tanto frontend quanto backend roles
  phone?: string;
  cpfCnpj?: string;
}

export interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ReactElement;
  features: string[];
  highlighted: boolean;
  badge: string | null;
  originalPrice?: string;
}
