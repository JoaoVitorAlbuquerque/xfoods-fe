import { SupplyDetail } from "../../../types/Stock";
import { httpClient } from "../httpClient";

export async function getById(supplyId: string) {
  const { data } = await httpClient.get<SupplyDetail>(`/supplies/${supplyId}`);

  return data;
}
