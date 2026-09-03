import { Supplier } from "../../../types/Supplier";
import { httpClient } from "../httpClient";

export interface GetAllSuppliersParams {
  search?: string;
}

type SuppliersResponse = Array<Supplier>;

export async function getAll(params?: GetAllSuppliersParams) {
  const { data } = await httpClient.get<SuppliersResponse>('/suppliers', { params });

  return data;
}
