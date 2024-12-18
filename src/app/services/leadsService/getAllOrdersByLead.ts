import { Lead } from "../../../types/Lead";

import { httpClient } from "../httpClient";

type LeadsResponse = Array<Lead>;

export async function getAllOrdersByLead(leadId: string) {
  console.log('LeadId', { leadId });
  const { data } = await httpClient.get<LeadsResponse>(`/leads/${leadId}/orders`);

  return data;
}
