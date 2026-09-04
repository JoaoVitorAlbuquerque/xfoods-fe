import { RecipeListItem, SizeType } from "../../../types/Recipe";
import { httpClient } from "../httpClient";

export interface RecipeItemParams {
  /** Informe `supplyId` OU `subRecipeId`, nunca os dois. */
  supplyId?: string;
  subRecipeId?: string;
  /** Quantidade líquida — o que a receita de fato usa. */
  quantity: string;
  /** Sigla da unidade, da mesma grandeza da base do insumo ou do rendimento. */
  unit: string;
  /** Perda de preparo em %: quanto se perde do que entra. */
  wastePercent?: string;
  notes?: string;
}

export interface RecipeSizeFactorParams {
  size: SizeType;
  factor: string;
}

export interface CreateRecipeParams {
  /** Ausente cria uma sub-receita, que existe para ser usada em outras fichas. */
  productId?: string;
  name?: string;
  yieldQuantity?: string;
  yieldUnit?: string;
  /**
   * Insumo onde o subproduto é estocado. Informar transforma a sub-receita em
   * item PRODUZIDO: ela ganha saldo próprio, as fichas que a usam consomem esse
   * saldo em vez de desdobrar até os ingredientes, e quem repõe é a ordem de
   * produção. `null` desfaz isso e a sub-receita volta a ser só composição de
   * custo; ausente mantém o que está gravado.
   */
  outputSupplyId?: string | null;
  notes?: string;
  activate?: boolean;
  items: RecipeItemParams[];
  /** Informado substitui a tabela inteira; ausente mantém a atual. */
  sizeFactors?: RecipeSizeFactorParams[];
}

/**
 * `productId` não entra na edição: mover uma ficha de prato reinterpretaria o
 * histórico de custo já calculado com ela.
 */
export type UpdateRecipeParams = Omit<CreateRecipeParams, 'productId' | 'activate' | 'items'> & {
  id: string;
  items?: RecipeItemParams[];
};

/**
 * A resposta das rotas de escrita é a ficha crua (com `sizeFactors` e
 * `outputSupplyId`), diferente do formato com custo que a leitura devolve.
 */
type RawRecipeResponse = RecipeListItem;

export async function create(params: CreateRecipeParams) {
  const { data } = await httpClient.post<RawRecipeResponse>('/recipes', params);

  return data;
}

export async function update({ id, ...params }: UpdateRecipeParams) {
  const { data } = await httpClient.put<RawRecipeResponse>(`/recipes/${id}`, params);

  return data;
}

/** Copia a ficha numa versão nova e inativa. A original fica intacta. */
export async function newVersion({ id, ...params }: UpdateRecipeParams) {
  const { data } = await httpClient.post<RawRecipeResponse>(
    `/recipes/${id}/new-version`,
    params,
  );

  return data;
}

/** Passa a valer para novas vendas e desativa as outras versões do prato. */
export async function activate(recipeId: string) {
  const { data } = await httpClient.patch<RawRecipeResponse>(
    `/recipes/${recipeId}/activate`,
  );

  return data;
}

export async function deactivate(recipeId: string) {
  const { data } = await httpClient.patch<RawRecipeResponse>(
    `/recipes/${recipeId}/deactivate`,
  );

  return data;
}
