import { Supplier } from "../../../types/Supplier";
import { httpClient } from "../httpClient";

export interface UpdateSupplierParams {
  id: string;
  name?: string;
  document?: string;
  phone?: string;
  email?: string;
  notes?: string;
  active?: boolean;
}

export async function update({ id, ...params }: UpdateSupplierParams) {
  const { data } = await httpClient.put<Supplier>(`/suppliers/${id}`, params);

  return data;
}
