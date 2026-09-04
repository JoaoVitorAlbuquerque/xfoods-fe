import { MenuProduct } from "../../../types/MenuProduct";
import { httpClient } from "../httpClient";

/**
 * A rota é mesmo `/products/:categoryId/categories` — o parâmetro vem antes do
 * segmento, ao contrário do resto da API.
 */
export async function getByCategory(categoryId: string) {
  const { data } = await httpClient.get<MenuProduct[]>(
    `/products/${categoryId}/categories`,
  );

  return data;
}
