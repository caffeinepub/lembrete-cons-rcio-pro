// Lead data model with fields for CRM management and follow-up tracking
export interface Lead {
  id: string;
  name: string;
  phone: string;
  notes: string;
  status: LeadStatus;
  nextFollowUp?: string; // ISO date-time string
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'novo' | 'contato-feito' | 'interessado' | 'negociacao' | 'ganho' | 'perdido';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  'novo': 'Novo',
  'contato-feito': 'Contato Feito',
  'interessado': 'Interessado',
  'negociacao': 'Negociação',
  'ganho': 'Ganho',
  'perdido': 'Perdido',
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  'novo': 'bg-blue-500',
  'contato-feito': 'bg-yellow-500',
  'interessado': 'bg-purple-500',
  'negociacao': 'bg-orange-500',
  'ganho': 'bg-green-500',
  'perdido': 'bg-gray-500',
};
