import { StockCount } from "../../../types/StockCount";
import { httpClient } from "../httpClient";

/** Gera os ajustes de cada item com diferença, tudo em uma transação. */
export async function apply(stockCountId: string) {
  const { data } = await httpClient.patch<StockCount>(
    `/stock-counts/${stockCountId}/apply`,
  );

  return data;
}
