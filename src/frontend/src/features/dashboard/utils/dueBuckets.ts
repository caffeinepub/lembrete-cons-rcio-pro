import type { ClientBoleto, BoletoStatus } from '../model/clientBoleto';

export type DueBucket = 'overdue' | 'today' | 'tomorrow' | 'nextDays';
export type FilterMode = 'all' | 'pending' | 'sent';

export interface BucketedBoletos {
  overdue: ClientBoleto[];
  today: ClientBoleto[];
  tomorrow: ClientBoleto[];
  nextDays: ClientBoleto[];
}

export const BUCKET_LABELS: Record<DueBucket, string> = {
  overdue: 'Vencidos',
  today: 'Vence Hoje',
  tomorrow: 'Vence Amanhã',
  nextDays: 'Próximos Dias',
};

export function getBucketForDate(dueDate: string): DueBucket {
  try {
    const due = new Date(dueDate);
    const now = new Date();
    
    // Reset time to compare dates only
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDay < today) return 'overdue';
    if (dueDay.getTime() === today.getTime()) return 'today';
    if (dueDay.getTime() === tomorrow.getTime()) return 'tomorrow';
    return 'nextDays';
  } catch {
    return 'nextDays';
  }
}

export function bucketBoletos(boletos: ClientBoleto[], filterMode: FilterMode = 'all'): BucketedBoletos {
  // Apply status filter
  let filtered = boletos;
  if (filterMode === 'pending') {
    filtered = boletos.filter(b => b.status === 'pending');
  } else if (filterMode === 'sent') {
    filtered = boletos.filter(b => b.status === 'sent');
  }
  
  const buckets: BucketedBoletos = {
    overdue: [],
    today: [],
    tomorrow: [],
    nextDays: [],
  };
  
  filtered.forEach(boleto => {
    const bucket = getBucketForDate(boleto.dueDate);
    buckets[bucket].push(boleto);
  });
  
  // Sort each bucket by due date (earliest first)
  Object.keys(buckets).forEach(key => {
    const bucket = key as DueBucket;
    buckets[bucket].sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return dateA - dateB;
    });
  });
  
  return buckets;
}

export function filterBoletosByStatus(boletos: ClientBoleto[], status?: BoletoStatus): ClientBoleto[] {
  if (!status) return boletos;
  return boletos.filter(b => b.status === status);
}
