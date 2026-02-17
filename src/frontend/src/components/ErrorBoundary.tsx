// React Error Boundary component
// Captures runtime exceptions and displays detailed error information with stack traces

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleCopyError = () => {
    const { error, errorInfo } = this.state;
    const errorText = `Erro: ${error?.message}\n\nPilha: ${error?.stack}\n\nPilha de Componentes: ${errorInfo?.componentStack}`;
    navigator.clipboard.writeText(errorText);
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">Erro na Aplicação</AlertTitle>
              <AlertDescription>
                A aplicação encontrou um erro inesperado. Por favor, tente recarregar a página.
              </AlertDescription>
            </Alert>

            <div className="bg-card border rounded-lg p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Mensagem de Erro</h3>
                <p className="text-sm font-mono bg-muted p-3 rounded">
                  {this.state.error?.message || 'Erro desconhecido'}
                </p>
              </div>

              {this.state.error?.stack && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Rastreamento de Pilha</h3>
                  <ScrollArea className="h-48 w-full rounded border bg-muted">
                    <pre className="text-xs p-3 font-mono">{this.state.error.stack}</pre>
                  </ScrollArea>
                </div>
              )}

              {this.state.errorInfo?.componentStack && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Pilha de Componentes</h3>
                  <ScrollArea className="h-32 w-full rounded border bg-muted">
                    <pre className="text-xs p-3 font-mono">{this.state.errorInfo.componentStack}</pre>
                  </ScrollArea>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReload} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recarregar Página
                </Button>
                <Button onClick={this.handleCopyError} variant="outline">
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar Erro
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
