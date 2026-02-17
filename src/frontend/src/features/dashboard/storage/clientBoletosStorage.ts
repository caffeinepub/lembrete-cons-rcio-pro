import type { ClientBoleto } from '../model/clientBoleto';

const STORAGE_KEY = 'lembrete-consorcio-client-boletos';

function validateClientBoleto(item: any): item is ClientBoleto {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.dueDate === 'string' &&
    typeof item.value === 'number' &&
    typeof item.status === 'string' &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string'
  );
}

export const clientBoletosStorage = {
  getAll(): ClientBoleto[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      
      // Validate and normalize each client boleto
      return parsed.filter(validateClientBoleto).map(item => ({
        ...item,
        phone: item.phone || '',
        notes: item.notes || '',
        snoozeUntil: item.snoozeUntil || undefined,
      }));
    } catch (error) {
      console.error('Error loading client boletos from storage:', error);
      return [];
    }
  },

  save(items: ClientBoleto[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving client boletos to storage:', error);
    }
  },

  add(item: ClientBoleto): void {
    const items = this.getAll();
    items.push(item);
    this.save(items);
  },

  update(id: string, updates: Partial<ClientBoleto>): void {
    const items = this.getAll();
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.save(items);
    }
  },

  remove(id: string): void {
    const items = this.getAll();
    const filtered = items.filter(i => i.id !== id);
    this.save(filtered);
  },
};
