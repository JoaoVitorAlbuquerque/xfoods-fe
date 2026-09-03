import { StockCount } from "../../../types/StockCount";
import { httpClient } from "../httpClient";

export async function getById(stockCountId: string) {
  const { data } = await httpClient.get<StockCount>(`/stock-counts/${stockCountId}`);

  return data;
}
