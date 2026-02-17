import { AlertCircle, WifiOff, Ban, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ErrorType = 'network' | 'disabled' | 'unauthorized' | 'pending';

interface AccessErrorStateProps {
  type: ErrorType;
  message?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
}

export function AccessErrorState({ type, message, onRetry, onContactSupport }: AccessErrorStateProps) {
  const config = {
    network: {
      icon: WifiOff,
      title: 'Network Error',
      defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      variant: 'destructive' as const,
    },
    disabled: {
      icon: Ban,
      title: 'Account Disabled',
      defaultMessage: 'Your account has been disabled. Please contact support for assistance.',
      variant: 'destructive' as const,
    },
    unauthorized: {
      icon: AlertCircle,
      title: 'Unauthorized',
      defaultMessage: 'You do not have permission to access this resource.',
      variant: 'destructive' as const,
    },
    pending: {
      icon: Clock,
      title: 'Pending Review',
      defaultMessage: 'Your request is pending review. You will be notified once it is processed.',
      variant: 'default' as const,
    },
  };

  const { icon: Icon, title, defaultMessage, variant } = config[type];

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Alert variant={variant} className="max-w-md">
        <Icon className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message || defaultMessage}
        </AlertDescription>
        {(onRetry || onContactSupport) && (
          <div className="mt-4 flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} size="sm">
                Try Again
              </Button>
            )}
            {onContactSupport && (
              <Button onClick={onContactSupport} variant="outline" size="sm">
                Contact Support
              </Button>
            )}
          </div>
        )}
      </Alert>
    </div>
  );
}
