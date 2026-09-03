import { StockMovementsResponse } from "../../../types/StockMovement";
import { StockMovementType } from "../../../types/StockMovement";
import { httpClient } from "../httpClient";

export interface GetMovementsParams {
  supplyId?: string;
  type?: StockMovementType;
  /** ISO completo. A tela converte a data escolhida no início do dia. */
  from?: string;
  to?: string;
}

/**
 * `limit` e `offset` NÃO são enviados: `GET /stock/movements?limit=N` devolve
 * 500 porque o ValidationPipe global não converte tipos e o Prisma recusa o
 * texto. Bug aberto no back-end — até lá a API devolve os 50 mais recentes e a
 * paginação é feita no cliente.
 */
export async function getMovements(params?: GetMovementsParams) {
  const { data } = await httpClient.get<StockMovementsResponse>('/stock/movements', {
    params,
  });

  return data;
}
