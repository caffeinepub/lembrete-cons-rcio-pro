import { useState } from 'react';
import { Clock, CheckCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '../model/lead';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '../model/lead';
import { SNOOZE_OPTIONS } from '../utils/snoozeOptions';

interface LeadReminderOverlayProps {
  lead: Lead;
  onSnooze: (minutes: number) => void;
  onComplete: () => void;
}

export function LeadReminderOverlay({ lead, onSnooze, onComplete }: LeadReminderOverlayProps) {
  const [selectedSnooze, setSelectedSnooze] = useState<string>('');

  const handleSnooze = () => {
    if (!selectedSnooze) return;
    const minutes = parseInt(selectedSnooze, 10);
    if (isNaN(minutes) || minutes <= 0) return;
    onSnooze(minutes);
  };

  const formatFollowUpTime = (isoString?: string) => {
    if (!isoString) return 'Não definido';
    try {
      return new Date(isoString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-300">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-[#E60012] text-white rounded-full p-6 animate-pulse">
              <Bell className="h-12 w-12" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">Lembrete de Follow-up</h2>
            <p className="text-muted-foreground">É hora de entrar em contato!</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{lead.name}</h3>
            <Badge className={LEAD_STATUS_COLORS[lead.status]}>
              {LEAD_STATUS_LABELS[lead.status]}
            </Badge>
          </div>

          {lead.phone && (
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{lead.phone}</p>
            </div>
          )}

          {lead.nextFollowUp && (
            <div>
              <p className="text-sm text-muted-foreground">Agendado para</p>
              <p className="font-medium">{formatFollowUpTime(lead.nextFollowUp)}</p>
            </div>
          )}

          {lead.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Observações</p>
              <p className="text-sm whitespace-pre-wrap line-clamp-3">{lead.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={onComplete}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Concluir Follow-up
          </Button>

          <div className="space-y-2">
            <Select value={selectedSnooze} onValueChange={setSelectedSnooze}>
              <SelectTrigger>
                <SelectValue placeholder="Sonecar para..." />
              </SelectTrigger>
              <SelectContent>
                {SNOOZE_OPTIONS.map((option) => (
                  <SelectItem key={option.minutes} value={option.minutes.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleSnooze}
              disabled={!selectedSnooze}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Clock className="h-5 w-5 mr-2" />
              Sonecar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
