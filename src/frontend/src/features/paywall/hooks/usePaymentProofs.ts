import {
  useGetAllMyPaymentProofs,
  useSubmitPaymentProof,
  useUpdatePaymentProof,
} from '@/hooks/useQueries';
import type { PaymentProofUpdate } from '@/backend';

export function usePaymentProofs() {
  const { data: proofs, isLoading, error } = useGetAllMyPaymentProofs();
  const submitMutation = useSubmitPaymentProof();
  const updateMutation = useUpdatePaymentProof();

  const latestProof = proofs && proofs.length > 0 
    ? proofs.sort((a, b) => Number(b.id - a.id))[0]
    : null;

  const submitProof = async (proof: PaymentProofUpdate) => {
    return submitMutation.mutateAsync(proof);
  };

  const updateProof = async (proofId: bigint, proof: PaymentProofUpdate) => {
    return updateMutation.mutateAsync({ proofId, proof });
  };

  return {
    proofs,
    latestProof,
    isLoading,
    error,
    submitProof,
    updateProof,
    isSubmitting: submitMutation.isPending || updateMutation.isPending,
    submitError: submitMutation.error || updateMutation.error,
  };
}
