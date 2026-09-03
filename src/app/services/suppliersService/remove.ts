import { httpClient } from "../httpClient";

/**
 * A API desativa em vez de apagar: o fornecedor está amarrado a compras já
 * confirmadas e ao histórico de custo, que precisam continuar dizendo de quem
 * veio cada preço.
 */
export async function remove(supplierId: string) {
  const { data } = await httpClient.delete(`/suppliers/${supplierId}`);

  return data;
}
