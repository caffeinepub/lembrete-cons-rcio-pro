// Form component for creating and editing leads with validation
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Lead, LeadStatus } from '../model/lead';
import { LEAD_STATUS_LABELS } from '../model/lead';

interface LeadFormProps {
  lead?: Lead;
  onSave: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function LeadForm({ lead, onSave, onCancel }: LeadFormProps) {
  const [name, setName] = useState(lead?.name || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [notes, setNotes] = useState(lead?.notes || '');
  const [status, setStatus] = useState<LeadStatus>(lead?.status || 'novo');
  const [nextFollowUp, setNextFollowUp] = useState(
    lead?.nextFollowUp ? lead.nextFollowUp.slice(0, 16) : ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!status) {
      newErrors.status = 'Status é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    onSave({
      name: name.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      status,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp).toISOString() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do lead"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(11) 99999-9999"
          type="tel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as LeadStatus)}>
          <SelectTrigger id="status" className={errors.status ? 'border-destructive' : ''}>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nextFollowUp">Próximo Follow-up</Label>
        <Input
          id="nextFollowUp"
          type="datetime-local"
          value={nextFollowUp}
          onChange={(e) => setNextFollowUp(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anotações sobre o lead..."
          rows={4}
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {lead ? 'Salvar' : 'Criar Lead'}
        </Button>
      </div>
    </form>
  );
}
