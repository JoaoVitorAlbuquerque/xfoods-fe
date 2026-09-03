import { Supply } from "../../../types/Supply";
import { httpClient } from "../httpClient";

export interface CreateSupplyParams {
  name: string;
  description?: string;
  supplyCategoryId?: string;
  /** Sigla da unidade base — "G", "ML", "UN". Embalagem não é aceita. */
  baseUnit: string;
  minStock?: string;
  maxStock?: string;
  /**
   * Saldo de abertura. Não vira saldo direto: a API registra um ADJUSTMENT,
   * porque saldo sem movimentação é o que este módulo não permite.
   */
  initialStock?: string;
  initialStockUnit?: string;
  initialUnitCost?: string;
}

export async function create(params: CreateSupplyParams) {
  const { data } = await httpClient.post<Supply>('/supplies', params);

  return data;
}
