import { useState, useEffect } from 'react';
import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiagnosticsPanel } from '@/components/Debug/DiagnosticsPanel';
import { LeadsModule } from '@/features/leads/components/LeadsModule';
import { LeadReminderOverlay } from '@/features/leads/components/LeadReminderOverlay';
import { LeadsProvider, useLeadsContext } from '@/features/leads/context/LeadsContext';
import { useLeadReminders } from '@/features/leads/reminders/useLeadReminders';
import { DashboardModule } from '@/features/dashboard/components/DashboardModule';
import { ClientBoletoReminderOverlay } from '@/features/dashboard/components/ClientBoletoReminderOverlay';
import { ClientBoletosProvider, useClientBoletosContext } from '@/features/dashboard/context/ClientBoletosContext';
import { useClientBoletoReminders } from '@/features/dashboard/reminders/useClientBoletoReminders';
import { SettingsModule } from '@/features/settings/SettingsModule';
import { AccessGate } from '@/features/access/AccessGate';
import { branding } from '@/config/branding';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

function AppContent() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  
  // Leads context and reminders
  const { leads, snoozeFollowUp, completeFollowUp } = useLeadsContext();
  const { activeReminder: activeLeadReminder, dismissReminder: dismissLeadReminder } = useLeadReminders(leads);
  
  // Client Boletos context and reminders
  const { clientBoletos, snoozeBoleto, markAsSent } = useClientBoletosContext();
  const { activeReminder: activeBoletoReminder, dismissReminder: dismissBoletoReminder } = useClientBoletoReminders(clientBoletos);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      setShowDiagnostics(true);
    }
  }, []);

  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const handleSnoozeLeadReminder = (minutes: number) => {
    if (activeLeadReminder) {
      snoozeFollowUp(activeLeadReminder.id, minutes);
      dismissLeadReminder();
    }
  };

  const handleCompleteLeadReminder = () => {
    if (activeLeadReminder) {
      completeFollowUp(activeLeadReminder.id);
      dismissLeadReminder();
    }
  };

  const handleSnoozeBoletoReminder = (minutes: number) => {
    if (activeBoletoReminder) {
      snoozeBoleto(activeBoletoReminder.id, minutes);
      dismissBoletoReminder();
    }
  };

  const handleMarkBoletoAsSent = () => {
    if (activeBoletoReminder) {
      markAsSent(activeBoletoReminder.id);
      dismissBoletoReminder();
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-[#E60012] text-white shadow-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{branding.appName}</h1>
              <p className="text-sm opacity-90">{branding.headerSubtitle}</p>
            </div>
            {identity && (
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b bg-background">
              <div className="container mx-auto px-4">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="dashboard">Painel</TabsTrigger>
                  <TabsTrigger value="leads">Leads CRM</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="dashboard" className="flex-1 m-0">
              <DashboardModule />
            </TabsContent>

            <TabsContent value="leads" className="flex-1 m-0">
              <LeadsModule />
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-0">
              <SettingsModule />
            </TabsContent>
          </Tabs>
        </main>

        <footer className="bg-card border-t mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {branding.appName}. Built with love using{' '}
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
      
      {activeLeadReminder && (
        <LeadReminderOverlay
          lead={activeLeadReminder}
          onSnooze={handleSnoozeLeadReminder}
          onComplete={handleCompleteLeadReminder}
        />
      )}

      {activeBoletoReminder && (
        <ClientBoletoReminderOverlay
          boleto={activeBoletoReminder}
          onSnooze={handleSnoozeBoletoReminder}
          onMarkAsSent={handleMarkBoletoAsSent}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AccessGate>
      <LeadsProvider>
        <ClientBoletosProvider>
          <AppContent />
        </ClientBoletosProvider>
      </LeadsProvider>
    </AccessGate>
  );
}
