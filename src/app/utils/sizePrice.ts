import { SizeType } from '../../types/Recipe';

/**
 * Ajuste de preço por tamanho — **regra do cliente, não da API**.
 *
 * `POST /orders` congela `unitPrice = product.price` e
 * `totalPrice = unitPrice × quantidade`, ignorando o `size` na conta (ele é
 * gravado no item, mas só influencia custo/ficha técnica). Quem soma o
 * acréscimo do tamanho é o front, e ele faz isso em todas as telas de total de
 * pedido (Home, Histórico, PayX). Estes fatores são a origem única daquela
 * conta — mudá-los aqui muda todas as telas de uma vez.
 */
export const sizePriceFactors: Record<SizeType, number> = {
  TINY: -0.05,
  SMALL: -0.03,
  MEAN: 0,
  LARGE: 0.07,
  EXTRA_LARGE: 0.09,
  METER: 0.12,
};

/** Rótulo curto, para caber no botão de tamanho ao lado do item. */
export const sizeShortLabels: Record<SizeType, string> = {
  TINY: 'B',
  SMALL: 'P',
  MEAN: 'M',
  LARGE: 'G',
  EXTRA_LARGE: 'GG',
  METER: 'Metro',
};

/** Aplica o fator do tamanho sobre um total já multiplicado pela quantidade. */
export function applySizePrice(baseTotal: number, size?: string | null) {
  const factor =
    size && size in sizePriceFactors ? sizePriceFactors[size as SizeType] : 0;

  return baseTotal + baseTotal * factor;
}
