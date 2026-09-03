import { StockMovementType } from './StockMovement';

/**
 * Como o desvio se compara à tolerância de `/stock/settings`.
 *
 * Os nomes vêm em português da própria API: são o vocabulário do relatório.
 */
export type ConsumptionClassification =
  | 'ABAIXO_DO_ESPERADO'
  | 'DENTRO_DA_TOLERANCIA'
  | 'ACIMA_DO_ESPERADO';

export const consumptionClassifications: ConsumptionClassification[] = [
  'ACIMA_DO_ESPERADO',
  'DENTRO_DA_TOLERANCIA',
  'ABAIXO_DO_ESPERADO',
];

export const consumptionClassificationLabels: Record<ConsumptionClassification, string> = {
  ABAIXO_DO_ESPERADO: 'Abaixo do esperado',
  DENTRO_DA_TOLERANCIA: 'Dentro da tolerância',
  ACIMA_DO_ESPERADO: 'Acima do esperado',
};

/** Só o acima do esperado é problema em dinheiro; o abaixo pede outra leitura. */
export const consumptionClassificationClasses: Record<ConsumptionClassification, string> = {
  ABAIXO_DO_ESPERADO: 'bg-blue-100 text-blue-900',
  DENTRO_DA_TOLERANCIA: 'bg-green-100 text-green-800',
  ACIMA_DO_ESPERADO: 'bg-red-100 text-red-900',
};

export type PeriodGrouping = 'DAY' | 'WEEK' | 'MONTH';

export const periodGroupings: PeriodGrouping[] = ['DAY', 'WEEK', 'MONTH'];

export const periodGroupingLabels: Record<PeriodGrouping, string> = {
  DAY: 'Por dia',
  WEEK: 'Por semana',
  MONTH: 'Por mês',
};

/**
 * Janela do relatório. Diferente das competências de despesa, aqui é um
 * intervalo com **hora**: ausente, a API usa os últimos trinta dias até agora.
 */
export interface ConsumptionPeriod {
  from: string;
  to: string;
}

/** O que a consulta de fato aplicou, devolvido para a tela não adivinhar. */
export interface AppliedConsumptionFilters {
  productId: string | null;
  categoryId: string | null;
  supplyId: string | null;
  supplyCategoryId: string | null;
  movementTypes: StockMovementType[];
  /**
   * `ATTRIBUTED_TO_PRODUCTS` quando há filtro de prato ou categoria: perdas e
   * ajustes não têm produto e ficam de fora do real.
   */
  realScope: 'ATTRIBUTED_TO_PRODUCTS' | 'ALL_MOVEMENTS';
}

export interface DeviationCause {
  code: string;
  label: string;
  description: string;
}

/**
 * Regra 4.6: vai em toda resposta e precisa estar na tela. O relatório aponta
 * uma diferença, não um culpado.
 */
export interface ConsumptionInterpretation {
  warning: string;
  possibleCauses: DeviationCause[];
  caveats: string[];
}

/**
 * Separa o desvio no que já tem documento (perda, ajuste, produção,
 * transferência lançados) e no que não tem. `undocumented === 0` significa que
 * o desvio está inteiramente explicado — e a tela deve dizer isso.
 */
export interface DeviationBreakdown {
  documented: number;
  undocumented: number;
}

export interface ConsumptionSupplyRow {
  supplyId: string;
  supplyName: string;
  supplyCategory: string | null;
  baseUnit: string;
  estimatedQuantity: number;
  realQuantity: number;
  /** Real menos estimado. Positivo é consumo além do previsto. */
  difference: number;
  /** `null` quando o estimado é zero: não existe porcentagem de base zero. */
  variationPercent: number | null;
  classification: ConsumptionClassification;
  unitCost: number;
  estimatedCost: number;
  realCost: number;
  differenceCost: number;
  realByMovementType: Partial<Record<StockMovementType, number>>;
  deviationBreakdown: DeviationBreakdown;
}

export interface ConsumptionBySupplyResponse {
  period: ConsumptionPeriod;
  filters: AppliedConsumptionFilters;
  items: ConsumptionSupplyRow[];
  summary: {
    supplies: number;
    /** Vendido sem ficha ativa: consumo previsto zero, desvio puxado para cima. */
    productsWithoutRecipe: { productId: string; name: string }[];
    estimatedCost: number;
    realCost: number;
    differenceCost: number;
    wastePercent: number | null;
    tolerancePercent: number;
    byClassification: Record<ConsumptionClassification, number>;
  };
  interpretation: ConsumptionInterpretation;
}

export interface ConsumptionProductRow {
  productId: string;
  productName: string;
  supplyId: string;
  supplyName: string;
  baseUnit: string;
  quantitySold: number;
  estimatedQuantity: number;
  realQuantity: number;
  difference: number;
  variationPercent: number | null;
  classification: ConsumptionClassification;
  unitCost: number;
  differenceCost: number;
  /**
   * Perda e ajuste não sabem de qual prato vieram: o que é medido e o que é
   * rateado vêm separados para a linha não parecer mais precisa do que é.
   */
  attribution: {
    realAttributed: number;
    allocatedDeviation: number;
    note: string;
  };
}

export interface ConsumptionByProductResponse {
  period: ConsumptionPeriod;
  filters: AppliedConsumptionFilters;
  items: ConsumptionProductRow[];
  summary: {
    products: number;
    rows: number;
    differenceCost: number;
    /** Desvio que não coube em prato nenhum porque nenhuma venda o previa. */
    unallocatedDeviationCost: number;
  };
  interpretation: ConsumptionInterpretation;
}

export interface TopDeviationsResponse {
  period: ConsumptionPeriod;
  filters: AppliedConsumptionFilters;
  tolerancePercent: number;
  items: ConsumptionSupplyRow[];
  interpretation: ConsumptionInterpretation;
}

export interface FinancialLossesResponse {
  period: ConsumptionPeriod;
  filters: AppliedConsumptionFilters;
  items: ConsumptionSupplyRow[];
  summary: { totalLossCost: number };
  interpretation: ConsumptionInterpretation;
}

export interface WasteBucket {
  /** `AAAA-MM-DD` ou `AAAA-MM`, já no fuso local de quem lançou. */
  bucket: string;
  estimatedCost: number;
  realCost: number;
  differenceCost: number;
  wastePercent: number | null;
  costByMovementType: Partial<Record<StockMovementType, number>>;
}

export interface WasteByPeriodResponse {
  period: ConsumptionPeriod;
  filters: AppliedConsumptionFilters;
  groupBy: PeriodGrouping;
  items: WasteBucket[];
  interpretation: ConsumptionInterpretation;
}

export interface ConsumptionDashboardResponse {
  period: ConsumptionPeriod;
  filters: AppliedConsumptionFilters;
  tolerancePercent: number;
  estimatedConsumptionCost: number;
  realConsumptionCost: number;
  /** Saldo líquido: sobra de um insumo abate falta de outro. */
  totalDeviationCost: number;
  deviationCost: {
    aboveExpected: number;
    belowExpected: number;
    /** Bruto, sem compensação: dois desvios opostos são dois problemas. */
    gross: number;
  };
  wastePercent: number | null;
  counts: {
    supplies: number;
    aboveExpected: number;
    withinTolerance: number;
    belowExpected: number;
    productsSold: number;
    productsWithoutRecipe: number;
  };
  interpretation: ConsumptionInterpretation;
}
