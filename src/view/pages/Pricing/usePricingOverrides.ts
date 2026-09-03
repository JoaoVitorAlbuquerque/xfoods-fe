import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { PricingOverrides } from "../../../app/services/pricingService";

/** Nome curto na URL → nome do parâmetro na API. */
const fields = {
  margin: 'marginPercent',
  tax: 'taxPercent',
  card: 'cardFeePercent',
  delivery: 'deliveryFeePercent',
  other: 'otherFeesPercent',
  from: 'from',
  to: 'to',
} as const;

type ShortKey = keyof typeof fields;

/**
 * Os percentuais da consulta moram na URL, não em estado local.
 *
 * O detalhe do prato tem que ser precificado no mesmo canal que a lista de onde
 * o usuário veio: se o balcão zerou a taxa de cartão, abrir um prato e ver o
 * preço do delivery seria trocar a resposta no meio da pergunta. Na URL o
 * cenário atravessa a navegação e ainda dá para compartilhar o link.
 */
export function usePricingOverrides() {
  const [searchParams, setSearchParams] = useSearchParams();

  const overrides = useMemo(() => {
    const result: PricingOverrides = {};

    for (const [short, param] of Object.entries(fields) as [ShortKey, string][]) {
      const value = searchParams.get(short);

      if (value !== null && value !== '') {
        result[param as keyof PricingOverrides] = value;
      }
    }

    return result;
  }, [searchParams]);

  const setOverrides = useCallback((next: PricingOverrides) => {
    const params = new URLSearchParams();

    for (const [short, param] of Object.entries(fields) as [ShortKey, string][]) {
      const value = next[param as keyof PricingOverrides];

      if (value !== undefined && value !== '') {
        params.set(short, value);
      }
    }

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  return { overrides, setOverrides, searchParams };
}
