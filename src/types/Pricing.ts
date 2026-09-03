/**
 * Formação de preço.
 *
 * Nenhuma rota deste módulo escreve em `products.price`: a API calcula e
 * compara, e aplicar o preço é decisão de quem vende (regra 4.3).
 */

export type PriceStatus =
  | 'ABAIXO_DO_CUSTO'
  | 'ABAIXO_DO_RECOMENDADO'
  | 'NO_RECOMENDADO'
  | 'ACIMA_DO_RECOMENDADO';

export const priceStatuses: PriceStatus[] = [
  'ABAIXO_DO_CUSTO',
  'ABAIXO_DO_RECOMENDADO',
  'NO_RECOMENDADO',
  'ACIMA_DO_RECOMENDADO',
];

export const priceStatusLabels: Record<PriceStatus, string> = {
  ABAIXO_DO_CUSTO: 'Abaixo do custo',
  ABAIXO_DO_RECOMENDADO: 'Abaixo do recomendado',
  NO_RECOMENDADO: 'No recomendado',
  ACIMA_DO_RECOMENDADO: 'Acima do recomendado',
};

/**
 * `ABAIXO_DO_CUSTO` é um problema de outra natureza: não é margem apertada, é
 * prejuízo por venda. Por isso ele é o único em vermelho.
 */
export const priceStatusClasses: Record<PriceStatus, string> = {
  ABAIXO_DO_CUSTO: 'bg-red-100 text-red-900',
  ABAIXO_DO_RECOMENDADO: 'bg-yellow-100 text-yellow-900',
  NO_RECOMENDADO: 'bg-green-100 text-green-800',
  ACIMA_DO_RECOMENDADO: 'bg-gray-500/20 text-gray-500',
};

export type RoundingStrategy =
  | 'NEAREST_10_CENTS'
  | 'ENDING_90'
  | 'ENDING_99'
  | 'WHOLE_UP';

/** `false` significa "ninguém configurou ainda", não "tudo zerado". */
export interface PricingSettings {
  desiredMarginPercent: number;
  taxPercent: number;
  cardFeePercent: number;
  deliveryFeePercent: number;
  otherFeesPercent: number;
  configured: boolean;
  updatedAt: string | null;
}

/** `SETTINGS` veio da configuração gravada; `QUERY`, da própria consulta. */
export type PercentSource = 'SETTINGS' | 'QUERY';

export interface DescribedPercentages {
  marginPercent: number;
  taxPercent: number;
  cardFeePercent: number;
  deliveryFeePercent: number;
  otherFeesPercent: number;
  /** Cartão + entrega + outras. A API soma as três: precifica o canal mais caro. */
  feesPercent: number;
  /** Impostos + taxas + margem. Em 100% ou mais não existe preço possível. */
  totalPercent: number;
  source: Record<string, PercentSource>;
}

/** Onde cada real do preço vai parar. As parcelas somam exatamente o preço. */
export interface PricingBreakdown {
  price: number;
  cost: number;
  taxes: number;
  fees: number;
  profit: number;
  /** Lucro sobre o preço — a mesma base da margem desejada. */
  marginPercent: number | null;
  /** Quanto o preço supera o custo. Outra pergunta, outra base. */
  markupOverCostPercent: number | null;
}

export interface RoundingSuggestion {
  strategy: RoundingStrategy;
  label: string;
  price: number;
  differenceFromRecommended: number;
  /** A margem que este preço realmente entrega — sem ela a escolha é estética. */
  marginPercent: number | null;
  profit: number;
}

export interface PricedProduct {
  productId: string;
  productName: string;
  fullCost: number;
  currentPrice: number | null;
  recommendedPrice: number;
  /** Preço atual menos recomendado. `null` quando o prato não tem preço. */
  difference: number | null;
  status: PriceStatus;
  alert: string | null;
  currentMarginPercent: number | null;
  targetMarginPercent: number;
  /** Insumo nunca comprado deixa o custo subestimado e o preço, junto. */
  hasMissingCost: boolean;
}

export interface PricingProductsResponse {
  period: { from: string; to: string };
  percentages: DescribedPercentages;
  items: PricedProduct[];
  summary: {
    products: number;
    belowCost: number;
    belowRecommended: number;
    atOrAbove: number;
    /** Lucro por unidade que os preços abaixo do recomendado deixam na mesa. */
    gapPerUnit: number;
    productsWithoutRecipe: { id: string; name: string; price: number }[];
    withMissingSupplyCost: number;
  };
  notes: string[];
  caveats: string[];
}

export interface PricingProductDetail extends PricedProduct {
  period: { from: string; to: string };
  percentages: DescribedPercentages;
  cost: {
    directCost: number;
    indirectCost: number;
    fullCost: number;
  };
  profitability: {
    /** `null` quando o prato não tem preço cadastrado. */
    atCurrentPrice: PricingBreakdown | null;
    atRecommendedPrice: PricingBreakdown;
  };
  roundingSuggestions: RoundingSuggestion[];
  notes: string[];
  caveats: string[];
}

export interface PricingScenario {
  marginPercent: number;
  /** `null` quando a combinação é inviável — a linha volta com o motivo. */
  price: number | null;
  profit: number | null;
  taxes: number | null;
  fees: number | null;
  /** A margem obtida depois de arredondar ao centavo. */
  effectiveMarginPercent: number | null;
  markupOverCostPercent: number | null;
  viable: boolean;
  reason: string | null;
}

export interface PricingSimulation {
  period: { from: string; to: string };
  /** `null` quando a simulação partiu de um custo avulso. */
  product: { id: string; name: string } | null;
  cost: number;
  percentages: DescribedPercentages;
  scenarios: PricingScenario[];
  notes: string[];
  caveats: string[];
}
