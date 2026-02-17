// React Query hooks for backend data fetching and mutations
// Manages all server state and cache invalidation

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// Example query hook - currently backend has no methods
export function useBackendStatus() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['backend-status'],
    queryFn: async () => {
      if (!actor) return { connected: false };
      return { connected: true };
    },
    enabled: !!actor && !isFetching,
  });
}
