import { PricingProductsResponse } from "../../../types/Pricing";
import { httpClient } from "../httpClient";
import { PricingOverrides } from "./overrides";

/** Preço atual x recomendado para todo prato com ficha ativa. */
export async function getProducts(params?: PricingOverrides) {
  const { data } = await httpClient.get<PricingProductsResponse>(
    '/pricing/products',
    { params },
  );

  return data;
}
