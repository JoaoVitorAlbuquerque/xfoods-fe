import { StockSettings } from "../../../types/Stock";
import { httpClient } from "../httpClient";

export async function getSettings() {
  const { data } = await httpClient.get<StockSettings>('/stock/settings');

  return data;
}
