export type CostSource = 'PURCHASE' | 'MANUAL' | 'ADJUSTMENT' | 'PRODUCTION';

export const costSourceLabels: Record<CostSource, string> = {
  PURCHASE: 'Compra',
  MANUAL: 'Manual',
  ADJUSTMENT: 'Ajuste',
  PRODUCTION: 'Produção',
};

export type CostDirection = 'UP' | 'DOWN' | 'FLAT';

export interface SupplyCostHistoryEntry {
  id: string;
  userId: string;
  supplyId: string;
  unitCostBase: number;
  previousUnitCostBase: number | null;
  /**
   * Congelada na confirmação da compra, não recalculada na leitura.
   * Nula na primeira compra, quando não há contra o que comparar.
   */
  variationPercent: number | null;
  unitPrice: number;
  unitId: string;
  source: CostSource;
  purchaseItemId: string | null;
  supplierId: string | null;
  effectiveAt: string;
  createdAt: string;
  unit: { id: string; code: string; name: string };
  supplier: { id: string; name: string } | null;
  purchaseItem: {
    id: string;
    quantity: number;
    totalPrice: number;
    batch: string | null;
    purchase: { id: string; documentNumber: string | null; issuedAt: string };
  } | null;
}

export interface SupplyCostHistoryResponse {
  supply: {
    id: string;
    name: string;
    baseUnit: { code: string; name: string };
    currentUnitCostBase: number | null;
    costingMethod: string;
  };
  history: SupplyCostHistoryEntry[];
}

export interface CostVariationItem {
  supplyId: string;
  supplyName: string;
  baseUnit: { code: string; name: string };
  currentUnitCostBase: number;
  previousUnitCostBase: number | null;
  currentUnitPrice: number;
  currentPriceUnit: string;
  previousUnitPrice: number | null;
  previousPriceUnit: string | null;
  variationPercent: number | null;
  /** Nulo na primeira compra do insumo — a tela mostra "—", não "0%". */
  direction: CostDirection | null;
  lastPurchaseAt: string;
  previousPurchaseAt: string | null;
  supplier: { id: string; name: string } | null;
  purchaseCount: number;
}

export interface CostVariationReport {
  items: CostVariationItem[];
  summary: {
    total: number;
    increased: number;
    decreased: number;
    unchanged: number;
    firstPurchase: number;
  };
}
