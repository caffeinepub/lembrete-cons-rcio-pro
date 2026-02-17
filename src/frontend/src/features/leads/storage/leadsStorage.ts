// Local storage persistence for leads with dedicated key
import type { Lead } from '../model/lead';

const STORAGE_KEY = 'lembrete-consorcio-leads';

export const leadsStorage = {
  getAll(): Lead[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading leads:', error);
      return [];
    }
  },

  save(leads: Lead[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (error) {
      console.error('Error saving leads:', error);
    }
  },

  add(lead: Lead): void {
    const leads = this.getAll();
    leads.push(lead);
    this.save(leads);
  },

  update(id: string, updates: Partial<Lead>): void {
    const leads = this.getAll();
    const index = leads.findIndex(l => l.id === id);
    if (index !== -1) {
      leads[index] = { ...leads[index], ...updates, updatedAt: new Date().toISOString() };
      this.save(leads);
    }
  },

  remove(id: string): void {
    const leads = this.getAll();
    const filtered = leads.filter(l => l.id !== id);
    this.save(filtered);
  },
};
