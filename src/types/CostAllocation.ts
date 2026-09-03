import { ExpenseRecurrence, ExpenseType } from './Expense';

export type AllocationMethod = 'PER_SOLD_UNIT' | 'BY_REVENUE' | 'MANUAL';

export type AllocationPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export const allocationMethods: AllocationMethod[] = [
  'PER_SOLD_UNIT',
  'BY_REVENUE',
  'MANUAL',
];

export const allocationMethodLabels: Record<AllocationMethod, string> = {
  PER_SOLD_UNIT: 'Por unidade vendida',
  BY_REVENUE: 'Por faturamento',
  MANUAL: 'Manual',
};

/** Só PER_SOLD_UNIT está implementado; os outros devolvem 501 no cálculo. */
export const implementedAllocationMethods: AllocationMethod[] = ['PER_SOLD_UNIT'];

export const allocationPeriods: AllocationPeriod[] = [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY',
];

export const allocationPeriodLabels: Record<AllocationPeriod, string> = {
  DAILY: 'Por dia',
  WEEKLY: 'Por semana',
  MONTHLY: 'Por mês',
  YEARLY: 'Por ano',
};

export interface CostAllocationSettings {
  method: AllocationMethod;
  referencePeriod: AllocationPeriod;
  estimatedSalesUnits: number;
  estimatedRevenue: number;
  includeFixed: boolean;
  includeVariable: boolean;
  updatedAt: string | null;
}

export interface CostAllocation {
  period: { from: string; to: string };
  method: AllocationMethod;
  indirectCost: {
    total: number;
    byCategory: { categoryId: string | null; name: string; total: number }[];
    expenses: {
      expenseId: string;
      description: string;
      category: { id: string; name: string; nature: string } | null;
      type: ExpenseType;
      recurrence: ExpenseRecurrence;
      occurrences: number;
      total: number;
    }[];
  };
  divisor: {
    estimatedSalesUnitsPerPeriod: number;
    referencePeriod: AllocationPeriod;
    referencePeriods: number;
    estimatedSalesUnits: number;
    actualSalesUnits: number;
    actualRevenue: number;
  };
  /** Nulo quando não há divisor: vendas estimadas não configuradas. */
  costPerUnit: number | null;
  /** O mesmo cálculo com o volume que de fato saiu — o teste da estimativa. */
  costPerUnitByActualSales: number | null;
  settings: { includeFixed: boolean; includeVariable: boolean };
  caveats: string[];
}

export interface FullCostItem {
  productId: string | null;
  productName: string;
  recipeId: string;
  recipeVersion: number;
  directCost: number;
  allocatedIndirectCost: number;
  fullCost: number;
  sellingPrice: number | null;
  /** Preço menos custo completo. Descreve o preço atual, não sugere outro. */
  resultPerUnit: number | null;
  fullCostPercentOfPrice: number | null;
  hasMissingCost: boolean;
}

export interface FullCostReport {
  period: { from: string; to: string };
  method: AllocationMethod;
  allocatedIndirectCostPerUnit: number | null;
  items: FullCostItem[];
  summary: {
    products: number;
    indirectCostTotal: number;
    withMissingSupplyCost: number;
    /** Pratos cujo preço atual não cobre o custo completo. */
    belowFullCost: {
      productId: string | null;
      productName: string;
      sellingPrice: number | null;
      fullCost: number;
      resultPerUnit: number | null;
    }[];
    /** Sem ficha ativa não há custo direto, e o completo fica desconhecido. */
    productsWithoutRecipe: { id: string; name: string; price: number }[];
  };
  notes: string[];
}
