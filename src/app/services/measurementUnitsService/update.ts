import { MeasurementUnit } from "../../../types/MeasurementUnit";
import { httpClient } from "../httpClient";

/**
 * `code` e `kind` não entram: alterá-los reescreveria o significado de toda
 * quantidade já registrada com a unidade. O caminho é desativar e criar outra.
 */
export interface UpdateMeasurementUnitParams {
  id: string;
  name?: string;
  factorToBase?: string;
  active?: boolean;
}

export async function update({ id, ...params }: UpdateMeasurementUnitParams) {
  const { data } = await httpClient.put<MeasurementUnit>(`/measurement-units/${id}`, params);

  return data;
}
