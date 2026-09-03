import {
  ConsumptionByProductResponse,
  ConsumptionBySupplyResponse,
  ConsumptionDashboardResponse,
  FinancialLossesResponse,
  TopDeviationsResponse,
  WasteByPeriodResponse,
} from "../../../types/Consumption";
import { httpClient } from "../httpClient";
import { ConsumptionParams } from "./params";

export type { ConsumptionParams } from "./params";
export { consumptionMovementTypes } from "./params";

async function getDashboard(params?: ConsumptionParams) {
  const { data } = await httpClient.get<ConsumptionDashboardResponse>(
    '/consumption/dashboard',
    { params },
  );

  return data;
}

async function getBySupply(params?: ConsumptionParams) {
  const { data } = await httpClient.get<ConsumptionBySupplyResponse>(
    '/consumption/by-supply',
    { params },
  );

  return data;
}

async function getByProduct(params?: ConsumptionParams) {
  const { data } = await httpClient.get<ConsumptionByProductResponse>(
    '/consumption/by-product',
    { params },
  );

  return data;
}

/** Maiores desvios em porcentagem, já sem as linhas dentro da tolerância. */
async function getDeviations(params?: ConsumptionParams) {
  const { data } = await httpClient.get<TopDeviationsResponse>(
    '/consumption/deviations',
    { params },
  );

  return data;
}

/** Só o que custou dinheiro: consumo abaixo do previsto fica de fora. */
async function getFinancialLosses(params?: ConsumptionParams) {
  const { data } = await httpClient.get<FinancialLossesResponse>(
    '/consumption/financial-losses',
    { params },
  );

  return data;
}

async function getWasteByPeriod(params?: ConsumptionParams) {
  const { data } = await httpClient.get<WasteByPeriodResponse>(
    '/consumption/waste-by-period',
    { params },
  );

  return data;
}

export const consumptionService = {
  getDashboard,
  getBySupply,
  getByProduct,
  getDeviations,
  getFinancialLosses,
  getWasteByPeriod,
};
