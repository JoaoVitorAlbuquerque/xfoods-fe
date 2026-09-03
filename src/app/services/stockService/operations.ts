import { StockAdjustmentResult } from "../../../types/Stock";
import { StockMovement } from "../../../types/StockMovement";
import { httpClient } from "../httpClient";

/**
 * SALE nunca é aceito nestas rotas: a baixa de venda é gerada pela própria
 * venda, dentro da transação do pagamento.
 */
export type ManualEntryType = 'PURCHASE' | 'RETURN' | 'PRODUCTION' | 'TRANSFER';
export type ManualExitType = 'PRODUCTION' | 'RETURN' | 'TRANSFER';

interface BaseOperationParams {
  supplyId: string;
  /** Magnitude positiva: o sentido vem da rota, não do sinal. */
  quantity: string;
  /** Sigla da unidade informada. Ausente = unidade base do insumo. */
  unit?: string;
}

export interface CreateStockEntryParams extends BaseOperationParams {
  type?: ManualEntryType;
  reason?: string;
  /** Custo por unidade informada em `unit`. Recalcula o custo médio. */
  unitCost?: string;
}

export interface CreateStockExitParams extends BaseOperationParams {
  type: ManualExitType;
  reason?: string;
}

export interface CreateStockLossParams extends BaseOperationParams {
  /** Obrigatório: perda sem motivo registrado não é auditável. */
  reason: string;
}

export interface CreateStockAdjustmentParams {
  supplyId: string;
  /** Saldo correto, absoluto — a diferença é calculada pela API. */
  targetQuantity: string;
  unit?: string;
  reason: string;
}

export async function createEntry(params: CreateStockEntryParams) {
  const { data } = await httpClient.post<StockMovement>('/stock/entries', params);

  return data;
}

export async function createExit(params: CreateStockExitParams) {
  const { data } = await httpClient.post<StockMovement>('/stock/exits', params);

  return data;
}

export async function createLoss(params: CreateStockLossParams) {
  const { data } = await httpClient.post<StockMovement>('/stock/losses', params);

  return data;
}

export async function createAdjustment(params: CreateStockAdjustmentParams) {
  const { data } = await httpClient.post<StockAdjustmentResult>(
    '/stock/adjustments',
    params,
  );

  return data;
}
