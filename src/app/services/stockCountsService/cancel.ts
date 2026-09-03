import { StockCount } from "../../../types/StockCount";
import { httpClient } from "../httpClient";

export async function cancel(stockCountId: string) {
  const { data } = await httpClient.patch<StockCount>(
    `/stock-counts/${stockCountId}/cancel`,
  );

  return data;
}
