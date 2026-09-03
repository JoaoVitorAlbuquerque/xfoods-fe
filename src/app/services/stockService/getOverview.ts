import { StockOverview } from "../../../types/Stock";
import { httpClient } from "../httpClient";

/** Posição de todos os insumos ativos, já ordenada do mais grave ao normal. */
export async function getOverview() {
  const { data } = await httpClient.get<StockOverview>('/stock');

  return data;
}
