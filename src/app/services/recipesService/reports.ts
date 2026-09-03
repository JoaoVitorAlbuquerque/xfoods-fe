import {
  MissingRecipesResponse,
  RecipeCostReport,
  RecipeDetail,
} from "../../../types/Recipe";
import { httpClient } from "../httpClient";

/** Custo direto de todos os pratos com ficha ativa. */
export async function getCostReport() {
  const { data } = await httpClient.get<RecipeCostReport>('/recipes/cost-report');

  return data;
}

/**
 * Produtos vendáveis sem ficha ativa. É o relatório que impede o estoque de
 * mentir em silêncio: o prato vende, nenhum insumo baixa, e o saldo na tela
 * continua batendo enquanto some da prateleira.
 */
export async function getMissing() {
  const { data } = await httpClient.get<MissingRecipesResponse>('/recipes/missing');

  return data;
}

/** Ficha que vale para novas vendas do prato. Devolve 404 quando não há. */
export async function getActiveByProduct(productId: string) {
  const { data } = await httpClient.get<RecipeDetail>(
    `/recipes/product/${productId}/active`,
  );

  return data;
}
