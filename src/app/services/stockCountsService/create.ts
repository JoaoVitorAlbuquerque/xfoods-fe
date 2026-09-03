import { StockCount } from "../../../types/StockCount";
import { httpClient } from "../httpClient";

export interface CreateStockCountItemParams {
  supplyId: string;
  /** Quanto foi encontrado na contagem física. */
  countedQuantity: string;
  /** Unidade em que foi contado. Ausente = unidade base do insumo. */
  unit?: string;
}

export interface CreateStockCountParams {
  note?: string;
  countedAt?: string;
  items: CreateStockCountItemParams[];
}

/** Registra a contagem. Nada afeta o estoque até ela ser aplicada. */
export async function create(params: CreateStockCountParams) {
  const { data } = await httpClient.post<StockCount>('/stock-counts', params);

  return data;
}
