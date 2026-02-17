import { useState, useEffect, useRef } from 'react';
import type { Lead } from '../model/lead';

export function useLeadReminders(leads: Lead[]) {
  const [activeReminder, setActiveReminder] = useState<Lead | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const checkReminders = () => {
      // Don't check if there's already an active reminder
      if (activeReminder) return;

      const now = new Date();
      
      // Find the first overdue or due lead
      const dueLeads = leads
        .filter(lead => {
          if (!lead.nextFollowUp) return false;
          try {
            const followUpDate = new Date(lead.nextFollowUp);
            return followUpDate <= now;
          } catch {
            return false;
          }
        })
        .sort((a, b) => {
          const dateA = new Date(a.nextFollowUp!).getTime();
          const dateB = new Date(b.nextFollowUp!).getTime();
          return dateA - dateB;
        });

      if (dueLeads.length > 0) {
        setActiveReminder(dueLeads[0]);
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
  }, [leads]); // Only depend on leads, not activeReminder

  const dismissReminder = () => {
    setActiveReminder(null);
  };

  return {
    activeReminder,
    dismissReminder,
  };
}
