import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { consumptionService } from "../../../../../app/services/consumptionService";
import {
  consumptionQueryKey,
  consumptionStaleTime,
} from "../../../../../app/hooks/useConsumptionQueries";
import { ConsumptionClassification } from "../../../../../types/Consumption";
import { useConsumptionFilters } from "../../useConsumptionFilters";

export function useConsumptionBySupplyController() {
  const { filters, setFilters } = useConsumptionFilters();

  const [search, setSearch] = useState('');
  const [classification, setClassification] = useState<ConsumptionClassification | ''>('');
  const [expanded, setExpanded] = useState<string[]>([]);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...consumptionQueryKey, 'by-supply', filters],
    queryFn: () => consumptionService.getBySupply(filters),
    staleTime: consumptionStaleTime,
  });

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (data?.items ?? []).filter(item => {
      if (classification && item.classification !== classification) {
        return false;
      }

      return !term || item.supplyName.toLowerCase().includes(term);
    });
  }, [data, search, classification]);

  const handleToggleExpanded = useCallback((supplyId: string) => {
    setExpanded(current => (
      current.includes(supplyId)
        ? current.filter(id => id !== supplyId)
        : [...current, supplyId]
    ));
  }, []);

  return {
    data,
    items,
    isFetching,
    isError,
    refetch,
    filters,
    setFilters,
    search,
    setSearch,
    classification,
    setClassification,
    expanded,
    handleToggleExpanded,
  };
}
