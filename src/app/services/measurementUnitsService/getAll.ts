import { MeasurementUnit } from "../../../types/MeasurementUnit";
import { httpClient } from "../httpClient";

export interface GetAllMeasurementUnitsParams {
  includeInactive?: boolean;
}

type MeasurementUnitsResponse = Array<MeasurementUnit>;

export async function getAll(params?: GetAllMeasurementUnitsParams) {
  const { data } = await httpClient.get<MeasurementUnitsResponse>('/measurement-units', {
    params: params?.includeInactive ? { includeInactive: true } : undefined,
  });

  return data;
}
