import type { ClientBoleto } from '../model/clientBoleto';

export interface DashboardMetrics {
  dueToday: number;
  overdue: number;
  totalValueThisMonth: number;
}

export function calculateMetrics(boletos: ClientBoleto[]): DashboardMetrics {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  let dueToday = 0;
  let overdue = 0;
  let totalValueThisMonth = 0;
  
  boletos.forEach(boleto => {
    // Only count pending boletos for metrics
    if (boleto.status !== 'pending') return;
    
    try {
      const dueDate = new Date(boleto.dueDate);
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      
      // Count due today
      if (dueDateOnly.getTime() === today.getTime()) {
        dueToday++;
      }
      
      // Count overdue
      if (dueDateOnly < today) {
        overdue++;
      }
      
      // Sum value for current month
      if (dueDate >= firstDayOfMonth && dueDate <= lastDayOfMonth) {
        totalValueThisMonth += boleto.value;
      }
    } catch (error) {
      console.error('Error processing boleto date:', error);
    }
  });
  
  return {
    dueToday,
    overdue,
    totalValueThisMonth,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
