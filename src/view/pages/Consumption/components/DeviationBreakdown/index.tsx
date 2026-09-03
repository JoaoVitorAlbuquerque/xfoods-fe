import { CheckCircledIcon } from "@radix-ui/react-icons";

import { cn } from "../../../../../app/utils/cn";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { DeviationBreakdown as Breakdown } from "../../../../../types/Consumption";

interface DeviationBreakdownProps {
  breakdown: Breakdown;
  difference: number;
  baseUnit: string;
  className?: string;
  compact?: boolean;
}

/**
 * O desvio separado no que já tem documento e no que não tem.
 *
 * Quando `undocumented` é zero, o desvio inteiro é explicado por perdas,
 * ajustes, produção ou transferências já lançados — e a tela precisa dizer
 * isso, em vez de sugerir uma investigação que não tem o que investigar.
 */
export function DeviationBreakdown({
  breakdown,
  difference,
  baseUnit,
  className,
  compact,
}: DeviationBreakdownProps) {
  if (difference === 0) {
    return (
      <span className={cn('text-xs text-gray-400', className)}>
        Sem desvio a explicar.
      </span>
    );
  }

  const isFullyDocumented = breakdown.undocumented === 0;

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-xs',
          isFullyDocumented
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-500/10 text-gray-500',
          className,
        )}
        title={
          isFullyDocumented
            ? 'Perdas, ajustes, produção e transferências já lançados explicam o desvio inteiro.'
            : `Sem documento: ${formatQuantity(breakdown.undocumented)} ${baseUnit}`
        }
      >
        {isFullyDocumented ? (
          <>
            <CheckCircledIcon />
            explicado
          </>
        ) : (
          <>{formatQuantity(breakdown.undocumented)} {baseUnit} sem documento</>
        )}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        isFullyDocumented
          ? 'border-green-200 bg-green-50'
          : 'border-gray-600 bg-white',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-gray-500">Já lançado (perda, ajuste, produção)</span>

        <span className="whitespace-nowrap text-gray-500">
          {formatQuantity(breakdown.documented)} {baseUnit}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-gray-500">Sem documento</span>

        <strong className={cn(
          'whitespace-nowrap',
          isFullyDocumented ? 'text-green-800' : 'text-gray-500',
        )}>
          {formatQuantity(breakdown.undocumented)} {baseUnit}
        </strong>
      </div>

      <p className={cn(
        'mt-3 flex items-start gap-2 text-xs',
        isFullyDocumented ? 'text-green-800' : 'text-gray-400',
      )}>
        {isFullyDocumented && <CheckCircledIcon className="mt-0.5 shrink-0" />}

        <span>
          {isFullyDocumented
            ? 'O desvio está inteiramente explicado por lançamentos já feitos. Não há o que investigar aqui.'
            : 'A parte sem documento costuma ser prato vendido sem ficha ativa ou consumo interno não registrado.'}
        </span>
      </p>
    </div>
  );
}
