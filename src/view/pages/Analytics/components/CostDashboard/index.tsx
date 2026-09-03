import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { analyticsService } from "../../../../../app/services/analyticsService";
import {
  analyticsQueryKey,
  analyticsStaleTime,
} from "../../../../../app/hooks/useAnalyticsQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatPercent, formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { formatCompetenceDate } from "../../../../../app/utils/formatCompetenceDate";
import { stockMovementTypeLabels } from "../../../../../types/StockMovement";
import { DataQualityBadge } from "../../../../components/DataQualityBadge";
import { ListFeedback } from "../../../../components/ListFeedback";
import { NotesPanel } from "../../../../components/NotesPanel";
import { AnalyticsFilterBar } from "../AnalyticsFilterBar";
import { useAnalyticsFilters } from "../../useAnalyticsFilters";

export function CostDashboard() {
  const { filters, setFilters } = useAnalyticsFilters();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...analyticsQueryKey, 'costs', filters],
    queryFn: () => analyticsService.getCostDashboard(filters),
    staleTime: analyticsStaleTime,
  });

  const deviation = data?.estimatedVsReal;
  const spentMore = (deviation?.deviationCost ?? 0) > 0;
  const absorption = data?.indirectAbsorption;

  return (
    <>
      <AnalyticsFilterBar
        filters={filters}
        onChange={setFilters}
        show={['category', 'product', 'supplyCategory', 'supply']}
      />

      <ListFeedback
        isLoading={isFetching && !data}
        isError={isError}
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar o painel de custos."
        onRetry={refetch}
      >
        {data && deviation && (
          <>
            <p className="mb-6 text-sm text-gray-400">
              De{' '}
              <strong className="text-gray-500">
                {formatCompetenceDate(data.period.from)}
              </strong>{' '}
              a{' '}
              <strong className="text-gray-500">
                {formatCompetenceDate(data.period.to)}
              </strong>
            </p>

            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Custo total</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(data.totalCost)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Custo direto</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(data.directCost)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Custo indireto</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(data.indirectCost)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  Custo médio por unidade
                </span>

                <strong className="text-xl font-bold text-gray-500">
                  {data.averageCostPerUnit === null
                    ? '—'
                    : formatCurrency(data.averageCostPerUnit)}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  direto:{' '}
                  {data.averageDirectCostPerUnit === null
                    ? '—'
                    : formatCurrency(data.averageDirectCostPerUnit)}
                </span>
              </div>
            </div>

            <DataQualityBadge className="mb-4" dataQuality={data.dataQuality} />

            {/*
              Regra 4.6: a diferença entre estimado e real NÃO é desperdício.
              O bloco mostra a comparação e diz, na mesma tela, as causas
              possíveis — em vez de rotular o desvio de perda.
            */}
            <section className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
              <strong className="block text-gray-500">Estimado × real</strong>

              <span className="mt-1 block text-xs text-gray-400">
                O que as fichas previam contra o que de fato saiu do estoque, em
                dinheiro.
              </span>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-600 p-4">
                  <span className="block text-xs text-gray-400">
                    Estimado pelas fichas
                  </span>

                  <strong className="text-lg font-bold text-gray-500">
                    {formatCurrency(deviation.estimatedConsumptionCost)}
                  </strong>
                </div>

                <div className="rounded-lg border border-gray-600 p-4">
                  <span className="block text-xs text-gray-400">
                    Real, pelo razão de estoque
                  </span>

                  <strong className="text-lg font-bold text-gray-500">
                    {formatCurrency(deviation.realConsumptionCost)}
                  </strong>
                </div>

                <div className={cn(
                  'rounded-lg border p-4',
                  spentMore ? 'border-yellow-200 bg-yellow-50' : 'border-gray-600',
                )}>
                  <span className="block text-xs text-gray-400">Desvio</span>

                  <strong className={cn(
                    'text-lg font-bold',
                    spentMore ? 'text-yellow-800' : 'text-gray-500',
                  )}>
                    {formatCurrency(deviation.deviationCost)}
                  </strong>

                  <span className="mt-1 block text-xs text-gray-400">
                    {formatPercent(deviation.deviationPercent)} do estimado
                  </span>
                </div>
              </div>

              <p className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                <InfoCircledIcon className="mt-0.5 shrink-0" />

                <span>
                  <strong>Desvio não é desperdício.</strong> Saiu mais do que a
                  ficha previa pode ser perda, mas também erro de lançamento,
                  inventário, produção, ajuste ou consumo não registrado. A
                  quebra por insumo, com tolerância e classificação de causa,
                  está no relatório de consumo. {deviation.note}
                </span>
              </p>

              {deviation.byMovementType.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-gray-600/40 pt-4">
                  {deviation.byMovementType.map(row => (
                    <li
                      key={row.type}
                      className="flex flex-wrap items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-gray-500">
                        {stockMovementTypeLabels[row.type]}

                        <span className="ml-2 text-xs text-gray-400">
                          {formatQuantity(row.quantityBase)} em base ·{' '}
                          {row.movements} movimentação(ões)
                        </span>
                      </span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(row.cost)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
                <strong className="block text-gray-500">Desperdício lançado</strong>

                <span className="mt-1 block text-xs text-gray-400">
                  Só as perdas que alguém registrou — este número, sim, é
                  desperdício.
                </span>

                <strong className="mt-3 block text-2xl font-bold text-gray-500">
                  {formatCurrency(data.waste.registeredLossCost)}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  {data.waste.shareOfConsumptionPercent === null
                    ? 'Sem consumo no período para comparar.'
                    : `${formatPercentPlain(data.waste.shareOfConsumptionPercent)} do consumo real do período`}
                </span>

                <Link
                  to="/stock/movements"
                  className="mt-3 inline-block text-sm font-bold text-red-600"
                >
                  Ver as perdas lançadas
                </Link>
              </section>

              {absorption && (
                <section className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
                  <strong className="block text-gray-500">
                    Absorção do custo indireto
                  </strong>

                  <span className="mt-1 block text-xs text-gray-400">
                    Despesa do período contra o que as vendas absorveram.
                  </span>

                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Despesa incorrida</span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(absorption.incurred)}
                      </span>
                    </li>

                    <li className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Absorvida</span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(absorption.absorbed)}
                      </span>
                    </li>

                    <li className="flex items-center justify-between gap-3 border-t border-gray-600/40 pt-2">
                      <strong className="text-gray-500">
                        {absorption.unabsorbed >= 0 ? 'Sem absorver' : 'Rateio sobrando'}
                      </strong>

                      <strong className={cn(
                        'whitespace-nowrap',
                        absorption.unabsorbed > 0 ? 'text-yellow-800' : 'text-gray-500',
                      )}>
                        {formatCurrency(Math.abs(absorption.unabsorbed))}
                      </strong>
                    </li>
                  </ul>

                  {absorption.unabsorbed > 0 && (
                    <p className="mt-3 text-xs text-yellow-800">
                      Despesa real que não entrou no custo de prato nenhum.{' '}
                      <Link to="/settings/allocation" className="font-bold underline">
                        Revisar a estimativa de vendas
                      </Link>
                      .
                    </p>
                  )}
                </section>
              )}
            </div>

            <section className="mt-4 rounded-lg border border-gray-600 bg-white p-4 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <strong className="block text-gray-500">
                    Variação de custo de insumo
                  </strong>

                  <span className="mt-1 block text-xs text-gray-400">
                    {data.costVariation.summary.increased} subiram ·{' '}
                    {data.costVariation.summary.decreased} caíram ·{' '}
                    {data.costVariation.summary.unchanged} sem mudança ·{' '}
                    {data.costVariation.summary.firstPurchase} na primeira compra
                  </span>
                </div>

                <Link
                  to="/purchases/cost-report"
                  className="text-sm font-bold text-red-600"
                >
                  Ver o relatório completo
                </Link>
              </div>

              {data.costVariation.topIncreases.length === 0 ? (
                <p className="mt-4 text-sm text-gray-400">
                  Nenhum insumo encareceu na última compra.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {data.costVariation.topIncreases.map(item => (
                    <li
                      key={item.supplyId}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-600/40 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/purchases/supplies/${item.supplyId}/history`}
                          className="block truncate font-medium text-gray-500 underline"
                        >
                          {item.supplyName}
                        </Link>

                        <span className="text-xs text-gray-400">
                          {item.previousUnitCostBase === null
                            ? '—'
                            : formatCurrency(item.previousUnitCostBase)}{' '}
                          → {formatCurrency(item.currentUnitCostBase)} por{' '}
                          {item.baseUnit.code}
                        </span>
                      </div>

                      <strong className="whitespace-nowrap text-sm text-red-900">
                        {formatPercent(item.variationPercent)}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>

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
