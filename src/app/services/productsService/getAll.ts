import { MenuProduct } from "../../../types/MenuProduct";
import { httpClient } from "../httpClient";

/**
 * `MenuProduct` e não `Product`: o tipo `Product` descreve o **formulário** de
 * cadastro (`imagePath: File`, `price: string`, `category: string`), e usá-lo
 * aqui fazia a lista prometer campos que a API não devolve — era a origem dos
 * erros de `product.category.icon` na tabela do cardápio.
 */
export async function getAll() {
  const { data } = await httpClient.get<MenuProduct[]>('/products');

  return data;
}
