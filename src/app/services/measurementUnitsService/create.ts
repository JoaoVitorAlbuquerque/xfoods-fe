import { MeasurementUnit, UnitKind } from "../../../types/MeasurementUnit";
import { httpClient } from "../httpClient";

export interface CreateMeasurementUnitParams {
  code: string;
  name: string;
  kind: UnitKind;
  /**
   * String de propósito: número em JSON já chega como float, e é exatamente a
   * imprecisão que este módulo existe para evitar. Ausente em embalagem.
   */
  factorToBase?: string;
  isPackaging?: boolean;
}

export async function create(params: CreateMeasurementUnitParams) {
  const { data } = await httpClient.post<MeasurementUnit>('/measurement-units', params);

  return data;
}
