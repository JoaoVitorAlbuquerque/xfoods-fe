import { PeriodGrouping } from "../../../types/Consumption";
import { StockMovementType } from "../../../types/StockMovement";

/**
 * Filtros comuns a todos os relatórios de consumo.
 *
 * O controller tem `ValidationPipe` próprio com `transform: true`, então
 * `limit` e `movementTypes` podem ser enviados — este último como texto
 * separado por vírgula, que é o formato que o `@Transform` do DTO espera.
 */
export interface ConsumptionParams {
  /** Ausente, a API usa trinta dias atrás. */
  from?: string;
  /** Ausente, a API usa agora. */
  to?: string;
  productId?: string;
  /** Categoria do cardápio, não do insumo. */
  categoryId?: string;
  supplyId?: string;
  supplyCategoryId?: string;
  /**
   * Restringir aqui muda o que "real" significa: pedir só LOSS compara as
   * perdas contra o consumo previsto inteiro, e a variação fica catastrófica.
   */
  movementTypes?: string;
  limit?: number;
  groupBy?: PeriodGrouping;
}

/** Os tipos que a API considera consumo quando nada é informado. */
export const consumptionMovementTypes: StockMovementType[] = [
  'SALE',
  'LOSS',
  'ADJUSTMENT',
  'PRODUCTION',
  'RETURN',
  'TRANSFER',
];
