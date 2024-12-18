import { History } from "../../../types/History";
import { httpClient } from "../httpClient";

type HistoryResponse = Array<History>;

export type HistoryFilters = {
  month: number;
  year: number;
};

export async function getAll({ month, year }: HistoryFilters) {
  const { data } = await httpClient.get<HistoryResponse>('/orders/history', {
    params: { month, year },
  });

  return data;
}
