import { httpClient } from "../httpClient";

export async function getOrdersByLead(leadId: string) {
  const { data } = await httpClient.get(`/orders/dashboard/${leadId}`);

  return data;
}
