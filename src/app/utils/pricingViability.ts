export interface PricingPercentValues {
  marginPercent: number;
  taxPercent: number;
  cardFeePercent: number;
  deliveryFeePercent: number;
  otherFeesPercent: number;
}

/** Em 100% cada real cobrado já está comprometido antes de pagar o insumo. */
export const MAX_TOTAL_PERCENT = 100;

export function getFeesPercent(values: PricingPercentValues) {
  return values.cardFeePercent + values.deliveryFeePercent + values.otherFeesPercent;
}

export function getTotalPercent(values: PricingPercentValues) {
  return getFeesPercent(values) + values.taxPercent + values.marginPercent;
}

/**
 * A mesma trava do servidor, do lado do cliente.
 *
 * A API recusa impostos + taxas + margem ≥ 100% com um 400, e está certa: nesse
 * ponto não existe preço que cubra o custo. Repetir a conta aqui é o que faz o
 * usuário ver o limite enquanto digita, em vez de descobrir no erro.
 */
export function getPricingViability(values: PricingPercentValues) {
  const feesPercent = getFeesPercent(values);
  const totalPercent = getTotalPercent(values);
  /** Teto da margem com as taxas atuais — a saída concreta do impasse. */
  const maxMarginPercent = MAX_TOTAL_PERCENT - values.taxPercent - feesPercent;

  const isViable = totalPercent < MAX_TOTAL_PERCENT;

  return {
    feesPercent,
    totalPercent,
    maxMarginPercent,
    isViable,
    message: isViable
      ? null
      : 'Não é possível calcular o preço: impostos + taxas + margem somam '
        + `${totalPercent.toLocaleString('pt-br', { maximumFractionDigits: 2 })}%, `
        + 'que é 100% ou mais. Nesse ponto cada real cobrado já estaria '
        + 'inteiramente comprometido antes de pagar o insumo.',
  };
}
