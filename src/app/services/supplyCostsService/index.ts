import {
  CostVariationReport,
  SupplyCostHistoryResponse,
} from "../../../types/SupplyCost";
import { httpClient } from "../httpClient";

/** Insumo · último custo · custo anterior · data · variação %. */
async function getReport() {
  const { data } = await httpClient.get<CostVariationReport>('/supply-costs/report');

  return data;
}

/** Linha do tempo append-only do custo de um insumo. */
async function getHistory(supplyId: string) {
  const { data } = await httpClient.get<SupplyCostHistoryResponse>(
    `/supply-costs/${supplyId}/history`,
  );

  return data;
}

export const supplyCostsService = {
  getReport,
  getHistory,
};
