import { httpClient } from "../httpClient";

export async function remove(leadId: string) {
  const { data } = await httpClient.delete(`/leads/${leadId}`);

  return data;
}
