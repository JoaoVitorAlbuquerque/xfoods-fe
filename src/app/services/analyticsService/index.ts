import {
  AnalyticsAlerts,
  AnalyticsOverview,
  CostDashboard,
  ProductAnalytics,
  ProductRankingResponse,
  StockDashboard,
} from "../../../types/Analytics";
import { httpClient } from "../httpClient";
import { AlertsParams, AnalyticsFilters, ProductRankingParams } from "./params";

export type {
  AlertsParams,
  AnalyticsFilters,
  ProductRankingParams,
} from "./params";

async function getOverview(params?: AnalyticsFilters) {
  const { data } = await httpClient.get<AnalyticsOverview>(
    '/analytics/overview',
    { params },
  );

  return data;
}

async function getProductRanking(params?: ProductRankingParams) {
  const { data } = await httpClient.get<ProductRankingResponse>(
    '/analytics/products',
    { params },
  );

  return data;
}

/** 404 quando o prato não vendeu no período e também não tem ficha ativa. */
async function getProductDetail(productId: string, params?: AnalyticsFilters) {
  const { data } = await httpClient.get<ProductAnalytics>(
    `/analytics/products/${productId}`,
    { params },
  );

  return data;
}

async function getAlerts(params?: AlertsParams) {
  const { data } = await httpClient.get<AnalyticsAlerts>('/analytics/alerts', {
    params,
  });

  return data;
}

async function getStockDashboard(params?: AnalyticsFilters) {
  const { data } = await httpClient.get<StockDashboard>('/analytics/stock', {
    params,
  });

  return data;
}

async function getCostDashboard(params?: AnalyticsFilters) {
  const { data } = await httpClient.get<CostDashboard>('/analytics/costs', {
    params,
  });

  return data;
}

export const analyticsService = {
  getOverview,
  getProductRanking,
  getProductDetail,
  getAlerts,
  getStockDashboard,
  getCostDashboard,
};
