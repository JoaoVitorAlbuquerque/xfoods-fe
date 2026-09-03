import { CancelOrderResult } from "../../../types/OrderStock";
import { httpClient } from "../httpClient";

/**
 * Cancela o pedido e estorna o estoque com movimentações RETURN. O pagamento
 * continua marcado: devolver dinheiro é decisão de caixa e o sistema não
 * modela estorno financeiro.
 */
export async function cancel(orderId: string) {
  const { data } = await httpClient.patch<CancelOrderResult>(`/orders/${orderId}/cancel`);

  return data;
}
