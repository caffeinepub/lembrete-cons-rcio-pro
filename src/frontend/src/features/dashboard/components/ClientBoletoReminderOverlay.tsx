import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { ClientBoleto } from '../model/clientBoleto';
import { BOLETO_STATUS_LABELS, BOLETO_STATUS_COLORS } from '../model/clientBoleto';
import { formatCurrency } from '../utils/monthMetrics';
import { playAlarm, stopAlarm } from '../utils/alarmAudio';

interface ClientBoletoReminderOverlayProps {
  boleto: ClientBoleto;
  onSnooze: (minutes: number) => void;
  onMarkAsSent: () => void;
}

const SNOOZE_OPTIONS = [
  { label: '2 horas', minutes: 120 },
  { label: '4 horas', minutes: 240 },
  { label: '1 dia', minutes: 1440 },
];

export function ClientBoletoReminderOverlay({ boleto, onSnooze, onMarkAsSent }: ClientBoletoReminderOverlayProps) {
  const [selectedSnooze, setSelectedSnooze] = useState<string>('');

  useEffect(() => {
    // Play alarm when overlay mounts
    playAlarm();
    
    // Stop alarm when overlay unmounts
    return () => {
      stopAlarm();
    };
  }, []);

  const handleSnooze = () => {
    if (!selectedSnooze) return;
    const minutes = parseInt(selectedSnooze, 10);
    if (isNaN(minutes) || minutes <= 0) return;
    stopAlarm();
    onSnooze(minutes);
  };

  const handleMarkAsSent = () => {
    stopAlarm();
    onMarkAsSent();
  };

  const formatDueDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
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
            <h2 className="text-2xl font-bold mb-2">Lembrete de Vencimento</h2>
            <p className="text-muted-foreground">Boleto vencendo ou vencido!</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{boleto.name}</h3>
            {boleto.phone && (
              <p className="text-sm text-muted-foreground mb-2">
                📱 {boleto.phone}
              </p>
            )}
            <div className="flex items-center gap-2 mb-2">
              <Badge className={BOLETO_STATUS_COLORS[boleto.status]}>
                {BOLETO_STATUS_LABELS[boleto.status]}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vencimento:</span>
              <span className="font-medium">{formatDueDate(boleto.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-medium text-[#E60012]">{formatCurrency(boleto.value)}</span>
            </div>
            {boleto.notes && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground text-xs mb-1">Observações:</p>
                <p className="text-sm">{boleto.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleMarkAsSent}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Marcar como Enviado
          </Button>

          <div className="flex gap-2">
            <Select value={selectedSnooze} onValueChange={setSelectedSnooze}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Adiar por..." />
              </SelectTrigger>
              <SelectContent>
                {SNOOZE_OPTIONS.map(option => (
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
              size="lg"
            >
              <Clock className="mr-2 h-4 w-4" />
              Adiar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
