import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Shield, User, Mail } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '@/hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { AdminPanel } from '@/features/admin/AdminPanel';
import { Separator } from '@/components/ui/separator';

export function SettingsModule() {
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your profile and account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userProfile && (
            <>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{userProfile.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <Badge variant={isAdmin ? 'default' : 'secondary'}>
                    {isAdmin ? 'Administrator' : 'User'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={userProfile.enabled ? 'default' : 'destructive'}>
                    {userProfile.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </>
          )}

          {identity && (
            <div className="pt-4 border-t">
              <p className="text-xs font-medium mb-1">Principal ID</p>
              <p className="text-xs font-mono text-muted-foreground break-all">
                {identity.getPrincipal().toString()}
              </p>
            </div>
          )}

          <div className="pt-4">
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Panel */}
      {isAdmin && (
        <>
          <Separator />
          <AdminPanel />
        </>
      )}
    </div>
  );
}
