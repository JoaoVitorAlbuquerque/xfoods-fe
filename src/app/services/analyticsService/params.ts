import { ProductRankBy } from "../../../types/Analytics";

/**
 * Filtros comuns a todos os painéis.
 *
 * Diferente de `/stock/movements` e `/purchases`, o controller de analytics tem
 * `ValidationPipe` próprio com `transform: true` — aqui `limit` e `offset`
 * podem ser enviados sem quebrar.
 */
export interface AnalyticsFilters {
  /** Competência. Ausente nas duas pontas, a API usa o mês corrente. */
  from?: string;
  to?: string;
  productId?: string;
  /** Categoria do cardápio. */
  categoryId?: string;
  supplyId?: string;
  supplyCategoryId?: string;
  limit?: number;
  offset?: number;
}

export interface ProductRankingParams extends AnalyticsFilters {
  rankBy?: ProductRankBy;
}

/** Limiares do setor, sobrescrevíveis: são referências, não regras. */
export interface AlertsParams extends AnalyticsFilters {
  highCostThresholdPercent?: string;
  costIncreaseThresholdPercent?: string;
  wasteThresholdCost?: string;
}
