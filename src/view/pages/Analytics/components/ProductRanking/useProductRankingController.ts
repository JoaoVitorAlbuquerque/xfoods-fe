import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { analyticsService } from "../../../../../app/services/analyticsService";
import {
  analyticsQueryKey,
  analyticsStaleTime,
} from "../../../../../app/hooks/useAnalyticsQueries";
import { ProductRankBy } from "../../../../../types/Analytics";
import { useAnalyticsFilters } from "../../useAnalyticsFilters";

const PAGE_SIZE = 10;

export function useProductRankingController() {
  const { filters, setFilters, searchParams } = useAnalyticsFilters();

  const [rankBy, setRankBy] = useState<ProductRankBy>('REVENUE');
  const [page, setPage] = useState(0);

  // Trocar o critério ou o recorte reordena a lista inteira: continuar na
  // página 3 mostraria o meio de um ranking que o usuário nunca viu começar.
  useEffect(() => {
    setPage(0);
  }, [rankBy, searchParams]);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...analyticsQueryKey, 'ranking', rankBy, page, filters],
    queryFn: () => analyticsService.getProductRanking({
      ...filters,
      rankBy,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
    staleTime: analyticsStaleTime,
  });

  const pageCount = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return {
    data,
    isFetching,
    isError,
    refetch,
    filters,
    setFilters,
    detailSearch: searchParams.toString(),
    rankBy,
    setRankBy,
    page,
    setPage,
    pageCount,
  };
}
