import { CheckCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { cn } from "../../app/utils/cn";
import { formatPercentPlain } from "../../app/utils/formatPercent";
import { DataQuality } from "../../types/Analytics";

interface DataQualityBadgeProps {
  dataQuality: DataQuality | null | undefined;
  className?: string;
  /** Só a faixa e o percentual, para caber ao lado de um número na tabela. */
  compact?: boolean;
}

/**
 * Cobertura do custo, ao lado da margem (regra 4.2).
 *
 * Uma margem de 45% calculada sobre 72% das vendas não é uma margem de 45%. O
 * componente existe para que nenhuma tela consiga mostrar o número sem mostrar
 * junto sobre quanto ele foi calculado.
 */
export function DataQualityBadge({
  dataQuality,
  className,
  compact,
}: DataQualityBadgeProps) {
  if (!dataQuality) {
    return null;
  }

  const coverage = dataQuality.costCoveragePercent;

  if (coverage === null) {
    return (
      <span className={cn('text-xs text-gray-400', className)}>
        Sem venda no período: não há custo a cobrir.
      </span>
    );
  }

  const isComplete = dataQuality.itemsWithoutCostSnapshot === 0;

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-xs',
          isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-900',
          className,
        )}
        title={
          dataQuality.warning
          ?? 'Todas as vendas do período têm custo congelado.'
        }
      >
        {isComplete ? <CheckCircledIcon /> : <ExclamationTriangleIcon />}

        custo em {formatPercentPlain(coverage)} das vendas
      </span>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        isComplete
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-yellow-200 bg-yellow-50 text-yellow-900',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {isComplete ? (
          <CheckCircledIcon className="mt-0.5 shrink-0" />
        ) : (
          <ExclamationTriangleIcon className="mt-0.5 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <strong className="text-sm">
              Custo medido em {formatPercentPlain(coverage)} das vendas
            </strong>

            <span className="text-xs">
              {dataQuality.itemsWithCostSnapshot} de{' '}
              {dataQuality.itemsWithCostSnapshot + dataQuality.itemsWithoutCostSnapshot}{' '}
              itens
            </span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/10">
            <div
              className={isComplete ? 'h-full bg-green-700' : 'h-full bg-yellow-600'}
              style={{ width: `${Math.min(coverage, 100)}%` }}
            />
          </div>

          <p className="mt-2 text-xs">
            {dataQuality.warning
              ?? 'Todas as vendas do período têm custo congelado: a margem abaixo é confiável.'}
          </p>

          {!isComplete && (
            <p className="mt-1 text-xs font-medium">
              Enquanto a cobertura não for 100%, o custo direto está subestimado
              e a margem, superestimada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
