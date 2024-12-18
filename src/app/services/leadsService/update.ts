import { httpClient } from "../httpClient";

export interface UpdateLeadsParams {
  id: string;
  name: string;
  number: string;
  address: string;
  email: string;
}

export async function update({id, ...params}: UpdateLeadsParams) {
  const { data } = await httpClient.put(`/leads/${id}`, params);

  return data;
}
