// List component with search, filters, and quick actions for leads
import { useState, useMemo } from 'react';
import { Search, Plus, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Lead } from '../model/lead';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '../model/lead';
import { filterLeadsByBucket, sortLeadsByFollowUp, searchLeads, BUCKET_LABELS, type FollowUpBucket } from '../utils/followUpBuckets';
import { openWhatsApp } from '../utils/whatsapp';

interface LeadsListProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onCreateLead: () => void;
}

export function LeadsList({ leads, onSelectLead, onCreateLead }: LeadsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBucket, setSelectedBucket] = useState<FollowUpBucket | 'all'>('all');

  const filteredLeads = useMemo(() => {
    let result = leads;
    result = filterLeadsByBucket(result, selectedBucket);
    result = searchLeads(result, searchQuery);
    result = sortLeadsByFollowUp(result);
    return result;
  }, [leads, selectedBucket, searchQuery]);

  const bucketCounts = useMemo(() => {
    return {
      all: leads.length,
      overdue: filterLeadsByBucket(leads, 'overdue').length,
      today: filterLeadsByBucket(leads, 'today').length,
      upcoming: filterLeadsByBucket(leads, 'upcoming').length,
      none: filterLeadsByBucket(leads, 'none').length,
    };
  }, [leads]);

  const formatFollowUpTime = (isoString?: string) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 0) {
      const absMins = Math.abs(diffMins);
      if (absMins < 60) return `${absMins}min atrás`;
      const hours = Math.floor(absMins / 60);
      if (hours < 24) return `${hours}h atrás`;
      const days = Math.floor(hours / 24);
      return `${days}d atrás`;
    }
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4 border-b">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={onCreateLead}>
            <Plus className="h-4 w-4 mr-2" />
            Novo
          </Button>
        </div>

        <Tabs value={selectedBucket} onValueChange={(v) => setSelectedBucket(v as FollowUpBucket | 'all')}>
          <TabsList className="w-full grid grid-cols-5">
            {(['all', 'overdue', 'today', 'upcoming', 'none'] as const).map((bucket) => (
              <TabsTrigger key={bucket} value={bucket} className="text-xs">
                {BUCKET_LABELS[bucket]}
                {bucketCounts[bucket] > 0 && (
                  <span className="ml-1 text-[10px] opacity-70">({bucketCounts[bucket]})</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum lead encontrado</p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-card border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onSelectLead(lead)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{lead.name}</h3>
                    {lead.phone && (
                      <p className="text-sm text-muted-foreground">{lead.phone}</p>
                    )}
                  </div>
                  {lead.phone && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openWhatsApp(lead.phone);
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={LEAD_STATUS_COLORS[lead.status]} variant="secondary">
                    {LEAD_STATUS_LABELS[lead.status]}
                  </Badge>
                  {lead.nextFollowUp && (
                    <span className="text-xs text-muted-foreground">
                      📅 {formatFollowUpTime(lead.nextFollowUp)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
