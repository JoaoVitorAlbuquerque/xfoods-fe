import { getProduct } from "./getProduct";
import { getProducts } from "./getProducts";
import { getSettings } from "./getSettings";
import { simulate } from "./simulate";
import { updateSettings } from "./updateSettings";

export type { PricingOverrides } from "./overrides";

export const pricingService = {
  getSettings,
  updateSettings,
  getProducts,
  getProduct,
  simulate,
};
