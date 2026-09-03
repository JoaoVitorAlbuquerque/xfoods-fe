import { SupplyCategory } from "../../../types/Supply";
import { httpClient } from "../httpClient";

type SupplyCategoriesResponse = Array<SupplyCategory>;

export async function getAll() {
  const { data } = await httpClient.get<SupplyCategoriesResponse>('/supply-categories');

  return data;
}
