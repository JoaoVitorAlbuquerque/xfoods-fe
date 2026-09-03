import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { pricingService } from "../../../../../app/services/pricingService";
import { pricingQueryKey } from "../../../../../app/hooks/usePricingQueries";
import { PriceStatus } from "../../../../../types/Pricing";
import { usePricingOverrides } from "../../usePricingOverrides";

export function usePricingProductsController() {
  const { overrides, setOverrides, searchParams } = usePricingOverrides();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PriceStatus | ''>('');

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: [...pricingQueryKey, 'products', overrides],
    queryFn: () => pricingService.getProducts(overrides),
    retry: false,
  });

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (data?.items ?? []).filter(item => {
      if (status && item.status !== status) {
        return false;
      }

      return !term || item.productName.toLowerCase().includes(term);
    });
  }, [data, search, status]);

  return {
    data,
    items,
    isFetching,
    isError,
    error,
    refetch,
    overrides,
    setOverrides,
    /** Leva o canal atual para o detalhe: mesma pergunta, mesma resposta. */
    detailSearch: searchParams.toString(),
    search,
    setSearch,
    status,
    setStatus,
  };
}
