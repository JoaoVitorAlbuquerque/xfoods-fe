import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { analyticsService } from "../../../../../app/services/analyticsService";
import {
  analyticsQueryKey,
  analyticsStaleTime,
} from "../../../../../app/hooks/useAnalyticsQueries";
import { useDebouncedValue } from "../../../../../app/hooks/useDebouncedValue";
import { useAnalyticsFilters } from "../../useAnalyticsFilters";

/**
 * Referências do setor, não regras do sistema — a API usa exatamente estes
 * padrões quando o campo vem vazio, e a tela deixa o usuário mudar.
 */
export const thresholdDefaults = {
  highCostThresholdPercent: '35',
  costIncreaseThresholdPercent: '10',
  wasteThresholdCost: '0',
};

export function useAnalyticsAlertsController() {
  const { filters, setFilters, searchParams } = useAnalyticsFilters();

  const [thresholds, setThresholds] = useState(thresholdDefaults);

  // Digitar um limiar refaz seis agregações de uma vez; esperar o usuário parar
  // evita disparar uma consulta cara a cada tecla.
  const debouncedThresholds = useDebouncedValue(thresholds, 500);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...analyticsQueryKey, 'alerts', debouncedThresholds, filters],
    queryFn: () => analyticsService.getAlerts({
      ...filters,
      ...debouncedThresholds,
    }),
    staleTime: analyticsStaleTime,
  });

  function handleThreshold(key: keyof typeof thresholdDefaults, value: string) {
    setThresholds(current => ({ ...current, [key]: value }));
  }

  function handleResetThresholds() {
    setThresholds(thresholdDefaults);
  }

  const isCustomized = (
    Object.keys(thresholdDefaults) as (keyof typeof thresholdDefaults)[]
  ).some(key => thresholds[key] !== thresholdDefaults[key]);

  return {
    data,
    isFetching,
    isError,
    refetch,
    filters,
    setFilters,
    detailSearch: searchParams.toString(),
    thresholds,
    handleThreshold,
    handleResetThresholds,
    isCustomized,
  };
}
