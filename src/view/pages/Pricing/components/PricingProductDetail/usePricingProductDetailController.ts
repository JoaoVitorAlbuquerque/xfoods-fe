import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { pricingService } from "../../../../../app/services/pricingService";
import { pricingQueryKey } from "../../../../../app/hooks/usePricingQueries";
import { usePricingOverrides } from "../../usePricingOverrides";

/** O preço escolhido para aplicar: o recomendado ou um arredondamento. */
interface PriceToApply {
  price: number;
  marginPercent: number | null;
  source: string;
}

export function usePricingProductDetailController() {
  const { productId } = useParams<{ productId: string }>();
  const { overrides, setOverrides, searchParams } = usePricingOverrides();

  const [priceToApply, setPriceToApply] = useState<PriceToApply | null>(null);

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: [...pricingQueryKey, 'product', productId, overrides],
    queryFn: () => pricingService.getProduct(productId!, overrides),
    enabled: Boolean(productId),
    retry: false,
  });

  /** 404 aqui significa "prato sem ficha ativa", não "prato inexistente". */
  const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;

  const handleOpenApply = useCallback((next: PriceToApply) => {
    setPriceToApply(next);
  }, []);

  const handleCloseApply = useCallback(() => {
    setPriceToApply(null);
  }, []);

  return {
    productId,
    data,
    isFetching,
    isError,
    error,
    isNotFound,
    refetch,
    overrides,
    setOverrides,
    listSearch: searchParams.toString(),
    priceToApply,
    handleOpenApply,
    handleCloseApply,
  };
}
