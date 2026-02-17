// Lead details and edit component with status management and WhatsApp integration
import { useState } from 'react';
import { MessageCircle, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Lead } from '../model/lead';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '../model/lead';
import { LeadForm } from './LeadForm';
import { openWhatsApp } from '../utils/whatsapp';

interface LeadDetailsProps {
  lead: Lead;
  onUpdate: (id: string, updates: Partial<Lead>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function LeadDetails({ lead, onUpdate, onDelete, onClose }: LeadDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSave = (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    onUpdate(lead.id, data);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(lead.id);
    onClose();
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Não definido';
    return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isEditing) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Editar Lead</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <LeadForm
            lead={lead}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Detalhes do Lead</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">{lead.name}</h3>
          <Badge className={LEAD_STATUS_COLORS[lead.status]}>
            {LEAD_STATUS_LABELS[lead.status]}
          </Badge>
        </div>

        <Separator />

        {lead.phone && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Telefone</p>
            <div className="flex items-center gap-2">
              <p className="font-medium">{lead.phone}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openWhatsApp(lead.phone)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
            </div>
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground mb-1">Próximo Follow-up</p>
          <p className="font-medium">{formatDateTime(lead.nextFollowUp)}</p>
        </div>

        {lead.notes && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Observações</p>
            <p className="whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        <Separator />

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Criado em: {formatDateTime(lead.createdAt)}</p>
          <p>Atualizado em: {formatDateTime(lead.updatedAt)}</p>
        </div>
      </div>

      <div className="p-4 border-t flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o lead "{lead.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
