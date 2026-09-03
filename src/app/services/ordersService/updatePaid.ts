import { Order } from "../../../types/Order";
import { PaidResult } from "../../../types/OrderStock";
import { httpClient } from "../httpClient";

export interface UpdateOrdersParams {
  table: number | undefined;
  paid: boolean;
  orderIds: Order[] | null;
}

/**
 * Fechar a conta agora dá baixa no estoque na mesma transação. O retorno traz
 * quantas movimentações foram geradas e os alertas do que ficou sem consumo —
 * e um 409 significa que o pagamento NÃO foi confirmado.
 */
export async function updatePaid({ orderIds, table, paid }: UpdateOrdersParams) {
  const orderIdsGrouped = orderIds?.map(orderId => orderId.id);

  const { data } = await httpClient.patch<PaidResult>('/orders/paid', {
    orderIds: orderIdsGrouped,
    table,
    paid,
  });

  return data;
}
