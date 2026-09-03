import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { pricingService } from "../services/pricingService";

export const pricingQueryKey = ['pricing'];

export function usePricingSettings() {
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...pricingQueryKey, 'settings'],
    queryFn: pricingService.getSettings,
    staleTime: 1000 * 60 * 5,
  });

  return { settings: data, isFetching, isError, refetch };
}

export function useInvalidatePricing() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: pricingQueryKey });
  }, [queryClient]);
}
