import { MeasurementUnit } from '../../types/MeasurementUnit';
import { convertQuantity } from './unitConversion';

export type PriceMode = 'TOTAL' | 'UNIT';

interface ComputePurchaseLineInput {
  quantity: string | undefined;
  price: string | undefined;
  priceMode: PriceMode;
  unit: MeasurementUnit | undefined;
  baseUnit: MeasurementUnit | undefined;
}

export interface PurchaseLineResult {
  quantity: number;
  quantityBase: number;
  totalPrice: number;
  /**
   * Custo por unidade base — `totalPrice / quantityBase`. É o número que torna
   * compras comparáveis: 10 KG por R$ 350 vira R$ 0,035/G.
   */
  unitCostBase: number;
}

/**
 * Prévia da linha da compra enquanto o usuário digita. A API refaz esta conta
 * na criação e é ela quem vale — aqui é só para o número aparecer antes de
 * salvar, que é o que evita comprar em quilo achando que é grama.
 */
export function computePurchaseLine({
  quantity,
  price,
  priceMode,
  unit,
  baseUnit,
}: ComputePurchaseLineInput): PurchaseLineResult | null {
  if (!unit || !baseUnit || !quantity || !price) {
    return null;
  }

  const parsedQuantity = Number(quantity);
  const parsedPrice = Number(price);

  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    return null;
  }

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return null;
  }

  const conversion = convertQuantity(parsedQuantity, unit, baseUnit);

  if (!conversion.ok || conversion.value === 0) {
    return null;
  }

  const totalPrice = priceMode === 'TOTAL' ? parsedPrice : parsedPrice * parsedQuantity;

  return {
    quantity: parsedQuantity,
    quantityBase: conversion.value,
    totalPrice,
    unitCostBase: totalPrice / conversion.value,
  };
}
