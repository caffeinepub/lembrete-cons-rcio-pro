import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { ClientBoleto, BoletoStatus } from '../model/clientBoleto';
import { clientBoletosStorage } from '../storage/clientBoletosStorage';

interface ClientBoletosContextValue {
  clientBoletos: ClientBoleto[];
  isLoading: boolean;
  createClientBoleto: (data: Omit<ClientBoleto, 'id' | 'createdAt' | 'updatedAt'>) => ClientBoleto;
  updateClientBoleto: (id: string, updates: Partial<ClientBoleto>) => void;
  deleteClientBoleto: (id: string) => void;
  updateBoletoStatus: (id: string, status: BoletoStatus) => void;
  snoozeBoleto: (id: string, minutes: number) => void;
  markAsSent: (id: string) => void;
}

const ClientBoletosContext = createContext<ClientBoletosContextValue | null>(null);

export function ClientBoletosProvider({ children }: { children: ReactNode }) {
  const [clientBoletos, setClientBoletos] = useState<ClientBoleto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load client boletos on mount
  useEffect(() => {
    const loaded = clientBoletosStorage.getAll();
    setClientBoletos(loaded);
    setIsLoading(false);
  }, []);

  const createClientBoleto = useCallback((data: Omit<ClientBoleto, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: ClientBoleto = {
      ...data,
      id: generateSafeId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    clientBoletosStorage.add(newItem);
    setClientBoletos(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const updateClientBoleto = useCallback((id: string, updates: Partial<ClientBoleto>) => {
    const timestamp = new Date().toISOString();
    const updatesWithTimestamp = { ...updates, updatedAt: timestamp };
    clientBoletosStorage.update(id, updatesWithTimestamp);
    setClientBoletos(prev => prev.map(item => 
      item.id === id ? { ...item, ...updatesWithTimestamp } : item
    ));
  }, []);

  const deleteClientBoleto = useCallback((id: string) => {
    clientBoletosStorage.remove(id);
    setClientBoletos(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateBoletoStatus = useCallback((id: string, status: BoletoStatus) => {
    updateClientBoleto(id, { status });
  }, [updateClientBoleto]);

  const snoozeBoleto = useCallback((id: string, minutes: number) => {
    if (!minutes || minutes <= 0) return;
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    updateClientBoleto(id, { snoozeUntil });
  }, [updateClientBoleto]);

  const markAsSent = useCallback((id: string) => {
    updateClientBoleto(id, { status: 'sent', snoozeUntil: undefined });
  }, [updateClientBoleto]);

  const value: ClientBoletosContextValue = {
    clientBoletos,
    isLoading,
    createClientBoleto,
    updateClientBoleto,
    deleteClientBoleto,
    updateBoletoStatus,
    snoozeBoleto,
    markAsSent,
  };

  return <ClientBoletosContext.Provider value={value}>{children}</ClientBoletosContext.Provider>;
}

export function useClientBoletosContext() {
  const context = useContext(ClientBoletosContext);
  if (!context) {
    throw new Error('useClientBoletosContext must be used within ClientBoletosProvider');
  }
  return context;
}

// Safe ID generation with fallback
function generateSafeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
