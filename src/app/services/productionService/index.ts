import {
  ProductionOrder,
  ProductionStatus,
  YieldReport,
} from "../../../types/Production";
import { httpClient } from "../httpClient";

export interface ListProductionOrdersParams {
  status?: ProductionStatus;
  recipeId?: string;
  outputSupplyId?: string;
  from?: string;
  to?: string;
}

export interface ProductionItemParams {
  supplyId: string;
  quantity: string;
  /** Sigla da unidade. Ausente, vale a unidade base do insumo. */
  unit?: string;
}

export interface CreateProductionOrderParams {
  /** Precisa ser sub-receita com insumo de saída e rendimento. */
  recipeId: string;
  batches?: string;
  /**
   * Ingredientes de fato usados. Ausente, a API deriva da ficha × lotes,
   * desdobrando sub-receitas aninhadas. Informar substitui a lista inteira.
   */
  items?: ProductionItemParams[];
  producedAt?: string;
  notes?: string;
}

export interface ConfirmProductionOrderParams {
  id: string;
  /** Rendimento REAL, na unidade de rendimento da ficha. Ausente, o previsto. */
  actualQuantity?: string;
  actualQuantityUnit?: string;
  notes?: string;
}

async function getAll(params?: ListProductionOrdersParams) {
  const { data } = await httpClient.get<ProductionOrder[]>('/production-orders', {
    params,
  });

  return data;
}

async function getById(productionOrderId: string) {
  const { data } = await httpClient.get<ProductionOrder>(
    `/production-orders/${productionOrderId}`,
  );

  return data;
}

/** Previsto × real lote a lote. Só considera lotes confirmados. */
async function getYieldReport(params?: ListProductionOrdersParams) {
  const { data } = await httpClient.get<YieldReport>(
    '/production-orders/yield-report',
    { params },
  );

  return data;
}

async function create(params: CreateProductionOrderParams) {
  const { data } = await httpClient.post<ProductionOrder>(
    '/production-orders',
    params,
  );

  return data;
}

/**
 * Consome os ingredientes e produz o subproduto numa transação só.
 *
 * Responde 409 quando falta insumo — e nada se move: nem o tomate que já teria
 * saído. O lote continua rascunho e pode ser confirmado depois da reposição.
 */
async function confirm({ id, ...params }: ConfirmProductionOrderParams) {
  const { data } = await httpClient.patch<ProductionOrder>(
    `/production-orders/${id}/confirm`,
    params,
  );

  return data;
}

/** Só rascunho cancela: as movimentações de um lote confirmado são históricas. */
async function cancel(productionOrderId: string) {
  const { data } = await httpClient.patch<ProductionOrder>(
    `/production-orders/${productionOrderId}/cancel`,
  );

  return data;
}

export const productionService = {
  getAll,
  getById,
  getYieldReport,
  create,
  confirm,
  cancel,
};
