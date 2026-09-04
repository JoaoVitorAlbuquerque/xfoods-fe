export interface Order {
  id: string;
  table: number;
  name?: string;
  status: 'WAITING' | 'IN_PRODUCTION' | 'DONE' | 'CANCELED';
  description?: string;
  createdAt: string,
  paid: boolean;
  /**
   * Marcado quando o pedido é entregue na mesa. `PATCH /orders/:id/read` só
   * grava `true` — não existe rota para voltar atrás.
   */
  read?: boolean;
  paidAt?: string | null;
  /**
   * Cancelar estorna o estoque mas não mexe no pagamento: um pedido cancelado
   * continua com `paid: true`. Não assuma CANCELED ⇒ não pago.
   */
  canceledAt?: string | null;
  products: {
    id: string;
    quantity: number;
    size: string;
    product: {
      id: string; //
      imagePath: string;
      name: string;
      price: number;
      category: {
        name: string;
      };
    };
  }[];
  lead?: {
    id: string,
    name: string;
  },
}
