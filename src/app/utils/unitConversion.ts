import { MeasurementUnit, UnitKind } from '../../types/MeasurementUnit';

export type ConversionResult =
  | { ok: true; value: number }
  | { ok: false; reason: 'INCOMPATIBLE' | 'PACKAGING' | 'INVALID'; message: string };

/**
 * Conversão local, só para pré-visualizar enquanto o usuário digita. A listagem
 * já devolve `factorToBase`, então dá para converter no cliente — mas todo valor
 * que for persistido passa pelo servidor, que é a fonte de verdade.
 *
 * Contagem nunca vira massa nem volume: 1 KG não é 1 UN. A recusa vem do
 * `kind`, comparado antes de qualquer cálculo — a mesma regra da API.
 */
export function convertQuantity(
  quantity: number,
  from: MeasurementUnit,
  to: MeasurementUnit,
): ConversionResult {
  if (from.kind !== to.kind) {
    return {
      ok: false,
      reason: 'INCOMPATIBLE',
      message: `${from.code} e ${to.code} são de grandezas diferentes e nunca se convertem.`,
    };
  }

  const packagingUnit = [from, to].find(unit => unit.factorToBase === null);

  if (packagingUnit) {
    return {
      ok: false,
      reason: 'PACKAGING',
      message: `${packagingUnit.code} é unidade de embalagem: o fator depende do insumo e é definido na compra.`,
    };
  }

  if (!Number.isFinite(quantity) || quantity < 0) {
    return {
      ok: false,
      reason: 'INVALID',
      message: 'Quantidade inválida.',
    };
  }

  const fromFactor = from.factorToBase!;
  const toFactor = to.factorToBase!;

  if (fromFactor === toFactor) {
    return { ok: true, value: quantity };
  }

  return { ok: true, value: (quantity * fromFactor) / toFactor };
}

/** Base canônica da grandeza (G, ML, UN) — o formato em que o estoque é guardado. */
export function findBaseUnit(units: MeasurementUnit[], kind: UnitKind) {
  return units.find(unit => unit.kind === kind && unit.isBase);
}
