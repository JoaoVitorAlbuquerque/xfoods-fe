import { Supplier } from "../../../types/Supplier";
import { httpClient } from "../httpClient";

export interface CreateSupplierParams {
  name: string;
  document?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export async function create(params: CreateSupplierParams) {
  const { data } = await httpClient.post<Supplier>('/suppliers', params);

  return data;
}
