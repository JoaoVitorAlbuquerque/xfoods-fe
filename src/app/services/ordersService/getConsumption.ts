import { OrderConsumption } from "../../../types/OrderStock";
import { httpClient } from "../httpClient";

/** O que esta venda tirou do estoque, o que voltou e o saldo líquido por insumo. */
export async function getConsumption(orderId: string) {
  const { data } = await httpClient.get<OrderConsumption>(`/orders/${orderId}/consumption`);

  return data;
}
