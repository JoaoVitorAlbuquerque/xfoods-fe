import { UnitKind } from "../../../types/MeasurementUnit";
import { httpClient } from "../httpClient";

export interface ConvertQuantityParams {
  /** String preserva a precisão que o JSON perderia ao virar float. */
  quantity: string;
  /** Sigla da unidade de origem, ex.: "KG". */
  from: string;
  /** Sigla da unidade de destino, ex.: "G". */
  to: string;
}

export interface ConvertQuantityResponse {
  quantity: string | number;
  from: string;
  to: string;
  kind: UnitKind;
  /** Vem como string, também por precisão. */
  result: string;
}

/**
 * Conversão autoritativa no servidor. Use para todo valor que for persistido —
 * a conversão local (`convertQuantity`) serve apenas de pré-visualização.
 */
export async function convert(params: ConvertQuantityParams) {
  const { data } = await httpClient.post<ConvertQuantityResponse>(
    '/measurement-units/convert',
    params,
  );

  return data;
}
