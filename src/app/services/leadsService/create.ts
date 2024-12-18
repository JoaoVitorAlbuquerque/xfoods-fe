import { httpClient } from "../httpClient";

export interface CreateLeadParams {
  name: string;
  phone: string;
  address: string;
  email: string;
}

export async function create(params: CreateLeadParams) {
  const { data } = await httpClient.post('/leads', params);

  return data;
}
