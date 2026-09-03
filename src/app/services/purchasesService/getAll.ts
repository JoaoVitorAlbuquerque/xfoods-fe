import { PurchaseStatus, PurchasesResponse } from "../../../types/Purchase";
import { httpClient } from "../httpClient";

export interface GetAllPurchasesParams {
  status?: PurchaseStatus;
  supplierId?: string;
  /** Devolve as compras que contêm este insumo. */
  supplyId?: string;
  from?: string;
  to?: string;
}

/**
 * `limit` e `offset` não são enviados: o ValidationPipe global não converte
 * tipos, então o número chegaria como texto e a consulta quebraria — o mesmo
 * bug aberto de `/stock/movements`. A API devolve as 50 mais recentes e a
 * paginação é feita no cliente.
 */
export async function getAll(params?: GetAllPurchasesParams) {
  const { data } = await httpClient.get<PurchasesResponse>('/purchases', { params });

  return data;
}
