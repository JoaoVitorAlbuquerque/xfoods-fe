import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { AnalyticsFilters } from "../../../app/services/analyticsService";

/** Nome curto na URL → nome do parâmetro na API. */
const fields = {
  from: 'from',
  to: 'to',
  product: 'productId',
  category: 'categoryId',
  supply: 'supplyId',
  supplyCategory: 'supplyCategoryId',
} as const;

type ShortKey = keyof typeof fields;
type FilterKey = typeof fields[ShortKey];

/**
 * Os filtros dos painéis ficam na URL.
 *
 * São cinco painéis lendo o mesmo período e os mesmos recortes: trocar de aba
 * e perder o mês escolhido faria cada tela responder sobre um período
 * diferente. Na URL o recorte atravessa a navegação e o link é compartilhável.
 */
export function useAnalyticsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result: AnalyticsFilters = {};

    for (const [short, param] of Object.entries(fields) as [ShortKey, FilterKey][]) {
      const value = searchParams.get(short);

      if (value) {
        result[param] = value;
      }
    }

    return result;
  }, [searchParams]);

  const setFilters = useCallback((next: AnalyticsFilters) => {
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
