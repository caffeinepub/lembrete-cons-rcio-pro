// Utilities for classifying and sorting leads by follow-up timing
import type { Lead } from '../model/lead';

export type FollowUpBucket = 'overdue' | 'today' | 'upcoming' | 'none';

export function getFollowUpBucket(lead: Lead): FollowUpBucket {
  if (!lead.nextFollowUp) return 'none';

  const now = new Date();
  const followUpDate = new Date(lead.nextFollowUp);
  
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  if (followUpDate < now) return 'overdue';
  if (followUpDate >= todayStart && followUpDate < todayEnd) return 'today';
  return 'upcoming';
}

export function filterLeadsByBucket(leads: Lead[], bucket: FollowUpBucket | 'all'): Lead[] {
  if (bucket === 'all') return leads;
  return leads.filter(lead => getFollowUpBucket(lead) === bucket);
}

export function sortLeadsByFollowUp(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    // Leads without follow-up go to the end
    if (!a.nextFollowUp && !b.nextFollowUp) return a.name.localeCompare(b.name);
    if (!a.nextFollowUp) return 1;
    if (!b.nextFollowUp) return -1;
    
    // Sort by follow-up date
    const dateA = new Date(a.nextFollowUp).getTime();
    const dateB = new Date(b.nextFollowUp).getTime();
    return dateA - dateB;
  });
}

export function searchLeads(leads: Lead[], query: string): Lead[] {
  if (!query.trim()) return leads;
  
  const lowerQuery = query.toLowerCase();
  return leads.filter(lead => 
    lead.name.toLowerCase().includes(lowerQuery) ||
    lead.phone.includes(query)
  );
}

export const BUCKET_LABELS: Record<FollowUpBucket | 'all', string> = {
  all: 'Todos',
  overdue: 'Atrasados',
  today: 'Hoje',
  upcoming: 'Próximos',
  none: 'Sem Follow-up',
};
