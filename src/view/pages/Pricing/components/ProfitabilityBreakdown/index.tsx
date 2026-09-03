import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { PricingBreakdown } from "../../../../../types/Pricing";

interface ProfitabilityBreakdownProps {
  title: string;
  subtitle?: string;
  breakdown: PricingBreakdown;
  /** A margem pedida na configuração, para comparar com a obtida. */
  targetMarginPercent?: number;
  highlight?: boolean;
}

const segments = [
  { key: 'cost', label: 'Custo completo', className: 'bg-gray-500' },
  { key: 'taxes', label: 'Impostos', className: 'bg-yellow-600' },
  { key: 'fees', label: 'Taxas', className: 'bg-orange-400' },
  { key: 'profit', label: 'Lucro', className: 'bg-green-700' },
] as const;

/**
 * Onde cada real do preço vai parar.
 *
 * As parcelas somam exatamente o preço, então a barra empilhada é a leitura
 * natural. O caso do prejuízo não cabe nela: custo + imposto + taxa passam do
 * preço, e a barra desenha esse excesso com a linha do preço marcada, em vez de
 * esconder um segmento negativo.
 */
export function ProfitabilityBreakdown({
  title,
  subtitle,
  breakdown,
  targetMarginPercent,
  highlight,
}: ProfitabilityBreakdownProps) {
  const outflow = breakdown.cost + breakdown.taxes + breakdown.fees;
  const isLoss = breakdown.profit < 0;
  const base = Math.max(breakdown.price, outflow) || 1;

  const values = {
    cost: breakdown.cost,
    taxes: breakdown.taxes,
    fees: breakdown.fees,
    profit: breakdown.profit,
  };

  const missesTarget =
    targetMarginPercent !== undefined
    && breakdown.marginPercent !== null
    && breakdown.marginPercent < targetMarginPercent;

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-4 md:p-6',
        highlight ? 'border-gray-800' : 'border-gray-600',
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <strong className="block text-gray-500">{title}</strong>

          {subtitle && (
            <span className="mt-1 block text-xs text-gray-400">{subtitle}</span>
          )}
        </div>

        <strong className="text-xl font-bold text-gray-500">
          {formatCurrency(breakdown.price)}
        </strong>
      </div>

      <div className="relative mt-4 flex h-4 w-full overflow-hidden rounded-full bg-gray-500/10">
        {segments.map(segment => {
          const value = values[segment.key];

          if (value <= 0) {
            return null;
          }

          return (
            <div
              key={segment.key}
              className={segment.className}
              style={{ width: `${(value / base) * 100}%` }}
              title={`${segment.label}: ${formatCurrency(value)}`}
            />
          );
        })}
      </div>

      {isLoss && (
        <div className="relative mt-1 h-4">
          <div
            className="absolute top-0 h-3 w-px bg-red-900"
            style={{ left: `${(breakdown.price / base) * 100}%` }}
          />

          <span
            className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[10px] text-red-900"
            style={{ left: `${(breakdown.price / base) * 100}%` }}
          >
            o preço acaba aqui
          </span>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {segments.map(segment => (
          <li
            key={segment.key}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 text-gray-500">
              <span className={cn('size-3 shrink-0 rounded', segment.className)} />

              <span className="truncate">{segment.label}</span>
            </span>

            <span
              className={cn(
                'whitespace-nowrap text-gray-500',
                segment.key === 'profit' && isLoss && 'font-bold text-red-900',
              )}
            >
              {formatCurrency(values[segment.key])}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-gray-600/40 pt-4">
        <div>
          <span className="block text-xs text-gray-400">
            Margem sobre o preço
          </span>

          <strong
            className={cn(
              'text-2xl font-bold',
              isLoss ? 'text-red-900' : missesTarget ? 'text-yellow-800' : 'text-green-800',
            )}
          >
            {formatPercentPlain(breakdown.marginPercent)}
          </strong>

          {targetMarginPercent !== undefined && (
            <span className="mt-1 block text-xs text-gray-400">
              contra os {formatPercentPlain(targetMarginPercent)} pedidos
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="block text-xs text-gray-400">Preço sobre o custo</span>

          <strong className="text-gray-500">
            {formatPercentPlain(breakdown.markupOverCostPercent)}
          </strong>

          <span className="mt-1 block text-xs text-gray-400">
            outra pergunta, outra base
          </span>
        </div>
      </div>
    </div>
  );
}
