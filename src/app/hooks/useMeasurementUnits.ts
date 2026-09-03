import { useQuery } from "@tanstack/react-query";

import { measurementUnitsService } from "../services/measurementUnitsService";

export const measurementUnitsQueryKey = ['measurement-units'];

/**
 * Catálogo de unidades: as de sistema (KG, G, L, ML, UN...) mais as que o
 * estabelecimento criou. Muda raramente e é lido por quase todo formulário,
 * então vale um `staleTime` generoso.
 */
export function useMeasurementUnits(includeInactive = false) {
  const { data = [], isFetching, isLoading, isError, refetch } = useQuery({
    queryKey: [...measurementUnitsQueryKey, { includeInactive }],
    queryFn: () => measurementUnitsService.getAll({ includeInactive }),
    staleTime: 1000 * 60 * 5,
  });

  return {
    units: data,
    isFetching,
    isLoading,
    isError,
    refetch,
  };
}
