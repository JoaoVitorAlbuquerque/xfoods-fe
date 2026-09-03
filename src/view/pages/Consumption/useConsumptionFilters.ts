import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { ConsumptionParams } from "../../../app/services/consumptionService";

/** Nome curto na URL → nome do parâmetro na API. */
const fields = {
  from: 'from',
  to: 'to',
  product: 'productId',
  category: 'categoryId',
  supply: 'supplyId',
  supplyCategory: 'supplyCategoryId',
  types: 'movementTypes',
  group: 'groupBy',
} as const;

type ShortKey = keyof typeof fields;
type FilterKey = typeof fields[ShortKey];

/**
 * Os filtros ficam na URL: são seis relatórios sobre o mesmo recorte, e trocar
 * de aba não pode redefinir o período nem os tipos de movimentação escolhidos.
 */
export function useConsumptionFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result: ConsumptionParams = {};

    for (const [short, param] of Object.entries(fields) as [ShortKey, FilterKey][]) {
      const value = searchParams.get(short);

      if (value) {
        Object.assign(result, { [param]: value });
      }
    }

    return result;
  }, [searchParams]);

  const setFilters = useCallback((next: ConsumptionParams) => {
    const params = new URLSearchParams();

    for (const [short, param] of Object.entries(fields) as [ShortKey, FilterKey][]) {
      const value = next[param];

      if (typeof value === 'string' && value !== '') {
        params.set(short, value);
      }
    }

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  return { filters, setFilters, searchParams };
}
