/**
 * Percentuais sobrescritos só para esta consulta — nada é gravado.
 *
 * É o que permite precificar canal a canal sem duplicar cadastro: balcão em
 * dinheiro é `cardFeePercent=0` e `deliveryFeePercent=0`. Campo ausente vale o
 * que está na configuração, e `percentages.source` na resposta diz de onde
 * cada número veio.
 *
 * Vão como string, como todo decimal enviado à API.
 */
export interface PricingOverrides {
  marginPercent?: string;
  taxPercent?: string;
  cardFeePercent?: string;
  deliveryFeePercent?: string;
  otherFeesPercent?: string;
  /** Competência do custo indireto. Ausente, vale o mês corrente. */
  from?: string;
  to?: string;
}
