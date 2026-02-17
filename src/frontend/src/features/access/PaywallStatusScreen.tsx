import { PaywallScreen } from '@/features/paywall/PaywallScreen';
import { useGetAllMyPaymentProofs } from '@/hooks/useQueries';
import { PaymentProofStatus } from '@/backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export function PaywallStatusScreen() {
  const { data: proofs, isLoading } = useGetAllMyPaymentProofs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const latestProof = proofs && proofs.length > 0 
    ? proofs.sort((a, b) => Number(b.id - a.id))[0]
    : null;

  // If no proof or rejected, show the paywall screen
  if (!latestProof || latestProof.status === PaymentProofStatus.rejected) {
    return <PaywallScreen />;
  }

  // If pending, show status
  if (latestProof.status === PaymentProofStatus.pending) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Payment Under Review
            </CardTitle>
            <CardDescription>
              Your payment proof is being reviewed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Thank you for submitting your payment proof. Our team is reviewing it and will activate your account once the payment is confirmed. This usually takes a few hours.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If approved but still gated (shouldn't happen often), show approved status
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Payment Approved
          </CardTitle>
          <CardDescription>
            Your account is being activated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Your payment has been confirmed. Your account will be activated shortly. Please refresh the page or wait a moment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
