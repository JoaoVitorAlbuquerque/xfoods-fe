export type StockMovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'LOSS'
  | 'ADJUSTMENT'
  | 'PRODUCTION'
  | 'RETURN'
  | 'TRANSFER';

export type StockMovementDirection = 'IN' | 'OUT';

export const stockMovementTypeLabels: Record<StockMovementType, string> = {
  PURCHASE: 'Compra',
  SALE: 'Venda',
  LOSS: 'Perda',
  ADJUSTMENT: 'Ajuste',
  PRODUCTION: 'Produção',
  RETURN: 'Devolução',
  TRANSFER: 'Transferência',
};

/**
 * Convenção de sinal do razão: negativo é saída, e vale para `quantity`,
 * `quantityBase` e `totalCost` ao mesmo tempo. `direction` é derivado disso
 * pela API para a interface não reimplementar a convenção.
 */
export interface StockMovementBase {
  id: string;
  userId: string;
  supplyId: string;
  unitId: string;
  type: StockMovementType;
  quantity: number;
  quantityBase: number;
  unitCost: number;
  totalCost: number;
  /** Saldo do insumo depois deste movimento. */
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  reason: string | null;
  reversalOfId: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface StockMovement extends StockMovementBase {
  supply: { id: string; name: string };
  unit: { code: string; name: string };
  direction: StockMovementDirection;
}

/** Movimentação como vem em `GET /supplies/:id` — sem o insumo, que é o da tela. */
export interface SupplyMovement extends StockMovementBase {
  unit: { code: string };
}

export interface StockMovementsResponse {
  items: StockMovement[];
  total: number;
  limit: number;
  offset: number;
}
