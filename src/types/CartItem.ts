import { MenuProduct } from './MenuProduct';
import { SizeType } from './Recipe';

/**
 * Item da comanda em montagem. Só existe no cliente: o pedido vira registro na
 * API no `POST /orders`.
 */
export interface CartItem {
  product: MenuProduct;
  quantity: number;
  size: SizeType;
}
