import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import { cn } from '../../app/utils/cn';
import { formatQuantity } from '../../app/utils/formatQuantity';
import { convertQuantity, findBaseUnit } from '../../app/utils/unitConversion';
import { useMeasurementUnits } from '../../app/hooks/useMeasurementUnits';

interface BaseQuantityHintProps {
  /** Quantidade como string numérica, do jeito que o `QuantityInput` devolve. */
  quantity?: string;
  /** Id da unidade digitada. */
  unitId?: string;
  /**
   * Id da unidade de destino. Ausente, converte para a base canônica da
   * grandeza (G, ML, UN) — que é como o estoque guarda todo saldo.
   */
  targetUnitId?: string;
  className?: string;
}

/**
 * Mostra a conversão em tempo real: digitar `10 KG` num insumo com base em
 * grama exibe "= 10.000 G". É o que evita o erro de digitar quilo achando
 * que é grama.
 */
export function BaseQuantityHint({
  quantity,
  unitId,
  targetUnitId,
  className,
}: BaseQuantityHintProps) {
  const { units } = useMeasurementUnits();

  const from = units.find(unit => unit.id === unitId);

  if (!from) {
    return null;
  }

  const to = targetUnitId
    ? units.find(unit => unit.id === targetUnitId)
    : findBaseUnit(units, from.kind);

  if (!to) {
    return null;
  }

  if (from.isPackaging || to.isPackaging) {
    return (
      <div className={cn('flex items-center gap-2 mt-2 text-yellow-800', className)}>
        <ExclamationTriangleIcon className="shrink-0" />

        <span className="text-xs">
          {(from.isPackaging ? from : to).code} é unidade de embalagem: quanto vale
          depende do insumo e é definido na compra, não aqui.
        </span>
      </div>
    );
  }

  if (from.id === to.id) {
    return null;
  }

  const parsedQuantity = quantity === undefined || quantity === '' ? NaN : Number(quantity);

  if (!Number.isFinite(parsedQuantity)) {
    return null;
  }

  const conversion = convertQuantity(parsedQuantity, from, to);

  if (!conversion.ok) {
    return (
      <div className={cn('flex items-center gap-2 mt-2 text-yellow-800', className)}>
        <ExclamationTriangleIcon className="shrink-0" />

        <span className="text-xs">{conversion.message}</span>
      </div>
    );
  }

  return (
    <span className={cn('block mt-2 text-xs text-gray-400', className)}>
      = {formatQuantity(conversion.value)} {to.code}
    </span>
  );
}
