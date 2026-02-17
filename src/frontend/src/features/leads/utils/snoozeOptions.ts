// Snooze/reschedule options for follow-up reminders
export interface SnoozeOption {
  label: string;
  minutes: number;
}

export const SNOOZE_OPTIONS: SnoozeOption[] = [
  { label: '15 minutos', minutes: 15 },
  { label: '30 minutos', minutes: 30 },
  { label: '1 hora', minutes: 60 },
  { label: '2 horas', minutes: 120 },
  { label: '4 horas', minutes: 240 },
  { label: '1 dia', minutes: 1440 },
];

export function calculateNextFollowUp(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}
