import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { pixPaywallConfig } from '@/config/pixPaywall';
import { usePaymentProofs } from './hooks/usePaymentProofs';
import { ExternalBlob, PaymentProofStatus } from '@/backend';
import { Badge } from '@/components/ui/badge';

export function PaywallScreen() {
  const [transactionCode, setTransactionCode] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { latestProof, submitProof, updateProof, isSubmitting, submitError } = usePaymentProofs();

  const canSubmit = !latestProof || latestProof.status === PaymentProofStatus.rejected;
  const canUpdate = latestProof && latestProof.status === PaymentProofStatus.pending;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionCode.trim() && !selectedFile) {
      return;
    }

    try {
      let fileBlob: ExternalBlob | undefined;

      if (selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        fileBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      const proofData = {
        transactionCode: transactionCode.trim() || undefined,
        uploadFile: fileBlob,
        isFile: !!selectedFile,
      };

      if (canUpdate && latestProof) {
        await updateProof(latestProof.id, proofData);
      } else {
        await submitProof(proofData);
      }

      setTransactionCode('');
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Failed to submit payment proof:', error);
    }
  };

  const getStatusBadge = () => {
    if (!latestProof) return null;

    const statusConfig = {
      [PaymentProofStatus.pending]: {
        icon: Clock,
        label: 'Pending Review',
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

    const config = statusConfig[latestProof.status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="mb-4">
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Payment Required</CardTitle>
          <CardDescription>
            Complete your payment to activate full access to the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Information */}
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">{pixPaywallConfig.amount}</p>
              <p className="text-xs text-muted-foreground">{pixPaywallConfig.paymentDescription}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pix Key</p>
              <p className="text-lg font-mono">{pixPaywallConfig.pixKey}</p>
            </div>
          </div>

          {/* Instructions */}
          <Alert>
            <AlertDescription className="text-sm">
              {pixPaywallConfig.instructions}
            </AlertDescription>
          </Alert>

          {/* Current Status */}
          {latestProof && (
            <div>
              <p className="text-sm font-medium mb-2">Current Status</p>
              {getStatusBadge()}
              {latestProof.status === PaymentProofStatus.pending && (
                <p className="text-sm text-muted-foreground">
                  Your payment proof is being reviewed. You will be notified once it's approved.
                </p>
              )}
              {latestProof.status === PaymentProofStatus.rejected && (
                <p className="text-sm text-destructive">
                  Your previous submission was rejected. Please submit a new payment proof.
                </p>
              )}
              {latestProof.status === PaymentProofStatus.approved && (
                <p className="text-sm text-muted-foreground">
                  Your payment has been confirmed. Access will be granted shortly.
                </p>
              )}
            </div>
          )}

          {/* Submission Form */}
          {(canSubmit || canUpdate) && latestProof?.status !== PaymentProofStatus.approved && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactionCode">Transaction Code (Optional)</Label>
                <Input
                  id="transactionCode"
                  type="text"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value)}
                  placeholder="Enter your Pix transaction code"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proofFile">Payment Receipt (Optional)</Label>
                <Input
                  id="proofFile"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to submit payment proof. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || (!transactionCode.trim() && !selectedFile)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {canUpdate ? 'Update Payment Proof' : 'Submit Payment Proof'}
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
