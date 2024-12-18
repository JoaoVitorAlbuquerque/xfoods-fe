import { Lead } from "../../../types/Lead";

import { httpClient } from "../httpClient";

type LeadsResponse = Array<Lead>;

export async function getAll() {
  const { data } = await httpClient.get<LeadsResponse>('/leads');

  return data;
}
