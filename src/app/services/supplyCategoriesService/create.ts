import { SupplyCategory } from "../../../types/Supply";
import { httpClient } from "../httpClient";

export interface CreateSupplyCategoryParams {
  name: string;
}

export async function create(params: CreateSupplyCategoryParams) {
  const { data } = await httpClient.post<SupplyCategory>('/supply-categories', params);

  return data;
}
