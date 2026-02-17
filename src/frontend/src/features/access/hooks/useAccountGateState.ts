import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useGetCallerUserRole,
  useIsCallerApproved,
  useIsCallerAdmin,
  useIsPaywallActive,
  useGetAllMyPaymentProofs,
} from '@/hooks/useQueries';
import { UserRole, PaymentProofStatus } from '@/backend';

export type GateState = 
  | { status: 'loading' }
  | { status: 'not-authenticated' }
  | { status: 'no-profile' }
  | { status: 'pending-approval' }
  | { status: 'pending-payment'; hasSubmittedProof: boolean }
  | { status: 'disabled' }
  | { status: 'allowed'; isAdmin: boolean };

export function useAccountGateState(): GateState {
  const { identity, isInitializing } = useInternetIdentity();
  
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: isApproved, isLoading: approvalLoading } = useIsCallerApproved();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: isPaywallActive, isLoading: paywallLoading } = useIsPaywallActive();
  const { data: paymentProofs, isLoading: proofsLoading } = useGetAllMyPaymentProofs();

  // Loading state
  if (
    isInitializing ||
    profileLoading ||
    roleLoading ||
    approvalLoading ||
    adminLoading ||
    paywallLoading ||
    proofsLoading
  ) {
    return { status: 'loading' };
  }

  // Not authenticated
  if (!identity) {
    return { status: 'not-authenticated' };
  }

  // No profile setup
  if (profileFetched && userProfile === null) {
    return { status: 'no-profile' };
  }

  // Profile disabled
  if (userProfile && !userProfile.enabled) {
    return { status: 'disabled' };
  }

  // Admin always has access
  if (isAdmin === true) {
    return { status: 'allowed', isAdmin: true };
  }

  // Check approval status
  if (isApproved === false) {
    return { status: 'pending-approval' };
  }

  // Check paywall (if active)
  if (isPaywallActive === true) {
    // Check if user has an approved payment proof
    const hasApprovedProof = paymentProofs?.some(
      (proof) => proof.status === PaymentProofStatus.approved
    );

    if (!hasApprovedProof) {
      const hasSubmittedProof = paymentProofs && paymentProofs.length > 0;
      return { status: 'pending-payment', hasSubmittedProof: !!hasSubmittedProof };
    }
  }

  // All checks passed
  return { status: 'allowed', isAdmin: false };
}
