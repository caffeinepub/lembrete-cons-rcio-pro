import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { useAdminApprovals } from '../hooks/useAdminData';
import type { ApprovalStatus } from '@/backend/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function UserApprovalList() {
  const { approvals, isLoading, error, setApproval, isUpdating } = useAdminApprovals();
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>Failed to load approvals</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const filteredApprovals = approvals?.filter((approval) => {
    if (filter === 'pending') {
      return approval.status.__kind__ === 'pending';
    }
    return true;
  });

  const getStatusBadge = (status: ApprovalStatus) => {
    if (status.__kind__ === 'approved') {
      return (
        <Badge variant="default">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    }
    if (status.__kind__ === 'rejected') {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Approvals</CardTitle>
        <CardDescription>Manage user registration approvals</CardDescription>
        <div className="flex gap-2 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({approvals?.length || 0})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending ({approvals?.filter((a) => a.status.__kind__ === 'pending').length || 0})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredApprovals && filteredApprovals.length > 0 ? (
          <div className="space-y-4">
            {filteredApprovals.map((approval) => (
              <div
                key={approval.principal.toString()}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono truncate">
                    {approval.principal.toString()}
                  </p>
                  <div className="mt-2">{getStatusBadge(approval.status)}</div>
                </div>
                {approval.status.__kind__ === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => setApproval(approval.principal, { __kind__: 'approved' })}
                      disabled={isUpdating}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setApproval(approval.principal, { __kind__: 'rejected' })}
                      disabled={isUpdating}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            {filter === 'pending' ? 'No pending approvals' : 'No approvals found'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
