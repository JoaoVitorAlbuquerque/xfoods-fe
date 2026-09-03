import { PricingSimulation } from "../../../types/Pricing";
import { httpClient } from "../httpClient";
import { PricingOverrides } from "./overrides";

export interface SimulatePricingParams extends PricingOverrides {
  /** Simula um prato do cardápio, com o custo completo real dele. */
  productId?: string;
  /** Ou um custo avulso, para testar um prato que ainda não existe. */
  cost?: string;
  /** Margens a simular, separadas por vírgula. Ausente, a API usa uma faixa. */
  margins?: string;
}

export async function simulate(params: SimulatePricingParams) {
  const { data } = await httpClient.get<PricingSimulation>('/pricing/simulate', {
    params,
  });

  return data;
}
