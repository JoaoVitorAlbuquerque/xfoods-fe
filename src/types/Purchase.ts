export type PurchaseStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELED';

export const purchaseStatusLabels: Record<PurchaseStatus, string> = {
  DRAFT: 'Rascunho',
  CONFIRMED: 'Confirmada',
  CANCELED: 'Cancelada',
};

export const purchaseStatusClasses: Record<PurchaseStatus, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-900',
  CONFIRMED: 'bg-green-100 text-green-900',
  CANCELED: 'bg-gray-100 text-gray-400',
};

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  supplyId: string;
  unitId: string;
  quantity: number;
  /** A mesma quantidade convertida para a unidade base do insumo. */
  quantityBase: number;
  /** Preço por unidade comprada (R$/KG), preservado para leitura humana. */
  unitPrice: number;
  totalPrice: number;
  /**
   * Preço por unidade base (R$/G) — `totalPrice / quantityBase`. É o único
   * número que permite comparar uma compra em KG com outra em G.
   */
  unitCostBase: number;
  batch: string | null;
  expiresAt: string | null;
  /** Movimentação gerada na confirmação. Nulo enquanto a compra é rascunho. */
  movementId: string | null;
  createdAt: string;
  supply: { id: string; name: string; baseUnit: { code: string } };
  unit: { id: string; code: string; name: string };
}

export interface Purchase {
  id: string;
  userId: string;
  supplierId: string | null;
  documentNumber: string | null;
  issuedAt: string;
  notes: string | null;
  /** Soma dos itens, calculada pela API — nunca informada pelo cliente. */
  totalAmount: number;
  status: PurchaseStatus;
  confirmedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: { id: string; name: string } | null;
  items: PurchaseItem[];
}

export interface PurchasesResponse {
  items: Purchase[];
  total: number;
  limit: number;
  offset: number;
}
