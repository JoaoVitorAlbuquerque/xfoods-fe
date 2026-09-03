import { SizeType } from './Recipe';
import { StockMovementType } from './StockMovement';

/**
 * Avisos devolvidos pela baixa automática da venda. Eles dizem que o número
 * não é confiável — descartá-los faria o sistema mentir com a autoridade de
 * uma tela bonita.
 */
export type SaleAlertType = 'NO_RECIPE' | 'MISSING_COST';

export interface SaleStockAlert {
  type: SaleAlertType;
  productOrderId: string;
  productId: string;
  productName: string;
  /** Mensagem da API. É exibida junto da explicação em português. */
  message: string;
}

/** Retorno novo de `PATCH /orders/paid`. */
export interface PaidResult {
  updated: number;
  stockMovements: number;
  alerts: SaleStockAlert[];
}

export interface StockReversal {
  reversed: boolean;
  reason: 'NOTHING_TO_REVERSE' | null;
  movements: number;
}

/**
 * Cancelar estorna o estoque mas **mantém `paid` e `paidAt`**: o sistema não
 * modela devolução de dinheiro, então cancelado não significa não pago.
 */
export interface CancelOrderResult {
  id: string;
  status: string;
  paid: boolean;
  paidAt: string | null;
  canceledAt: string | null;
  stockReversal: StockReversal;
}

export interface OrderConsumptionItem {
  id: string;
  quantity: number;
  size: SizeType | null;
  recipeId: string | null;
  /** Custo congelado na venda — o que o prato custou naquele dia. */
  recipeUnitCost: number | null;
  recipeTotalCost: number | null;
  product: { id: string; name: string };
  recipe: { id: string; version: number } | null;
}

export interface OrderConsumptionMovement {
  id: string;
  supplyId: string;
  type: StockMovementType;
  quantity: number;
  /** Negativo é saída; o estorno entra como lançamento positivo. */
  quantityBase: number;
  unitCost: number;
  totalCost: number;
  balanceAfter: number;
  reason: string | null;
  reversalOfId: string | null;
  occurredAt: string;
  createdAt: string;
  supply: { id: string; name: string };
  unit: { code: string };
}

export interface OrderConsumption {
  items: OrderConsumptionItem[];
  movements: OrderConsumptionMovement[];
  /** Zerado em todos os insumos significa venda totalmente estornada. */
  netConsumption: { supplyId: string; supplyName: string; quantityBase: number }[];
  totalRecipeCost: number;
}
