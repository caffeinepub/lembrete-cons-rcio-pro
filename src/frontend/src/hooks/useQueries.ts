import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, PaymentProofUpdate, PaymentProofStatus, UserRole } from '@/backend';
import type { ApprovalStatus } from '@/backend/types';
import { Principal } from '@icp-sdk/core/principal';

export function useBackendStatus() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['backend-status'],
    queryFn: async () => {
      if (!actor) return { connected: false };
      
      try {
        const result = await actor.healthCheck();
        return { connected: result === true };
      } catch (error) {
        console.error('Backend health check failed:', error);
        return { connected: false };
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    retryDelay: 1000,
  });
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Role and Approval Queries
export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

// Payment Proof Queries
export function useIsPaywallActive() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isPaywallActive'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isPaywallActive();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllMyPaymentProofs() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['myPaymentProofs'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllMyPaymentProofs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitPaymentProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proof: PaymentProofUpdate) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitPaymentProof(proof);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPaymentProofs'] });
      queryClient.invalidateQueries({ queryKey: ['allPaymentProofs'] });
    },
  });
}

export function useUpdatePaymentProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proofId, proof }: { proofId: bigint; proof: PaymentProofUpdate }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePaymentProof(proofId, proof);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPaymentProofs'] });
      queryClient.invalidateQueries({ queryKey: ['allPaymentProofs'] });
    },
  });
}

// Admin Queries
export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useGetAllPaymentProofs() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allPaymentProofs'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPaymentProofs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPaymentProofByStatus() {
  const { actor, isFetching } = useActor();

  return useMutation({
    mutationFn: async (status: PaymentProofStatus) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaymentProofByStatus(status);
    },
  });
}

export function useUpdatePaymentProofStatusByAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proofId, status }: { proofId: bigint; status: PaymentProofStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePaymentProofStatusByAdmin(proofId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPaymentProofs'] });
      queryClient.invalidateQueries({ queryKey: ['myPaymentProofs'] });
    },
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
    },
  });
}
