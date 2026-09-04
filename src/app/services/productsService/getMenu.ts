import { MenuProduct } from "../../../types/MenuProduct";
import { httpClient } from "../httpClient";

/**
 * O mesmo `GET /products` de `getAll`, tipado com a resposta real da API para
 * a tela de pedido. A rota já filtra `deleted: false`, então o cardápio nunca
 * traz produto removido.
 */
export async function getMenu() {
  const { data } = await httpClient.get<MenuProduct[]>('/products');

  return data;
}
