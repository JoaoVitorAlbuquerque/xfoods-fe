export type StockCountStatus = 'OPEN' | 'APPLIED' | 'CANCELED';

export const stockCountStatusLabels: Record<StockCountStatus, string> = {
  OPEN: 'Aberto',
  APPLIED: 'Aplicado',
  CANCELED: 'Cancelado',
};

export const stockCountStatusClasses: Record<StockCountStatus, string> = {
  OPEN: 'bg-yellow-100 text-yellow-900',
  APPLIED: 'bg-green-100 text-green-900',
  CANCELED: 'bg-gray-100 text-gray-400',
};

export interface StockCountItem {
  id: string;
  stockCountId: string;
  supplyId: string;
  unitId: string;
  countedQuantity: number;
  countedQuantityBase: number;
  /** Preenchidos só na aplicação: o saldo pode mudar entre contar e aplicar. */
  systemQuantityBase: number | null;
  differenceBase: number | null;
  movementId: string | null;
  createdAt: string;
  supply: { id: string; name: string };
  unit: { code: string };
}

export interface StockCount {
  id: string;
  userId: string;
  status: StockCountStatus;
  note: string | null;
  countedAt: string;
  appliedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: StockCountItem[];
}

export interface StockCountListItem {
  id: string;
  userId: string;
  status: StockCountStatus;
  note: string | null;
  countedAt: string;
  appliedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { items: number };
}
