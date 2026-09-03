import { httpClient } from "../httpClient";

/**
 * A API desativa em vez de apagar: a unidade é referenciada por insumos,
 * compras e fichas técnicas, e remover a linha apagaria o significado das
 * quantidades já gravadas com ela.
 */
export async function remove(unitId: string) {
  const { data } = await httpClient.delete(`/measurement-units/${unitId}`);

  return data;
}
