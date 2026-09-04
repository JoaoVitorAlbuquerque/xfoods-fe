import { Order } from "../../types/Order";
import { applySizePrice } from "./sizePrice";

export function calculateTotalProducts(order: Order | null) {
  const total = order?.products.reduce((acc, { product, quantity, size }) => (
    acc + applySizePrice(product.price * quantity, size)
  ), 0);

  return Number(total);
}
