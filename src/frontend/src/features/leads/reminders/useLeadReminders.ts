// Hook to monitor and trigger follow-up reminders when app is open
import { useState, useEffect } from 'react';
import type { Lead } from '../model/lead';

export function useLeadReminders(leads: Lead[]) {
  const [activeReminder, setActiveReminder] = useState<Lead | null>(null);

  useEffect(() => {
    // Check every 30 seconds for due reminders
    const checkReminders = () => {
      const now = new Date();
      
      // Find the first overdue or due lead
      const dueLeads = leads
        .filter(lead => {
          if (!lead.nextFollowUp) return false;
          const followUpDate = new Date(lead.nextFollowUp);
          return followUpDate <= now;
        })
        .sort((a, b) => {
          const dateA = new Date(a.nextFollowUp!).getTime();
          const dateB = new Date(b.nextFollowUp!).getTime();
          return dateA - dateB;
        });

      if (dueLeads.length > 0 && !activeReminder) {
        setActiveReminder(dueLeads[0]);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [leads, activeReminder]);

  const dismissReminder = () => {
    setActiveReminder(null);
  };

  return {
    activeReminder,
    dismissReminder,
  };
}
