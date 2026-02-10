import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type AccessType = "investimentos" | "bpo";

interface AccessTypeContextType {
  accessType: AccessType;
  setAccessType: (type: AccessType) => void;
}

const AccessTypeContext = createContext<AccessTypeContextType | undefined>(undefined);

export function AccessTypeProvider({ children }: { children: ReactNode }) {
  const [accessType, setAccessTypeState] = useState<AccessType>(() => {
    const saved = localStorage.getItem("hw-access-type");
    return (saved === "bpo" ? "bpo" : "investimentos") as AccessType;
  });

  const setAccessType = (type: AccessType) => {
    setAccessTypeState(type);
    localStorage.setItem("hw-access-type", type);
  };

  useEffect(() => {
    localStorage.setItem("hw-access-type", accessType);
  }, [accessType]);

  return (
    <AccessTypeContext.Provider value={{ accessType, setAccessType }}>
      {children}
    </AccessTypeContext.Provider>
  );
}

export function useAccessType() {
  const context = useContext(AccessTypeContext);
  if (context === undefined) {
    throw new Error("useAccessType must be used within an AccessTypeProvider");
  }
  return context;
}
