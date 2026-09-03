import { UnitKind } from './MeasurementUnit';

export type RecipeType = 'PRODUCT' | 'SUB';

export type SizeType = 'TINY' | 'SMALL' | 'MEAN' | 'LARGE' | 'EXTRA_LARGE' | 'METER';

export const sizeTypes: SizeType[] = [
  'TINY',
  'SMALL',
  'MEAN',
  'LARGE',
  'EXTRA_LARGE',
  'METER',
];

export const sizeTypeLabels: Record<SizeType, string> = {
  TINY: 'Broto',
  SMALL: 'Pequena',
  MEAN: 'Média',
  LARGE: 'Grande',
  EXTRA_LARGE: 'Gigante',
  METER: 'Metro',
};

/** Como vem em `GET /recipes` — lista enxuta, sem custo calculado. */
export interface RecipeListItem {
  id: string;
  userId: string;
  productId: string | null;
  name: string | null;
  version: number;
  active: boolean;
  yieldQuantity: number;
  yieldUnitId: string | null;
  outputSupplyId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  product: { id: string; name: string } | null;
  yieldUnit: { code: string } | null;
  _count: { items: number };
}

/**
 * De onde vem o custo da linha:
 * - `SUPPLY` — insumo direto;
 * - `SUB_RECIPE` — sub-receita desdobrada até os insumos dela;
 * - `SUB_RECIPE_STOCKED` — sub-receita com insumo de saída: custa o que custou
 *   produzi-la, e o desdobramento para ali.
 */
export type RecipeLineType = 'SUPPLY' | 'SUB_RECIPE' | 'SUB_RECIPE_STOCKED';

export interface RecipeCostLine {
  id: string;
  type: RecipeLineType;
  supplyId?: string;
  subRecipeId?: string;
  name: string;
  quantity: number;
  /** Sigla da unidade escrita na ficha. */
  unit: string;
  /** Quantidade líquida, já convertida para a unidade base do insumo. */
  quantityBase: number;
  wastePercent: number;
  /** Quantidade bruta: líquida ÷ (1 − perda). É o que sai do estoque. */
  effectiveQuantity: number;
  unitCost: number;
  totalCost: number;
  notes: string | null;
}

/**
 * Como vem em `GET /recipes/:id` e `GET /recipes/product/:id/active`.
 *
 * Atenção: esta resposta é montada pelo cálculo de custo e **não traz
 * `sizeFactors` nem `outputSupplyId`** — só as rotas de escrita devolvem a
 * ficha crua com esses campos.
 */
export interface RecipeDetail {
  id: string;
  productId: string | null;
  product: { id: string; name: string; price: number } | null;
  name: string | null;
  version: number;
  active: boolean;
  yieldQuantity: number;
  yieldUnit: { id: string; code: string; name: string; kind: UnitKind } | null;
  notes: string | null;
  items: RecipeCostLine[];
  directCost: number;
  costPerYieldUnit: number;
  /** A ficha usa insumo nunca comprado: o custo está subestimado. */
  hasMissingCost: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeCostReportItem {
  productId: string | null;
  productName: string | undefined;
  recipeId: string;
  version: number;
  sellingPrice: number | null;
  directCost: number;
  costPerYieldUnit: number;
  hasMissingCost: boolean;
}

export interface RecipeCostReport {
  items: RecipeCostReportItem[];
  summary: { total: number; withMissingCost: number };
}

export interface MissingRecipesResponse {
  items: { id: string; name: string; price: number }[];
  summary: {
    withoutRecipe: number;
    totalProducts: number;
    /** Nulo quando não há nenhum produto cadastrado. */
    coveragePercent: number | null;
  };
}
