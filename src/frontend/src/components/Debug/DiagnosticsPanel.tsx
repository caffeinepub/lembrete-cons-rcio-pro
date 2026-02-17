// Diagnostics panel for displaying captured logs and errors
// Provides a UI to view build/runtime errors with copy-to-clipboard functionality

import { useState, useEffect } from 'react';
import { X, Copy, Trash2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { logCapture, type LogEntry } from '@/lib/logCapture';

interface DiagnosticsPanelProps {
  onClose: () => void;
}

export function DiagnosticsPanel({ onClose }: DiagnosticsPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Initial load
    setLogs(logCapture.getLogs());

    // Refresh logs every second
    const interval = setInterval(() => {
      setLogs(logCapture.getLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCopyAll = () => {
    const logsText = logs
      .map((log) => {
        const date = new Date(log.timestamp).toISOString();
        let text = `[${date}] [${log.level.toUpperCase()}] ${log.message}`;
        if (log.source) text += ` (${log.source})`;
        if (log.stack) text += `\n${log.stack}`;
        return text;
      })
      .join('\n\n');
    navigator.clipboard.writeText(logsText);
  };

  const handleClear = () => {
    logCapture.clear();
    setLogs([]);
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    const variants: Record<LogEntry['level'], 'destructive' | 'default' | 'secondary'> = {
      error: 'destructive',
      warn: 'default',
      info: 'secondary',
    };
    return (
      <Badge variant={variants[level]} className="text-xs">
        {level.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Painel de Diagnósticos</h2>
            <p className="text-sm text-muted-foreground">
              {logs.length} {logs.length === 1 ? 'registro' : 'registros'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCopyAll} variant="outline" size="sm" disabled={logs.length === 0}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar Tudo
            </Button>
            <Button onClick={handleClear} variant="outline" size="sm" disabled={logs.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="container mx-auto px-4 py-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro capturado ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div key={index} className="bg-card border rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    {getLevelIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getLevelBadge(log.level)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                        {log.source && (
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-mono break-words">{log.message}</p>
                      {log.stack && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            Rastreamento de pilha
                          </summary>
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
