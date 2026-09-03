import { StockCountListItem } from "../../../types/StockCount";
import { httpClient } from "../httpClient";

type StockCountsResponse = Array<StockCountListItem>;

export async function getAll() {
  const { data } = await httpClient.get<StockCountsResponse>('/stock-counts');

  return data;
}
