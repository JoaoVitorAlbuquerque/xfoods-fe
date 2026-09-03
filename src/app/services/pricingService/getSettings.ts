import { PricingSettings } from "../../../types/Pricing";
import { httpClient } from "../httpClient";

export async function getSettings() {
  const { data } = await httpClient.get<PricingSettings>('/pricing/settings');

  return data;
}
