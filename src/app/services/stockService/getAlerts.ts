import { StockOverview } from "../../../types/Stock";
import { httpClient } from "../httpClient";

/** Só o que precisa de atenção: negativo, zerado, abaixo do mínimo, acima do máximo. */
export async function getAlerts() {
  const { data } = await httpClient.get<StockOverview>('/stock/alerts');

  return data;
}
