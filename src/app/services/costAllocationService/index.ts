import {
  AllocationMethod,
  AllocationPeriod,
  CostAllocation,
  CostAllocationSettings,
  FullCostReport,
} from "../../../types/CostAllocation";
import { ExpensePeriodParams } from "../expensesService/reports";
import { httpClient } from "../httpClient";

export interface UpdateCostAllocationSettingsParams {
  method?: AllocationMethod;
  referencePeriod?: AllocationPeriod;
  estimatedSalesUnits?: string;
  estimatedRevenue?: string;
  includeFixed?: boolean;
  includeVariable?: boolean;
}

async function getSettings() {
  const { data } = await httpClient.get<CostAllocationSettings>(
    '/cost-allocation/settings',
  );

  return data;
}

async function updateSettings(params: UpdateCostAllocationSettingsParams) {
  const { data } = await httpClient.put<CostAllocationSettings>(
    '/cost-allocation/settings',
    params,
  );

  return data;
}

/**
 * Custo indireto do período e quanto ele representa por unidade vendida.
 * Devolve 501 quando o método configurado não é PER_SOLD_UNIT.
 */
async function getAllocation(params?: ExpensePeriodParams) {
  const { data } = await httpClient.get<CostAllocation>('/cost-allocation', {
    params,
  });

  return data;
}

/** Custo direto + custo indireto rateado, por produto. Nada altera preço. */
async function getFullCost(params?: ExpensePeriodParams) {
  const { data } = await httpClient.get<FullCostReport>(
    '/cost-allocation/full-cost',
    { params },
  );

  return data;
}

export const costAllocationService = {
  getSettings,
  updateSettings,
  getAllocation,
  getFullCost,
};
