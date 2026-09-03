import { PricingSettings } from "../../../types/Pricing";
import { httpClient } from "../httpClient";

export interface UpdatePricingSettingsParams {
  /** Margem sobre o PREÇO de venda, não sobre o custo. */
  desiredMarginPercent?: string;
  taxPercent?: string;
  cardFeePercent?: string;
  deliveryFeePercent?: string;
  otherFeesPercent?: string;
}

export async function updateSettings(params: UpdatePricingSettingsParams) {
  const { data } = await httpClient.put<PricingSettings>(
    '/pricing/settings',
    params,
  );

  return data;
}
