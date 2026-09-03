import { UnitKind } from './MeasurementUnit';

/** Situação de estoque, na ordem de gravidade que o painel usa para ordenar. */
export type StockStatus = 'NEGATIVE' | 'ZERO' | 'LOW' | 'OVER' | 'OK';

export const stockStatusLabels: Record<StockStatus, string> = {
  NEGATIVE: 'Negativo',
  ZERO: 'Zerado',
  LOW: 'Abaixo do mínimo',
  OVER: 'Acima do máximo',
  OK: 'Normal',
};

export const stockStatusClasses: Record<StockStatus, string> = {
  NEGATIVE: 'bg-red-100 text-red-900',
  ZERO: 'bg-red-50 text-red-800',
  LOW: 'bg-yellow-100 text-yellow-900',
  OVER: 'bg-blue-50 text-blue-800',
  OK: 'bg-gray-100 text-gray-400',
};

export interface SupplyCategory {
  id: string;
  userId: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  /** Quantos insumos estão classificados nesta categoria. */
  _count: { supplies: number };
}

export interface SupplyBaseUnit {
  id: string;
  code: string;
  name: string;
  kind: UnitKind;
}

export interface Supply {
  id: string;
  userId: string;
  supplyCategoryId: string | null;
  baseUnitId: string;
  name: string;
  description: string | null;
  currentStock: number;
  minStock: number;
  /** Nulo quando o insumo não acompanha máximo. */
  maxStock: number | null;
  averageCost: number;
  lastCost: number | null;
  lastPurchaseAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string } | null;
  baseUnit: SupplyBaseUnit;
  stockStatus: StockStatus;
  needsAttention: boolean;
  /** Quanto falta para voltar ao mínimo. Zero quando não há falta. */
  shortfall: number;
}
