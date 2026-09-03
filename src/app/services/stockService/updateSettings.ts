import { StockSettings } from "../../../types/Stock";
import { httpClient } from "../httpClient";

export interface UpdateStockSettingsParams {
  allowNegativeStock?: boolean;
  allowSaleWithoutRecipe?: boolean;
  stockConsumptionTolerancePercentage?: string;
}

export async function updateSettings(params: UpdateStockSettingsParams) {
  const { data } = await httpClient.put<StockSettings>('/stock/settings', params);

  return data;
}
