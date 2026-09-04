import { UnitKind } from './MeasurementUnit';

export type ProductionStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELED';

export const productionStatuses: ProductionStatus[] = [
  'DRAFT',
  'CONFIRMED',
  'CANCELED',
];

export const productionStatusLabels: Record<ProductionStatus, string> = {
  DRAFT: 'Rascunho',
  CONFIRMED: 'Confirmado',
  CANCELED: 'Cancelado',
};

export const productionStatusClasses: Record<ProductionStatus, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-900',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELED: 'bg-gray-500/20 text-gray-400',
};

/** Rascunho não encosta no estoque; confirmado já mexeu e não volta atrás. */
export const productionStatusHints: Record<ProductionStatus, string> = {
  DRAFT: 'Ainda não encostou no estoque. Pode ser confirmado ou cancelado.',
  CONFIRMED: 'Os ingredientes saíram e o subproduto entrou. As movimentações são históricas.',
  CANCELED: 'Descartado antes de mexer no estoque.',
};

export interface ProductionUnit {
  id: string;
  code: string;
  name: string;
  kind: UnitKind;
  factorToBase: number;
}

export interface ProductionOrderItem {
  id: string;
  productionOrderId: string;
  supplyId: string;
  unitId: string;
  quantity: number;
  /** Na unidade base do próprio ingrediente — cada um tem a sua. */
  quantityBase: number;
  unitCost: number;
  totalCost: number;
  /** Saída gerada na confirmação. Nula enquanto o lote é rascunho. */
  movementId: string | null;
  createdAt: string;
  supply: { id: string; name: string };
  unit: { code: string };
}

export interface ProductionOrder {
  id: string;
  userId: string;
  recipeId: string;
  outputSupplyId: string;
  status: ProductionStatus;
  /** Quantas vezes a receita foi executada. Dobrar dobra tudo. */
  batches: number;
  /** Rendimento previsto pela ficha, na unidade base do subproduto. */
  expectedQuantity: number;
  /** O que de fato saiu. É ele que entra no estoque, não o previsto. */
  actualQuantity: number;
  yieldDifference: number;
  yieldPercent: number | null;
  totalCost: number;
  /**
   * Total dividido pelo rendimento REAL. Um lote que rendeu menos carrega o
   * mesmo custo em menos produto — é assim que a perda de produção chega ao
   * preço do prato em vez de sumir.
   */
  unitCost: number;
  notes: string | null;
  producedAt: string;
  confirmedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
  outputMovementId: string | null;
  recipe: {
    id: string;
    name: string | null;
    version: number;
    yieldQuantity: number;
    yieldUnit: ProductionUnit | null;
  };
  outputSupply: {
    id: string;
    name: string;
    currentStock: number;
    baseUnit: ProductionUnit;
  };
  items: ProductionOrderItem[];
}

export interface YieldReportItem {
  productionOrderId: string;
  producedAt: string;
  recipeId: string;
  recipeName: string | null;
  recipeVersion: number;
  outputSupplyId: string;
  outputSupplyName: string;
  baseUnit: string;
  batches: number;
  expectedQuantity: number;
  actualQuantity: number;
  yieldDifference: number;
  yieldPercent: number | null;
  totalCost: number;
  unitCost: number;
}

export interface YieldReport {
  items: YieldReportItem[];
  summary: {
    batches: number;
    expectedQuantity: number;
    actualQuantity: number;
    difference: number;
    yieldPercent: number | null;
    batchesBelowExpected: number;
    /** Custo dos ingredientes que não viraram produto. */
    lostValue: number;
    /**
     * `false` quando os lotes são de subprodutos diferentes: aí a soma de
     * quantidades é a soma de grandezas distintas e não significa nada.
     */
    singleSupply: boolean;
  };
}
