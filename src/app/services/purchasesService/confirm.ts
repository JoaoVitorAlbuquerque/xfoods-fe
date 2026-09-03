import { Purchase } from "../../../types/Purchase";
import { httpClient } from "../httpClient";

/**
 * Entrada no estoque, custo atual do insumo e linha no histórico de custo —
 * tudo em uma transação. É irreversível: cancelar depois devolve 409.
 */
export async function confirm(purchaseId: string) {
  const { data } = await httpClient.patch<Purchase>(`/purchases/${purchaseId}/confirm`);

  return data;
}
