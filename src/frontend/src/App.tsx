import { useState, useEffect } from 'react';
import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiagnosticsPanel } from '@/components/Debug/DiagnosticsPanel';
import { LeadsModule } from '@/features/leads/components/LeadsModule';
import { LeadReminderOverlay } from '@/features/leads/components/LeadReminderOverlay';
import { useLeads } from '@/features/leads/hooks/useLeads';
import { useLeadReminders } from '@/features/leads/reminders/useLeadReminders';
import { useBackendStatus } from '@/hooks/useQueries';

export default function App() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { data: backendStatus } = useBackendStatus();
  const { leads, snoozeFollowUp, completeFollowUp } = useLeads();
  const { activeReminder, dismissReminder } = useLeadReminders(leads);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      setShowDiagnostics(true);
    }
  }, []);

  const handleSnoozeReminder = (minutes: number) => {
    if (activeReminder) {
      snoozeFollowUp(activeReminder.id, minutes);
      dismissReminder();
    }
  };

  const handleCompleteReminder = () => {
    if (activeReminder) {
      completeFollowUp(activeReminder.id);
      dismissReminder();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-[#E60012] text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Lembrete Consórcio Pro</h1>
            <p className="text-sm opacity-90">Sistema de Lembretes e CRM para Consórcio Honda</p>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b bg-background">
              <div className="container mx-auto px-4">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="dashboard">Painel</TabsTrigger>
                  <TabsTrigger value="leads">Leads CRM</TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="dashboard" className="flex-1 m-0">
              <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-2">Bem-vindo ao Lembrete Consórcio Pro</h2>
                    <p className="text-muted-foreground mb-4">
                      Seu sistema completo de lembretes e CRM para gerenciar clientes de consórcio.
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          backendStatus?.connected ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      />
                      <span className="text-muted-foreground">
                        Backend: {backendStatus?.connected ? 'Conectado' : 'Conectando...'}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-card border rounded-lg p-5">
                      <h3 className="font-semibold mb-2">📅 Gerenciamento de Vencimentos</h3>
                      <p className="text-sm text-muted-foreground">
                        Acompanhe datas de vencimento de boletos organizadas por hoje, amanhã, próximos e vencidos.
                      </p>
                    </div>
                    <div className="bg-card border rounded-lg p-5">
                      <h3 className="font-semibold mb-2">💬 Integração com WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">
                        Acesso rápido para contatar clientes diretamente via WhatsApp com um toque.
                      </p>
                    </div>
                    <div className="bg-card border rounded-lg p-5">
                      <h3 className="font-semibold mb-2">🔔 Lembretes Inteligentes</h3>
                      <p className="text-sm text-muted-foreground">
                        Alertas em tela cheia com alarmes sonoros nas datas de vencimento com opções de soneca.
                      </p>
                    </div>
                    <div className="bg-card border rounded-lg p-5">
                      <h3 className="font-semibold mb-2">👥 CRM de Leads</h3>
                      <p className="text-sm text-muted-foreground">
                        Gerencie seus leads com follow-ups automáticos, status e histórico completo.
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 border border-dashed rounded-lg p-6 text-center">
                    <p className="text-muted-foreground">
                      Use a aba "Leads CRM" para começar a gerenciar seus contatos e follow-ups.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leads" className="flex-1 m-0">
              <LeadsModule />
            </TabsContent>
          </Tabs>
        </main>

        <footer className="bg-card border-t mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Lembrete Consórcio Pro. Feito com amor usando{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.hostname : 'unknown-app'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E60012] hover:underline font-medium"
                >
                  caffeine.ai
                </a>
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDiagnostics(true)}
                className="text-muted-foreground"
              >
                <Bug className="mr-2 h-4 w-4" />
                Diagnósticos
              </Button>
            </div>
          </div>
        </footer>
      </div>

      {showDiagnostics && <DiagnosticsPanel onClose={() => setShowDiagnostics(false)} />}
      
      {activeReminder && (
        <LeadReminderOverlay
          lead={activeReminder}
          onSnooze={handleSnoozeReminder}
          onComplete={handleCompleteReminder}
        />
      )}
    </>
  );
}
