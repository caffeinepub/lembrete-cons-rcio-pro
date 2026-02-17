import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';
import { UserApprovalList } from './components/UserApprovalList';
import { PaymentProofReviewDrawer } from './components/PaymentProofReviewDrawer';
import { useAdminPaymentProofs } from './hooks/useAdminData';
import type { PaymentProof } from '@/backend';
import { PaymentProofStatus } from '@/backend';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminPanel() {
  const { proofs, isLoading, error } = useAdminPaymentProofs();
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleViewProof = (proof: PaymentProof) => {
    setSelectedProof(proof);
    setDrawerOpen(true);
  };

  const getStatusBadge = (status: PaymentProofStatus) => {
    const config = {
      [PaymentProofStatus.pending]: { label: 'Pending', variant: 'secondary' as const },
      [PaymentProofStatus.approved]: { label: 'Approved', variant: 'default' as const },
      [PaymentProofStatus.rejected]: { label: 'Rejected', variant: 'destructive' as const },
    };
    const { label, variant } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <p className="text-muted-foreground">Manage users and payment approvals</p>
      </div>

      <Tabs defaultValue="approvals" className="w-full">
        <TabsList>
          <TabsTrigger value="approvals">User Approvals</TabsTrigger>
          <TabsTrigger value="payments">Payment Proofs</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-6">
          <UserApprovalList />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Proofs</CardTitle>
              <CardDescription>Review and manage payment submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>Failed to load payment proofs</AlertDescription>
                </Alert>
              ) : proofs && proofs.length > 0 ? (
                <div className="space-y-4">
                  {proofs
                    .sort((a, b) => Number(b.id - a.id))
                    .map((proof) => (
                      <div
                        key={proof.id.toString()}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">Proof #{proof.id.toString()}</p>
                            {getStatusBadge(proof.status)}
                          </div>
                          <p className="text-xs font-mono text-muted-foreground truncate">
                            User: {proof.userId.toString()}
                          </p>
                          {proof.codeProof && (
                            <p className="text-xs text-muted-foreground">
                              Code: {proof.codeProof.substring(0, 20)}...
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProof(proof)}
                          className="ml-4"
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Review
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No payment proofs found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PaymentProofReviewDrawer
        proof={selectedProof}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
