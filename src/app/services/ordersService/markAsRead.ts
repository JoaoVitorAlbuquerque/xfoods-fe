import { httpClient } from "../httpClient";

/**
 * Marca o pedido como lido/entregue.
 *
 * A rota é **de mão única**: ela grava `read: true` e ignora qualquer corpo —
 * não existe caminho para desmarcar. Por isso a tela confirma antes de chamar,
 * em vez de tratar o botão como um interruptor.
 */
export async function markAsRead(orderId: string) {
  await httpClient.patch(`/orders/${orderId}/read`);
}
