// Client/Boleto data model for Dashboard management
export interface ClientBoleto {
  id: string;
  name: string;
  phone: string;
  dueDate: string; // ISO date string
  value: number; // Value in BRL
  status: BoletoStatus;
  notes: string;
  snoozeUntil?: string; // ISO date-time string for reminder snooze
  createdAt: string;
  updatedAt: string;
}

export type BoletoStatus = 'pending' | 'sent';

export const BOLETO_STATUS_LABELS: Record<BoletoStatus, string> = {
  'pending': 'Pendente',
  'sent': 'Enviado',
};

export const BOLETO_STATUS_COLORS: Record<BoletoStatus, string> = {
  'pending': 'bg-yellow-500',
  'sent': 'bg-green-500',
};
