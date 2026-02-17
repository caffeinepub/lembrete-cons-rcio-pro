import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ClientBoleto, BoletoStatus } from '../model/clientBoleto';
import { BOLETO_STATUS_LABELS } from '../model/clientBoleto';

interface ClientBoletoFormProps {
  initialData?: ClientBoleto;
  onSave: (data: Omit<ClientBoleto, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ClientBoletoForm({ initialData, onSave, onCancel }: ClientBoletoFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ? initialData.dueDate.split('T')[0] : ''
  );
  const [value, setValue] = useState(initialData?.value?.toString() || '');
  const [status, setStatus] = useState<BoletoStatus>(initialData?.status || 'pending');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !dueDate || !value) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    onSave({
      name: name.trim(),
      phone: phone.trim(),
      dueDate: new Date(dueDate).toISOString(),
      value: numericValue,
      status,
      notes: notes.trim(),
      snoozeUntil: initialData?.snoozeUntil,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Cliente *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(11) 99999-9999"
          type="tel"
        />
      </div>

      <div>
        <Label htmlFor="dueDate">Data de Vencimento *</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="value">Valor (R$) *</Label>
        <Input
          id="value"
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as BoletoStatus)}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">{BOLETO_STATUS_LABELS.pending}</SelectItem>
            <SelectItem value="sent">{BOLETO_STATUS_LABELS.sent}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionais..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Salvar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
