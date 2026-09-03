import { SupplyCategory } from "../../../types/Supply";
import { httpClient } from "../httpClient";

export interface UpdateSupplyCategoryParams {
  id: string;
  name?: string;
  active?: boolean;
}

export async function update({ id, ...params }: UpdateSupplyCategoryParams) {
  const { data } = await httpClient.put<SupplyCategory>(`/supply-categories/${id}`, params);

  return data;
}
