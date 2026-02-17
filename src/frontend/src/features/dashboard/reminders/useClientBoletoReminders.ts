import { useState, useEffect, useRef } from 'react';
import type { ClientBoleto } from '../model/clientBoleto';

export function useClientBoletoReminders(clientBoletos: ClientBoleto[]) {
  const [activeReminder, setActiveReminder] = useState<ClientBoleto | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const checkReminders = () => {
      // Don't check if there's already an active reminder
      if (activeReminder) return;

      const now = new Date();
      
      // Find the first due boleto that is pending and not snoozed
      const dueBoletos = clientBoletos
        .filter(boleto => {
          // Only pending boletos trigger reminders
          if (boleto.status !== 'pending') return false;
          
          // Check if snoozed
          if (boleto.snoozeUntil) {
            try {
              const snoozeDate = new Date(boleto.snoozeUntil);
              if (snoozeDate > now) return false; // Still snoozed
            } catch {
              // Invalid snooze date, ignore it
            }
          }
          
          // Check if due
          try {
            const dueDate = new Date(boleto.dueDate);
            const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return dueDateOnly <= today;
          } catch {
            return false;
          }
        })
        .sort((a, b) => {
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          return dateA - dateB;
        });

      if (dueBoletos.length > 0) {
        setActiveReminder(dueBoletos[0]);
      }
    };

    // Initial check
    checkReminders();

    // Set up interval that doesn't depend on activeReminder state
    intervalRef.current = window.setInterval(checkReminders, 30000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [clientBoletos]); // Only depend on clientBoletos, not activeReminder

  const dismissReminder = () => {
    setActiveReminder(null);
  };

  return {
    activeReminder,
    dismissReminder,
  };
}
