import {
  useListApprovals,
  useSetApproval,
  useGetAllPaymentProofs,
  useUpdatePaymentProofStatusByAdmin,
  useAssignCallerUserRole,
} from '@/hooks/useQueries';
import type { PaymentProofStatus, UserRole } from '@/backend';
import type { ApprovalStatus } from '@/backend/types';
import { Principal } from '@icp-sdk/core/principal';

export function useAdminApprovals() {
  const { data: approvals, isLoading, error } = useListApprovals();
  const setApprovalMutation = useSetApproval();

  const setApproval = async (user: Principal, status: ApprovalStatus) => {
    return setApprovalMutation.mutateAsync({ user, status });
  };

  return {
    approvals,
    isLoading,
    error,
    setApproval,
    isUpdating: setApprovalMutation.isPending,
  };
}

export function useAdminPaymentProofs() {
  const { data: proofs, isLoading, error } = useGetAllPaymentProofs();
  const updateStatusMutation = useUpdatePaymentProofStatusByAdmin();

  const updateProofStatus = async (proofId: bigint, status: PaymentProofStatus) => {
    return updateStatusMutation.mutateAsync({ proofId, status });
  };

  return {
    proofs,
    isLoading,
    error,
    updateProofStatus,
    isUpdating: updateStatusMutation.isPending,
  };
}

export function useAdminRoleAssignment() {
  const assignRoleMutation = useAssignCallerUserRole();

  const assignRole = async (user: Principal, role: UserRole) => {
    return assignRoleMutation.mutateAsync({ user, role });
  };

  return {
    assignRole,
    isAssigning: assignRoleMutation.isPending,
  };
}
