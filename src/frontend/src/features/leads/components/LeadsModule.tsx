import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LeadsList } from './LeadsList';
import { LeadDetails } from './LeadDetails';
import { LeadForm } from './LeadForm';
import { useLeadsContext } from '../context/LeadsContext';
import type { Lead } from '../model/lead';

export function LeadsModule() {
  const { leads, createLead, updateLead, deleteLead } = useLeadsContext();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateLead = (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    createLead(data);
    setIsCreating(false);
  };

  const handleSelectLead = (lead: Lead) => {
    // Always get fresh lead data from context
    const freshLead = leads.find(l => l.id === lead.id);
    setSelectedLead(freshLead || lead);
  };

  return (
    <>
      <LeadsList
        leads={leads}
        onSelectLead={handleSelectLead}
        onCreateLead={() => setIsCreating(true)}
      />

      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          {selectedLead && (
            <LeadDetails
              lead={selectedLead}
              onUpdate={updateLead}
              onDelete={deleteLead}
              onClose={() => setSelectedLead(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            onSave={handleCreateLead}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
