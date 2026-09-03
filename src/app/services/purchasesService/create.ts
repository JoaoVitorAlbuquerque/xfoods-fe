import { Purchase } from "../../../types/Purchase";
import { httpClient } from "../httpClient";

export interface CreatePurchaseItemParams {
  supplyId: string;
  quantity: string;
  /** Sigla da unidade comprada — "KG" mesmo que o insumo seja estocado em gramas. */
  unit: string;
  /**
   * Informe `unitPrice` OU `totalPrice`, nunca os dois: a API recusa quando os
   * dois vêm juntos, porque um poderia contradizer o outro. O que faltar é
   * calculado lá.
   */
  unitPrice?: string;
  totalPrice?: string;
  batch?: string;
  expiresAt?: string;
}

export interface CreatePurchaseParams {
  supplierId?: string;
  documentNumber?: string;
  issuedAt?: string;
  notes?: string;
  items: CreatePurchaseItemParams[];
}

/** Cria como rascunho. Nada de estoque acontece até a confirmação. */
export async function create(params: CreatePurchaseParams) {
  const { data } = await httpClient.post<Purchase>('/purchases', params);

  return data;
}
