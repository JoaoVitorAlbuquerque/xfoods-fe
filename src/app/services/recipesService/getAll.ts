import { RecipeListItem, RecipeType } from "../../../types/Recipe";
import { httpClient } from "../httpClient";

export interface GetAllRecipesParams {
  productId?: string;
  /** PRODUCT traz fichas de prato; SUB traz sub-receitas. */
  type?: RecipeType;
  /** A API espera texto: "true" / "false". */
  active?: 'true' | 'false';
}

type RecipesResponse = Array<RecipeListItem>;

export async function getAll(params?: GetAllRecipesParams) {
  const { data } = await httpClient.get<RecipesResponse>('/recipes', { params });

  return data;
}
