import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { pricingService } from "../../../../../app/services/pricingService";
import { pricingQueryKey } from "../../../../../app/hooks/usePricingQueries";
import { usePricingOverrides } from "../../usePricingOverrides";

export type SimulationSource = 'PRODUCT' | 'COST';

export function usePricingSimulatorController() {
  const { overrides, setOverrides } = usePricingOverrides();
  const [searchParams] = useSearchParams();

  /**
   * O prato vem do link do detalhe na primeira renderização e depois vira
   * estado local: mexer nos percentuais reescreve a query string, e ler o
   * `productId` de lá o perderia no primeiro clique.
   */
  const [source, setSource] = useState<SimulationSource>(
    searchParams.get('productId') ? 'PRODUCT' : 'COST',
  );
  const [productId, setProductId] = useState(searchParams.get('productId') ?? '');
  const [cost, setCost] = useState('');
  const [margins, setMargins] = useState<string[]>([]);
  const [marginDraft, setMarginDraft] = useState('');

  /** Pratos com ficha ativa — os únicos que a simulação por prato aceita. */
  const { data: products } = useQuery({
    queryKey: [...pricingQueryKey, 'products', overrides],
    queryFn: () => pricingService.getProducts(overrides),
    retry: false,
  });

  const hasSubject = source === 'PRODUCT' ? Boolean(productId) : Boolean(cost);

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: [...pricingQueryKey, 'simulate', source, productId, cost, margins, overrides],
    queryFn: () => pricingService.simulate({
      ...overrides,
      ...(source === 'PRODUCT' ? { productId } : { cost }),
      ...(margins.length > 0 ? { margins: margins.join(',') } : {}),
    }),
    enabled: hasSubject,
    retry: false,
  });

  const handleAddMargin = useCallback(() => {
    if (!marginDraft) {
      return;
    }

    setMargins(current => (
      current.includes(marginDraft)
        ? current
        : [...current, marginDraft].sort((a, b) => Number(a) - Number(b))
    ));

    setMarginDraft('');
  }, [marginDraft]);

  const handleRemoveMargin = useCallback((margin: string) => {
    setMargins(current => current.filter(item => item !== margin));
  }, []);

  return {
    data,
    isFetching,
    isError,
    error,
    refetch,
    overrides,
    setOverrides,
    productOptions: products?.items ?? [],
    source,
    setSource,
    productId,
    setProductId,
    cost,
    setCost,
    margins,
    marginDraft,
    setMarginDraft,
    handleAddMargin,
    handleRemoveMargin,
    hasSubject,
  };
}
