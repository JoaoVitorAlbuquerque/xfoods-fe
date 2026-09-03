import { StockMovement, SupplyMovement } from './StockMovement';
import { StockStatus, Supply } from './Supply';
import { UnitKind } from './MeasurementUnit';

/** Detalhe do insumo: o cadastro mais as dez últimas movimentações. */
export interface SupplyDetail extends Supply {
  lastMovements: SupplyMovement[];
}

export interface StockOverviewItem {
  id: string;
  name: string;
  category: { id: string; name: string } | null;
  /** Sem `id` aqui: o overview seleciona menos campos que `/supplies`. */
  baseUnit: { code: string; name: string; kind: UnitKind };
  currentStock: number;
  minStock: number;
  maxStock: number | null;
  averageCost: number;
  stockValue: number;
  stockStatus: StockStatus;
  shortfall: number;
}

export interface StockOverviewSummary {
  total: number;
  negative: number;
  zero: number;
  low: number;
  over: number;
  totalValue: number;
}

export interface StockOverview {
  items: StockOverviewItem[];
  summary: StockOverviewSummary;
}

export interface StockSettings {
  allowNegativeStock: boolean;
  allowSaleWithoutRecipe: boolean;
  stockConsumptionTolerancePercentage: number;
  updatedAt: string | null;
}

export interface StockAdjustmentResult {
  /** Nulo quando não havia diferença: ajuste de zero não vira lançamento. */
  movement: StockMovement | null;
  systemQuantity: number;
  countedQuantity: number;
  difference: number;
  applied: boolean;
}
