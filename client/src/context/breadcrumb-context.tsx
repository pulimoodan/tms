import { createContext, useContext, useState, ReactNode } from 'react';

interface BreadcrumbContextType {
  entityLabel: string | null;
  setEntityLabel: (label: string | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [entityLabel, setEntityLabel] = useState<string | null>(null);

  return (
    <BreadcrumbContext.Provider value={{ entityLabel, setEntityLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}

