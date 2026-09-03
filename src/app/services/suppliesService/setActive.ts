import { Supply } from "../../../types/Supply";
import { httpClient } from "../httpClient";

export interface SetSupplyActiveParams {
  id: string;
  active: boolean;
}

/**
 * Insumo não é apagado, é inativado: o histórico de movimentações continua
 * fazendo sentido e a ficha técnica que o usa continua explicável.
 */
export async function setActive({ id, active }: SetSupplyActiveParams) {
  const { data } = await httpClient.patch<Supply>(`/supplies/${id}/active`, { active });

  return data;
}
