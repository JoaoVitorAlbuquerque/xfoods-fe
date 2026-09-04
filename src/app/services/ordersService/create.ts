import { SizeType } from "../../../types/Recipe";
import { Order } from "../../../types/Order";
import { httpClient } from "../httpClient";

export interface CreateParams {
  table: number;
  description?: string;
  products: {
    productId: string;
    size: SizeType;
    quantity: number;
  }[];
}

export interface CreateResponse {
  id: string;
  table: number;
  status: Order['status'];
  description: string | null;
  /**
   * Total congelado pela API: soma `product.price × quantidade`. Ela **não**
   * aplica o acréscimo de tamanho que o cliente mostra no carrinho e nas telas
   * de total (ver `sizePrice.ts`), então este número pode ser menor do que o
   * exibido na comanda.
   */
  totalAmount: number;
  createdAt: string;
}

export async function create(params: CreateParams) {
  const { data } = await httpClient.post<CreateResponse>('/orders', params);

  return data;
}
