// Hook for CRUD operations on leads with local state management
import { useState, useEffect, useCallback } from 'react';
import type { Lead, LeadStatus } from '../model/lead';
import { leadsStorage } from '../storage/leadsStorage';

export function useLeads() {
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
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leadsStorage.add(newLead);
    setLeads(prev => [...prev, newLead]);
    return newLead;
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    leadsStorage.update(id, updates);
    setLeads(prev => prev.map(lead => 
      lead.id === id ? { ...lead, ...updates, updatedAt: new Date().toISOString() } : lead
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
    const nextFollowUp = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    updateLead(id, { nextFollowUp });
  }, [updateLead]);

  const completeFollowUp = useCallback((id: string) => {
    updateLead(id, { nextFollowUp: undefined });
  }, [updateLead]);

  return {
    leads,
    isLoading,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    snoozeFollowUp,
    completeFollowUp,
  };
}
