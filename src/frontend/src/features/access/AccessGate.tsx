import { ReactNode } from 'react';
import { useAccountGateState } from './hooks/useAccountGateState';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { ProfileSetupForm } from '@/features/auth/ProfileSetupForm';
import { PaywallStatusScreen } from './PaywallStatusScreen';
import { AccessErrorState } from './components/AccessErrorState';
import { useQueryClient } from '@tanstack/react-query';

interface AccessGateProps {
  children: ReactNode;
}

export function AccessGate({ children }: AccessGateProps) {
  const gateState = useAccountGateState();
  const queryClient = useQueryClient();

  if (gateState.status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (gateState.status === 'not-authenticated') {
    return <AuthScreen />;
  }

  if (gateState.status === 'no-profile') {
    return (
      <ProfileSetupForm
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        }}
      />
    );
  }

  if (gateState.status === 'disabled') {
    return (
      <AccessErrorState
        type="disabled"
        message="Your account has been disabled. Please contact the administrator for assistance."
      />
    );
  }

  if (gateState.status === 'pending-approval') {
    return (
      <AccessErrorState
        type="pending"
        message="Your account is pending approval. You will be notified once your account is activated."
      />
    );
  }

  if (gateState.status === 'pending-payment') {
    return <PaywallStatusScreen />;
  }

  if (gateState.status === 'allowed') {
    return <>{children}</>;
  }

  return null;
}
