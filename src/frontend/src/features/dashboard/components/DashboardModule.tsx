import { useState } from 'react';
import { Plus, Filter, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useClientBoletosContext } from '../context/ClientBoletosContext';
import { ClientBoletoForm } from './ClientBoletoForm';
import { ClientBoletoDetails } from './ClientBoletoDetails';
import { bucketBoletos, BUCKET_LABELS, type FilterMode, type DueBucket } from '../utils/dueBuckets';
import { calculateMetrics, formatCurrency } from '../utils/monthMetrics';
import { openWhatsApp } from '../utils/whatsapp';
import type { ClientBoleto } from '../model/clientBoleto';
import { BOLETO_STATUS_COLORS } from '../model/clientBoleto';

export function DashboardModule() {
  const { clientBoletos, createClientBoleto, markAsSent } = useClientBoletosContext();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedBoleto, setSelectedBoleto] = useState<ClientBoleto | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const metrics = calculateMetrics(clientBoletos);
  const bucketed = bucketBoletos(clientBoletos, filterMode);

  const handleCreateBoleto = (data: Omit<ClientBoleto, 'id' | 'createdAt' | 'updatedAt'>) => {
    createClientBoleto(data);
    setIsCreating(false);
  };

  const handleSelectBoleto = (boleto: ClientBoleto) => {
    // Always get fresh data from context
    const fresh = clientBoletos.find(b => b.id === boleto.id);
    setSelectedBoleto(fresh || boleto);
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      });
    } catch {
      return 'Data inválida';
    }
  };

  const renderBoletoItem = (boleto: ClientBoleto) => (
    <div
      key={boleto.id}
      className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleSelectBoleto(boleto)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold">{boleto.name}</h4>
          <p className="text-sm text-muted-foreground">{formatDate(boleto.dueDate)}</p>
        </div>
        <Badge className={BOLETO_STATUS_COLORS[boleto.status]} variant="secondary">
          {formatCurrency(boleto.value)}
        </Badge>
      </div>
      
      <div className="flex gap-2 mt-3">
        {boleto.phone && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              openWhatsApp(boleto.phone);
            }}
            className="flex-1"
          >
            WhatsApp
          </Button>
        )}
        {boleto.status === 'pending' && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              markAsSent(boleto.id);
            }}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Marcar Enviado
          </Button>
        )}
      </div>
    </div>
  );

  const renderBucket = (bucket: DueBucket) => {
    const items = bucketed[bucket];
    if (items.length === 0) return null;

    return (
      <div key={bucket} className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {BUCKET_LABELS[bucket]}
          <Badge variant="secondary">{items.length}</Badge>
        </h3>
        <div className="space-y-2">
          {items.map(renderBoletoItem)}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vence Hoje</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.dueToday}</div>
              <p className="text-xs text-muted-foreground">boletos pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{metrics.overdue}</div>
              <p className="text-xs text-muted-foreground">boletos atrasados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#E60012]">
                {formatCurrency(metrics.totalValueThisMonth)}
              </div>
              <p className="text-xs text-muted-foreground">a receber este mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="sent">Enviados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Boletos List */}
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-6">
            {renderBucket('overdue')}
            {renderBucket('today')}
            {renderBucket('tomorrow')}
            {renderBucket('nextDays')}

            {clientBoletos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhum cliente cadastrado ainda.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Cliente
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Details Sheet */}
      <Sheet open={!!selectedBoleto} onOpenChange={(open) => !open && setSelectedBoleto(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          {selectedBoleto && (
            <ClientBoletoDetails
              boleto={selectedBoleto}
              onClose={() => setSelectedBoleto(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Create Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <ClientBoletoForm
            onSave={handleCreateBoleto}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
