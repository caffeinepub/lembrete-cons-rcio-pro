import { useState } from 'react';
import { Trash2, Edit, MessageCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientBoletoForm } from './ClientBoletoForm';
import type { ClientBoleto } from '../model/clientBoleto';
import { BOLETO_STATUS_LABELS, BOLETO_STATUS_COLORS } from '../model/clientBoleto';
import { formatCurrency } from '../utils/monthMetrics';
import { openWhatsApp } from '../utils/whatsapp';
import { useClientBoletosContext } from '../context/ClientBoletosContext';

interface ClientBoletoDetailsProps {
  boleto: ClientBoleto;
  onClose: () => void;
}

export function ClientBoletoDetails({ boleto, onClose }: ClientBoletoDetailsProps) {
  const { updateClientBoleto, deleteClientBoleto, markAsSent } = useClientBoletosContext();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (data: Omit<ClientBoleto, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateClientBoleto(boleto.id, data);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteClientBoleto(boleto.id);
    setShowDeleteDialog(false);
    onClose();
  };

  const handleMarkAsSent = () => {
    markAsSent(boleto.id);
  };

  const handleWhatsApp = () => {
    if (boleto.phone) {
      openWhatsApp(boleto.phone);
    }
  };

  const formatDate = (isoString: string) => {
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

  const formatDateTime = (isoString: string) => {
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
    <>
      <div className="flex flex-col h-full">
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{boleto.name}</h2>
              <Badge className={BOLETO_STATUS_COLORS[boleto.status]}>
                {BOLETO_STATUS_LABELS[boleto.status]}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {boleto.phone && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                <p className="font-medium">{boleto.phone}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">Data de Vencimento</p>
              <p className="font-medium">{formatDate(boleto.dueDate)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Valor</p>
              <p className="font-medium text-lg text-[#E60012]">{formatCurrency(boleto.value)}</p>
            </div>

            {boleto.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Observações</p>
                <p className="text-sm whitespace-pre-wrap">{boleto.notes}</p>
              </div>
            )}

            <Separator />

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Criado em: {formatDateTime(boleto.createdAt)}</p>
              <p>Atualizado em: {formatDateTime(boleto.updatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t space-y-2">
          {boleto.status === 'pending' && (
            <Button
              onClick={handleMarkAsSent}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar como Enviado
            </Button>
          )}

          {boleto.phone && (
            <Button
              onClick={handleWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700"
              variant={boleto.status === 'pending' ? 'outline' : 'default'}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Abrir WhatsApp
            </Button>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="flex-1"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="outline"
              className="flex-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <ClientBoletoForm
            initialData={boleto}
            onSave={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
