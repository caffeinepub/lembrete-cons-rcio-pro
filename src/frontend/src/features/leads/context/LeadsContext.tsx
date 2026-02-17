import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Lead, LeadStatus } from '../model/lead';
import { leadsStorage } from '../storage/leadsStorage';

interface LeadsContextValue {
  leads: Lead[];
  isLoading: boolean;
  createLead: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  snoozeFollowUp: (id: string, minutes: number) => void;
  completeFollowUp: (id: string) => void;
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load leads on mount
  useEffect(() => {
    const loadedLeads = leadsStorage.getAll();
    setLeads(loadedLeads);
    setIsLoading(false);
  }, []);

  const createLead = useCallback((data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...data,
      id: generateSafeId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leadsStorage.add(newLead);
    setLeads(prev => [...prev, newLead]);
    return newLead;
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    const timestamp = new Date().toISOString();
    const updatesWithTimestamp = { ...updates, updatedAt: timestamp };
    leadsStorage.update(id, updatesWithTimestamp);
    setLeads(prev => prev.map(lead => 
      lead.id === id ? { ...lead, ...updatesWithTimestamp } : lead
    ));
  }, []);

  const deleteLead = useCallback((id: string) => {
    leadsStorage.remove(id);
    setLeads(prev => prev.filter(lead => lead.id !== id));
  }, []);

  const updateLeadStatus = useCallback((id: string, status: LeadStatus) => {
    updateLead(id, { status });
  }, [updateLead]);

  const snoozeFollowUp = useCallback((id: string, minutes: number) => {
    if (!minutes || minutes <= 0) return;
    const nextFollowUp = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    updateLead(id, { nextFollowUp });
  }, [updateLead]);

  const completeFollowUp = useCallback((id: string) => {
    updateLead(id, { nextFollowUp: undefined });
  }, [updateLead]);

  const value: LeadsContextValue = {
    leads,
    isLoading,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    snoozeFollowUp,
    completeFollowUp,
  };

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeadsContext() {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeadsContext must be used within LeadsProvider');
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
