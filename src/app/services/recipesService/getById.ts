import { RecipeDetail } from "../../../types/Recipe";
import { httpClient } from "../httpClient";

/** Ficha com o custo já calculado pela API. */
export async function getById(recipeId: string) {
  const { data } = await httpClient.get<RecipeDetail>(`/recipes/${recipeId}`);

  return data;
}
