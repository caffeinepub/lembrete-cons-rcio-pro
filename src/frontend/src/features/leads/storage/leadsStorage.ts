import type { Lead } from '../model/lead';

const STORAGE_KEY = 'lembrete-consorcio-leads';

function validateLead(lead: any): lead is Lead {
  return (
    lead &&
    typeof lead === 'object' &&
    typeof lead.id === 'string' &&
    typeof lead.name === 'string' &&
    typeof lead.status === 'string' &&
    typeof lead.createdAt === 'string' &&
    typeof lead.updatedAt === 'string'
  );
}

export const leadsStorage = {
  getAll(): Lead[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      
      // Validate and normalize each lead
      return parsed.filter(validateLead).map(lead => ({
        ...lead,
        phone: lead.phone || '',
        notes: lead.notes || '',
        nextFollowUp: lead.nextFollowUp || undefined,
      }));
    } catch (error) {
      console.error('Error loading leads from storage:', error);
      return [];
    }
  },

  save(leads: Lead[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (error) {
      console.error('Error saving leads to storage:', error);
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
      leads[index] = { ...leads[index], ...updates };
      this.save(leads);
    }
  },

  remove(id: string): void {
    const leads = this.getAll();
    const filtered = leads.filter(l => l.id !== id);
    this.save(filtered);
  },
};
