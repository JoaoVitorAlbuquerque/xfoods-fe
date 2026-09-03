import { StockStatus, Supply } from "../../../types/Supply";
import { httpClient } from "../httpClient";

export interface GetAllSuppliesParams {
  search?: string;
  supplyCategoryId?: string;
  /** A API espera texto: "true" / "false". */
  active?: 'true' | 'false';
  stockStatus?: StockStatus;
}

type SuppliesResponse = Array<Supply>;

export async function getAll(params?: GetAllSuppliesParams) {
  const { data } = await httpClient.get<SuppliesResponse>('/supplies', { params });

  return data;
}
