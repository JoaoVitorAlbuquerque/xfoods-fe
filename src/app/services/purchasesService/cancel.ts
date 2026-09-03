import { Purchase } from "../../../types/Purchase";
import { httpClient } from "../httpClient";

/** Só rascunho pode ser cancelado; compra confirmada devolve 409. */
export async function cancel(purchaseId: string) {
  const { data } = await httpClient.patch<Purchase>(`/purchases/${purchaseId}/cancel`);

  return data;
}
