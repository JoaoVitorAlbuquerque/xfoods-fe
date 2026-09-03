import { PricingProductDetail } from "../../../types/Pricing";
import { httpClient } from "../httpClient";
import { PricingOverrides } from "./overrides";

/**
 * Composição do custo, rentabilidade e arredondamento de um prato.
 *
 * Responde 404 quando o prato não existe ou não tem ficha ativa: sem ficha não
 * há custo direto, e sem custo direto não há preço a recomendar.
 */
export async function getProduct(productId: string, params?: PricingOverrides) {
  const { data } = await httpClient.get<PricingProductDetail>(
    `/pricing/products/${productId}`,
    { params },
  );

  return data;
}
