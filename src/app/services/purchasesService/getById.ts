import { Purchase } from "../../../types/Purchase";
import { httpClient } from "../httpClient";

export async function getById(purchaseId: string) {
  const { data } = await httpClient.get<Purchase>(`/purchases/${purchaseId}`);

  return data;
}
