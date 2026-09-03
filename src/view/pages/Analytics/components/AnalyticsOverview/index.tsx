import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { analyticsService } from "../../../../../app/services/analyticsService";
import {
  analyticsQueryKey,
  analyticsStaleTime,
} from "../../../../../app/hooks/useAnalyticsQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { formatCompetenceDate } from "../../../../../app/utils/formatCompetenceDate";
import { DataQualityBadge } from "../../../../components/DataQualityBadge";
import { ListFeedback } from "../../../../components/ListFeedback";
import { NotesPanel } from "../../../../components/NotesPanel";
import { AnalyticsFilterBar } from "../AnalyticsFilterBar";
import { useAnalyticsFilters } from "../../useAnalyticsFilters";

export function AnalyticsOverview() {
  const { filters, setFilters } = useAnalyticsFilters();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...analyticsQueryKey, 'overview', filters],
    queryFn: () => analyticsService.getOverview(filters),
    staleTime: analyticsStaleTime,
  });

  const absorption = data?.indirectAbsorption;
  const hasUnabsorbed = (absorption?.unabsorbed ?? 0) > 0;

  return (
    <>
      <AnalyticsFilterBar
        filters={filters}
        onChange={setFilters}
        show={['category', 'product']}
      />

      <ListFeedback
        isLoading={isFetching && !data}
        isError={isError}
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar os indicadores."
        onRetry={refetch}
      >
        {data && (
          <>
            <p className="mb-6 text-sm text-gray-400">
              De{' '}
              <strong className="text-gray-500">
                {formatCompetenceDate(data.period.from)}
              </strong>{' '}
              a{' '}
              <strong className="text-gray-500">
                {formatCompetenceDate(data.period.to)}
              </strong>{' '}
              · {formatQuantity(data.unitsSold)} unidade(s) vendida(s)
            </p>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* A conta do período, na ordem em que ela fecha. */}
              <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6 lg:col-span-2">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Faturamento</span>

                    <strong className="whitespace-nowrap text-gray-500">
                      {formatCurrency(data.revenue)}
                    </strong>
                  </li>

                  <li className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Custo direto</span>

                    <span className="whitespace-nowrap text-gray-500">
                      {formatCurrency(data.directCost)}
                    </span>
                  </li>

                  <li className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Custo indireto absorvido</span>

                    <span className="whitespace-nowrap text-gray-500">
                      {formatCurrency(data.indirectCost)}
                    </span>
                  </li>

                  <li className="flex items-center justify-between gap-3 border-t border-gray-600/40 pt-2">
                    <strong className="text-gray-500">Custo total</strong>

                    <strong className="whitespace-nowrap text-gray-500">
                      {formatCurrency(data.totalCost)}
                    </strong>
                  </li>

                  <li className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Impostos</span>

                    <span className="whitespace-nowrap text-gray-500">
                      {formatCurrency(data.taxes)}
                    </span>
                  </li>

                  <li className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Taxas</span>

                    <span className="whitespace-nowrap text-gray-500">
                      {formatCurrency(data.fees)}
                    </span>
                  </li>
                </ul>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-gray-600/40 pt-4">
                  <div>
                    <span className="block text-xs text-gray-400">
                      Lucro estimado
                    </span>

                    <strong className={cn(
                      'text-2xl font-bold',
                      data.estimatedProfit < 0 ? 'text-red-900' : 'text-gray-500',
                    )}>
                      {formatCurrency(data.estimatedProfit)}
                    </strong>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs text-gray-400">Margem</span>

                    <strong className={cn(
                      'text-2xl font-bold',
                      data.marginPercent !== null
                      && data.marginPercent < data.percentages.marginPercent
                        ? 'text-yellow-800'
                        : 'text-green-800',
                    )}>
                      {formatPercentPlain(data.marginPercent)}
                    </strong>

                    <span className="mt-1 block text-xs text-gray-400">
                      pedida: {formatPercentPlain(data.percentages.marginPercent)}
                    </span>
                  </div>
                </div>

                {/* Regra 4.2: a margem nunca aparece sem a cobertura ao lado. */}
                <DataQualityBadge className="mt-4" dataQuality={data.dataQuality} />
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-gray-600 bg-white p-4">
                  <span className="block text-xs text-gray-400">
                    Valor de estoque
                  </span>

                  <strong className="text-xl font-bold text-gray-500">
                    {formatCurrency(data.stock.value)}
                  </strong>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className={cn(
                      'rounded px-2 py-0.5',
                      data.stock.negative > 0
                        ? 'bg-red-100 text-red-900'
                        : 'bg-gray-500/10 text-gray-500',
                    )}>
                      {data.stock.negative} negativo(s)
                    </span>

                    <span className="rounded bg-gray-500/10 px-2 py-0.5 text-gray-500">
                      {data.stock.zero} zerado(s)
                    </span>

                    <span className={cn(
                      'rounded px-2 py-0.5',
                      data.stock.low > 0
                        ? 'bg-yellow-100 text-yellow-900'
                        : 'bg-gray-500/10 text-gray-500',
                    )}>
                      {data.stock.low} abaixo do mínimo
                    </span>
                  </div>

                  <Link
                    to="/analytics/stock"
                    className="mt-3 inline-block text-sm font-bold text-red-600"
                  >
                    Ver o painel de estoque
                  </Link>
                </div>

                <div className="rounded-lg border border-gray-600 bg-white p-4">
                  <span className="block text-xs text-gray-400">
                    Desperdício lançado
                  </span>

                  <strong className="text-xl font-bold text-gray-500">
                    {formatCurrency(data.waste.registeredLossCost)}
                  </strong>

                  <span className="mt-1 block text-xs text-gray-400">
                    {data.waste.lossShareOfConsumptionPercent === null
                      ? 'Sem consumo no período.'
                      : `${formatPercentPlain(data.waste.lossShareOfConsumptionPercent)} do consumo de ${formatCurrency(data.waste.consumptionCost)}`}
                  </span>

                  <p className="mt-2 text-xs text-gray-400">
                    São só as perdas que alguém lançou. Diferença entre estimado
                    e real é outra coisa, e está no painel de custos.
                  </p>
                </div>
              </div>
            </div>

            {absorption && (
              <div className={cn(
                'mt-4 rounded-lg border p-4 md:p-6',
                hasUnabsorbed ? 'border-yellow-200 bg-yellow-50' : 'border-gray-600 bg-white',
              )}>
                <div className="flex items-start gap-2">
                  {hasUnabsorbed && (
                    <ExclamationTriangleIcon className="mt-0.5 shrink-0 text-yellow-900" />
                  )}

                  <div className="min-w-0 flex-1">
                    <strong className={cn(
                      'block text-sm',
                      hasUnabsorbed ? 'text-yellow-900' : 'text-gray-500',
                    )}>
                      Absorção do custo indireto
                    </strong>

                    <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                      <div>
                        <span className="block text-xs text-gray-400">
                          Despesa do período
                        </span>

                        <strong className="text-gray-500">
                          {formatCurrency(absorption.incurred)}
                        </strong>
                      </div>

                      <div>
                        <span className="block text-xs text-gray-400">
                          Absorvida pelas vendas
                        </span>

                        <strong className="text-gray-500">
                          {formatCurrency(absorption.absorbed)}
                        </strong>
                      </div>

                      <div>
                        <span className="block text-xs text-gray-400">
                          {absorption.unabsorbed >= 0
                            ? 'Sem absorver'
                            : 'Rateio sobrando'}
                        </span>

                        <strong className={
                          hasUnabsorbed ? 'text-yellow-900' : 'text-gray-500'
                        }>
                          {formatCurrency(Math.abs(absorption.unabsorbed))}
                        </strong>
                      </div>

                      <div>
                        <span className="block text-xs text-gray-400">
                          Rateio por unidade
                        </span>

                        <strong className="text-gray-500">
                          {absorption.costPerUnit === null
                            ? '—'
                            : formatCurrency(absorption.costPerUnit)}
                        </strong>
                      </div>
                    </div>

                    <p className={cn(
                      'mt-3 text-xs',
                      hasUnabsorbed ? 'text-yellow-900' : 'text-gray-400',
                    )}>
                      {hasUnabsorbed ? (
                        <>
                          O rateio esperava mais vendas do que houve, então{' '}
                          <strong>{formatCurrency(absorption.unabsorbed)}</strong>{' '}
                          de despesa real não entrou no custo de prato nenhum. O
                          lucro acima está maior que o do caixa exatamente nesse
                          valor.{' '}
                          <Link to="/settings/allocation" className="font-bold underline">
                            Revisar a estimativa de vendas
                          </Link>
                          .
                        </>
                      ) : absorption.unabsorbed < 0 ? (
                        <>
                          As vendas passaram da estimativa, então o rateio cobrou{' '}
                          {formatCurrency(Math.abs(absorption.unabsorbed))} a mais
                          do que a despesa do período. O lucro acima está
                          conservador.
                        </>
                      ) : (
                        'A despesa do período foi inteiramente absorvida pelas vendas.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-4">
              <Link to="/analytics/products" className="text-sm font-bold text-red-600">
                Ver os rankings de prato
              </Link>

              <Link to="/analytics/alerts" className="text-sm font-bold text-red-600">
                Ver os alertas
              </Link>

              <Link to="/analytics/costs" className="text-sm font-bold text-red-600">
                Ver o painel de custos
              </Link>
            </div>

            <NotesPanel
              className="mt-6"
              title="Ressalvas deste cálculo"
              notes={data.caveats}
            />
          </>
        )}
      </ListFeedback>
    </>
  );
}
