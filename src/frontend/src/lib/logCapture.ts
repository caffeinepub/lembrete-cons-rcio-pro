// Client-side log capture utility for diagnostics
// Collects console errors, warnings, and uncaught exceptions into an in-memory buffer

export interface LogEntry {
  timestamp: number;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  source?: string;
}

class LogCapture {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;

  constructor() {
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
  }

  initialize() {
    // Capture console.error
    console.error = (...args: any[]) => {
      this.addLog('error', args.join(' '));
      this.originalConsoleError.apply(console, args);
    };

    // Capture console.warn
    console.warn = (...args: any[]) => {
      this.addLog('warn', args.join(' '));
      this.originalConsoleWarn.apply(console, args);
    };

    // Capture uncaught errors
    window.addEventListener('error', (event) => {
      this.addLog('error', event.message, event.error?.stack, event.filename);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.addLog('error', `Unhandled Promise Rejection: ${event.reason}`, undefined, 'Promise');
    });
  }

  private addLog(level: LogEntry['level'], message: string, stack?: string, source?: string) {
    this.logs.push({
      timestamp: Date.now(),
      level,
      message,
      stack,
      source,
    });

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }

  destroy() {
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
  }
}

export const logCapture = new LogCapture();
