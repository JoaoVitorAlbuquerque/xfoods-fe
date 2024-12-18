import { Order } from "../../../types/Order";
import { httpClient } from "../httpClient";

export interface UpdateOrdersParams {
  table: number | undefined;
  paid: boolean;
  orderIds: Order[] | null;
}

export async function updatePaid({ orderIds, table, paid }: UpdateOrdersParams) {
  const orderIdsGrouped = orderIds?.map(orderId => orderId.id);
  console.log('UpdatePaid', { orderIdsGrouped, table, paid });

  const { data } = await httpClient.patch(`/orders/paid`, { orderIds: orderIdsGrouped, table, paid });
  console.log({ data });

  return data;
}
