import { Supply } from "../../../types/Supply";
import { httpClient } from "../httpClient";

/**
 * `baseUnit` e o saldo de abertura ficam de fora: trocar a unidade base
 * reinterpretaria todo saldo já gravado, e saldo só muda por movimentação.
 */
export interface UpdateSupplyParams {
  id: string;
  name?: string;
  description?: string;
  /** `null` desvincula a categoria; string vazia seria recusada pelo IsUUID. */
  supplyCategoryId?: string | null;
  minStock?: string;
  maxStock?: string;
  active?: boolean;
}

export async function update({ id, ...params }: UpdateSupplyParams) {
  const { data } = await httpClient.put<Supply>(`/supplies/${id}`, params);

  return data;
}
