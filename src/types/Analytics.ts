import { PriceStatus } from './Pricing';
import { StockOverviewItem } from './Stock';
import { StockMovementType } from './StockMovement';
import { CostVariationItem, CostVariationReport } from './SupplyCost';

export interface AnalyticsPeriod {
  from: string;
  to: string;
}

/**
 * Quanto do custo direto está de fato medido (regra 4.2).
 *
 * Vendas anteriores à baixa automática e pratos sem ficha não têm custo
 * congelado. Abaixo de 100% de cobertura, o custo está subestimado e a margem,
 * superestimada — por isso este bloco anda colado na margem, nunca escondido.
 */
export interface DataQuality {
  itemsWithCostSnapshot: number;
  itemsWithoutCostSnapshot: number;
  unitsWithoutCostSnapshot: number;
  /** `null` quando não houve venda no período: não há o que cobrir. */
  costCoveragePercent: number | null;
  warning: string | null;
}

/** Os percentuais gravados na formação de preço, usados nos painéis. */
export interface AnalyticsPercentages {
  marginPercent: number;
  taxPercent: number;
  cardFeePercent: number;
  deliveryFeePercent: number;
  otherFeesPercent: number;
}

/**
 * Quanto da despesa do período as vendas absorveram.
 *
 * Ratear R$ 3 por unidade esperando 3.000 vendas e vender 2.000 deixa R$ 3.000
 * sem absorver — despesa real que não entra no custo de produto nenhum. Sem
 * este número, o lucro do painel parece maior que o do caixa.
 */
export interface IndirectAbsorption {
  incurred: number;
  absorbed: number;
  /** Positivo: despesa que nenhuma venda pagou. Negativo: rateio sobrando. */
  unabsorbed: number;
  costPerUnit: number | null;
}

/** Receita menos custo, imposto e taxa — a mesma conta da formação de preço. */
export interface PeriodEconomics {
  revenue: number;
  directCost: number;
  indirectCost: number;
  totalCost: number;
  taxes: number;
  fees: number;
  profit: number;
  marginPercent: number | null;
}

export interface AnalyticsOverview {
  period: AnalyticsPeriod;
  revenue: number;
  directCost: number;
  indirectCost: number;
  totalCost: number;
  taxes: number;
  fees: number;
  estimatedProfit: number;
  marginPercent: number | null;
  unitsSold: number;
  stock: {
    value: number;
    negative: number;
    zero: number;
    low: number;
  };
  waste: {
    /** Só perdas lançadas. O desvio não explicado é outra pergunta. */
    registeredLossCost: number;
    consumptionCost: number;
    lossShareOfConsumptionPercent: number | null;
  };
  indirectAbsorption: IndirectAbsorption;
  percentages: AnalyticsPercentages;
  dataQuality: DataQuality;
  caveats: string[];
}

export type ProductRankBy =
  | 'REVENUE'
  | 'PROFIT'
  | 'MARGIN_HIGH'
  | 'MARGIN_LOW'
  | 'COST'
  | 'QUANTITY';

export const productRankings: ProductRankBy[] = [
  'REVENUE',
  'PROFIT',
  'MARGIN_HIGH',
  'MARGIN_LOW',
  'COST',
  'QUANTITY',
];

export const productRankingLabels: Record<ProductRankBy, string> = {
  REVENUE: 'Mais faturam',
  PROFIT: 'Mais lucram',
  MARGIN_HIGH: 'Maior margem',
  MARGIN_LOW: 'Menor margem',
  COST: 'Mais custam',
  QUANTITY: 'Mais vendem',
};

/**
 * Os rankings **discordam entre si de propósito**: o prato que mais fatura
 * raramente é o que mais lucra. A explicação de cada um vale na tela.
 */
export const productRankingHints: Record<ProductRankBy, string> = {
  REVENUE: 'Soma do que entrou. Não diz quanto sobrou.',
  PROFIT: 'O que sobrou depois de custo, imposto e taxa. É a lista do caixa.',
  MARGIN_HIGH: 'Quanto do preço vira lucro. Um prato barato pode liderar aqui.',
  MARGIN_LOW: 'Onde a margem aperta. Vale olhar antes de reajustar preço.',
  COST: 'Onde o dinheiro do insumo está indo, vendendo bem ou não.',
  QUANTITY: 'Volume de saída. É o que puxa a fila da cozinha.',
};

export interface ProductRankingItem {
  productId: string;
  productName: string;
  categoryId: string | null;
  categoryName: string | null;
  /** Preço de tabela hoje — não o preço médio praticado no período. */
  currentPrice: number;
  items: number;
  units: number;
  itemsWithoutCostSnapshot: number;
  unitsWithoutCostSnapshot: number;
  revenue: number;
  directCost: number;
  indirectCost: number;
  totalCost: number;
  taxes: number;
  fees: number;
  profit: number;
  marginPercent: number | null;
  pricePerUnit: number | null;
  directCostPerUnit: number | null;
  indirectCostPerUnit: number;
  totalCostPerUnit: number | null;
  profitPerUnit: number | null;
  dataQuality: DataQuality;
}

export interface ProductRankingResponse {
  period: AnalyticsPeriod;
  rankBy: ProductRankBy;
  items: ProductRankingItem[];
  total: number;
  limit: number;
  offset: number;
  percentages: AnalyticsPercentages;
  indirectCostPerUnit: number | null;
  notes: string[];
  caveats: string[];
}

/**
 * `REALIZED` é o custo congelado na venda; `CURRENT_RECIPE`, o recalculado pela
 * ficha de hoje (regra 4.7). São números diferentes e não podem se misturar.
 */
export type CostBasis = 'REALIZED' | 'CURRENT_RECIPE';

export const costBasisLabels: Record<CostBasis, string> = {
  REALIZED: 'Custo realizado',
  CURRENT_RECIPE: 'Custo atual da ficha',
};

export const costBasisHints: Record<CostBasis, string> = {
  REALIZED:
    'Congelado nas vendas do período: é o que o prato custou quando foi vendido.',
  CURRENT_RECIPE:
    'Sem venda no período, a base é a ficha com o preço de insumo de hoje.',
};

export interface UnitEconomics {
  costBasis: CostBasis;
  price: number;
  directCost: number;
  indirectCost: number;
  totalCost: number;
  taxes: number;
  fees: number;
  profit: number;
  marginPercent: number | null;
}

export interface ProductAnalytics {
  period: AnalyticsPeriod;
  productId: string;
  productName: string;
  currentPrice: number | null;
  /** `null` quando o prato não tem ficha ativa: não há preço a recomendar. */
  recommendedPrice: number | null;
  priceStatus: PriceStatus | null;
  priceAlert: string | null;
  sales: {
    unitsSold: number;
    revenue: number;
    items: number;
  };
  unitEconomics: UnitEconomics | null;
  periodTotals: PeriodEconomics | null;
  percentages: AnalyticsPercentages;
  dataQuality: DataQuality | null;
  caveats: string[];
}

export interface AlertsThresholds {
  highCostPercentOfPrice: number;
  costIncreasePercent: number;
  wasteCost: number;
  note: string;
}

export interface SupplyMovementTotal {
  supplyId: string;
  supplyName: string;
  baseUnit: string;
  /** Já invertido pela API: positivo é consumo. */
  quantityBase: number;
  cost: number;
  movements: number;
}

export interface MovementTypeTotal {
  type: StockMovementType;
  quantityBase: number;
  cost: number;
  movements: number;
}

export interface AnalyticsAlerts {
  period: AnalyticsPeriod;
  thresholds: AlertsThresholds;
  /** Margem REALIZADA abaixo da desejada: olha o que já foi vendido. */
  productsBelowTargetMargin: {
    productId: string;
    productName: string;
    marginPercent: number;
    targetMarginPercent: number;
    unitsSold: number;
    revenue: number;
  }[];
  /** Tabela de preços contra o custo de HOJE. Não é o mesmo alerta do anterior. */
  productsBelowRecommendedPrice: {
    productId: string;
    productName: string;
    currentPrice: number;
    recommendedPrice: number;
    difference: number;
    status: PriceStatus;
  }[];
  productsWithoutRecipe: { id: string; name: string; price: number }[];
  productsWithHighCost: {
    productId: string;
    productName: string;
    fullCost: number;
    currentPrice: number;
    costShareOfPricePercent: number;
  }[];
  suppliesWithCostIncrease: CostVariationItem[];
  suppliesWithHighWaste: SupplyMovementTotal[];
  summary: {
    belowTargetMargin: number;
    belowRecommendedPrice: number;
    withoutRecipe: number;
    highCost: number;
    costIncrease: number;
    highWaste: number;
  };
  notes: string[];
}

export interface StockDashboard {
  period: AnalyticsPeriod;
  totalValue: number;
  counts: {
    supplies: number;
    belowMinimum: number;
    zero: number;
    negative: number;
    overMaximum: number;
  };
  alerts: StockOverviewItem[];
  topConsumption: SupplyMovementTotal[];
  topLosses: SupplyMovementTotal[];
  consumptionByMovementType: MovementTypeTotal[];
}

export interface CostDashboard {
  period: AnalyticsPeriod;
  totalCost: number;
  directCost: number;
  indirectCost: number;
  averageCostPerUnit: number | null;
  averageDirectCostPerUnit: number | null;
  /**
   * Comparação em dinheiro entre o que as fichas previam e o que saiu do
   * estoque. A diferença é desvio, **não** desperdício (regra 4.6).
   */
  estimatedVsReal: {
    estimatedConsumptionCost: number;
    realConsumptionCost: number;
    deviationCost: number;
    deviationPercent: number | null;
    byMovementType: MovementTypeTotal[];
    note: string;
  };
  waste: {
    registeredLossCost: number;
    shareOfConsumptionPercent: number | null;
  };
  costVariation: {
    summary: CostVariationReport['summary'];
    topIncreases: CostVariationItem[];
  };
  indirectAbsorption: IndirectAbsorption;
  percentages: AnalyticsPercentages;
  dataQuality: DataQuality;
  caveats: string[];
}
