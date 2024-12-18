import { httpClient } from "../httpClient";

// export interface UpdateOrdersParams {
//   orderIds: string[];
//   leadId: string;
// }

export async function associateOrdersWithLead(orderIds: string[] | undefined, leadId: string) {
  const { data } = await httpClient.patch(`/orders/associate-lead`, { orderIds, leadId });

  return data;
}
