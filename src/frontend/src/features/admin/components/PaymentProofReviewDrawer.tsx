import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Loader2, ExternalLink } from 'lucide-react';
import { useAdminPaymentProofs } from '../hooks/useAdminData';
import type { PaymentProof } from '@/backend';
import { PaymentProofStatus } from '@/backend';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentProofReviewDrawerProps {
  proof: PaymentProof | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentProofReviewDrawer({
  proof,
  open,
  onOpenChange,
}: PaymentProofReviewDrawerProps) {
  const { updateProofStatus, isUpdating } = useAdminPaymentProofs();
  const [actionError, setActionError] = useState<string | null>(null);

  if (!proof) return null;

  const handleApprove = async () => {
    try {
      setActionError(null);
      await updateProofStatus(proof.id, PaymentProofStatus.approved);
      onOpenChange(false);
    } catch (error) {
      setActionError('Failed to approve payment proof');
      console.error(error);
    }
  };

  const handleReject = async () => {
    try {
      setActionError(null);
      await updateProofStatus(proof.id, PaymentProofStatus.rejected);
      onOpenChange(false);
    } catch (error) {
      setActionError('Failed to reject payment proof');
      console.error(error);
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      [PaymentProofStatus.pending]: {
        icon: Clock,
        label: 'Pending',
        variant: 'secondary' as const,
      },
      [PaymentProofStatus.approved]: {
        icon: CheckCircle2,
        label: 'Approved',
        variant: 'default' as const,
      },
      [PaymentProofStatus.rejected]: {
        icon: XCircle,
        label: 'Rejected',
        variant: 'destructive' as const,
      },
    };

    const config = statusConfig[proof.status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Payment Proof Review</SheetTitle>
          <SheetDescription>
            Review and approve or reject this payment proof
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div>
            <p className="text-sm font-medium mb-2">Status</p>
            {getStatusBadge()}
          </div>

          {/* User ID */}
          <div>
            <p className="text-sm font-medium mb-2">User</p>
            <p className="text-sm font-mono break-all text-muted-foreground">
              {proof.userId.toString()}
            </p>
          </div>

          {/* Transaction Code */}
          {proof.codeProof && (
            <div>
              <p className="text-sm font-medium mb-2">Transaction Code</p>
              <p className="text-sm font-mono bg-muted p-3 rounded-md break-all">
                {proof.codeProof}
              </p>
            </div>
          )}

          {/* File Proof */}
          {proof.isFile && proof.fileProof && (
            <div>
              <p className="text-sm font-medium mb-2">Payment Receipt</p>
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={proof.fileProof.getDirectURL()}
                  alt="Payment proof"
                  className="w-full h-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => window.open(proof.fileProof!.getDirectURL(), '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
              </Button>
            </div>
          )}

          {/* Actions */}
          {proof.status === PaymentProofStatus.pending && (
            <div className="space-y-3 pt-4 border-t">
              {actionError && (
                <Alert variant="destructive">
                  <AlertDescription>{actionError}</AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={handleApprove}
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Approve Payment
              </Button>
              
              <Button
                onClick={handleReject}
                disabled={isUpdating}
                variant="destructive"
                className="w-full"
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Reject Payment
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
