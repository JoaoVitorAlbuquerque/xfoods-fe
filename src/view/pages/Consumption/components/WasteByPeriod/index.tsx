import { useQuery } from "@tanstack/react-query";

import { consumptionService } from "../../../../../app/services/consumptionService";
import {
  consumptionQueryKey,
  consumptionStaleTime,
} from "../../../../../app/hooks/useConsumptionQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatPercent } from "../../../../../app/utils/formatPercent";
import { PeriodGrouping, periodGroupingLabels } from "../../../../../types/Consumption";
import { stockMovementTypeLabels, StockMovementType } from "../../../../../types/StockMovement";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { TableComponents } from "../../../../components/TableElements";
import { ConsumptionFilterBar } from "../ConsumptionFilterBar";
import { ConsumptionPeriodLine } from "../ConsumptionPeriodLine";
import { InterpretationPanel } from "../InterpretationPanel";
import { useConsumptionFilters } from "../../useConsumptionFilters";

/**
 * A chave já vem no fuso de quem lançou (`AAAA-MM-DD` ou `AAAA-MM`). Passá-la
 * por `new Date()` a interpretaria como UTC e jogaria o dia 1 para o dia 31 do
 * mês anterior — o mesmo cuidado das datas de competência.
 */
function formatBucket(bucket: string, groupBy: PeriodGrouping) {
  const [year, month, day] = bucket.split('-');

  if (groupBy === 'MONTH' || !day) {
    return `${month}/${year}`;
  }

  if (groupBy === 'WEEK') {
    return `semana de ${day}/${month}`;
  }

  return `${day}/${month}/${year}`;
}

export function WasteByPeriod() {
  const { filters, setFilters } = useConsumptionFilters();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...consumptionQueryKey, 'waste-by-period', filters],
    queryFn: () => consumptionService.getWasteByPeriod(filters),
    staleTime: consumptionStaleTime,
  });

  /** Escala das barras: o maior custo da série, estimado ou real. */
  const largest = Math.max(
    ...(data?.items ?? []).flatMap(item => [item.estimatedCost, item.realCost]),
    0,
  );

  return (
    <>
      <ConsumptionFilterBar filters={filters} onChange={setFilters} showGrouping />

      <ListFeedback
        isLoading={isFetching && !data}
        isError={isError}
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar o desperdício por período."
        onRetry={refetch}
      >
        {data && (
          <>
            <ConsumptionPeriodLine period={data.period}>
              {' '}· {periodGroupingLabels[data.groupBy].toLowerCase()}
            </ConsumptionPeriodLine>

            <ContentHeader
              title={`Desvio ${periodGroupingLabels[data.groupBy].toLowerCase()}`}
              quantity={data.items.length}
            />

            {data.items.length === 0 ? (
              <div className="rounded-lg border border-gray-600 bg-white p-8 text-center text-gray-400">
                Nenhum consumo no período.
              </div>
            ) : (
              <>
                <section className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
                  <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-2">
                      <span className="size-3 rounded bg-gray-500" /> Estimado
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="size-3 rounded bg-red-800" /> Real
                    </span>
                  </div>

                  <ul className="space-y-4">
                    {data.items.map(item => (
                      <li key={item.bucket}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-sm font-medium text-gray-500">
                            {formatBucket(item.bucket, data.groupBy)}
                          </span>

                          <span className="text-sm">
                            <strong className={cn(
                              item.differenceCost > 0 ? 'text-red-900' : 'text-gray-500',
                            )}>
                              {formatCurrency(item.differenceCost)}
                            </strong>

                            <span className="ml-2 text-xs text-gray-400">
                              {formatPercent(item.wastePercent)}
                            </span>
                          </span>
                        </div>

                        <div className="mt-2 space-y-1">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-500/10">
                            <div
                              className="h-full bg-gray-500"
                              style={{
                                width: largest === 0
                                  ? '0%'
                                  : `${(item.estimatedCost / largest) * 100}%`,
                              }}
                            />
                          </div>

                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-500/10">
                            <div
                              className="h-full bg-red-800"
                              style={{
                                width: largest === 0
                                  ? '0%'
                                  : `${(item.realCost / largest) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                <div className="mt-4 space-y-3 md:hidden">
                  {data.items.map(item => (
                    <div
                      key={item.bucket}
                      className="rounded-lg border border-gray-600 bg-white p-4"
                    >
                      <strong className="block text-gray-500">
                        {formatBucket(item.bucket, data.groupBy)}
                      </strong>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="block text-xs text-gray-400">Estimado</span>
                          <span className="text-gray-500">
                            {formatCurrency(item.estimatedCost)}
                          </span>
                        </div>

                        <div>
                          <span className="block text-xs text-gray-400">Real</span>
                          <span className="text-gray-500">
                            {formatCurrency(item.realCost)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-gray-600/40 pt-2">
                        <span className="text-xs text-gray-400">Desvio</span>

                        <strong className={cn(
                          'text-sm',
                          item.differenceCost > 0 ? 'text-red-900' : 'text-gray-500',
                        )}>
                          {formatCurrency(item.differenceCost)}
                        </strong>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(Object.entries(item.costByMovementType) as [StockMovementType, number][])
                          .map(([type, cost]) => (
                            <span
                              key={type}
                              className="rounded bg-gray-500/10 px-2 py-0.5 text-xs text-gray-500"
                            >
                              {stockMovementTypeLabels[type]} {formatCurrency(cost)}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 hidden overflow-x-auto md:block">
                  <TableComponents.Table>
                    <thead>
                      <tr className="bg-gray-600/20">
                        <TableComponents.TableHeader>Período</TableComponents.TableHeader>
                        <TableComponents.TableHeader>Estimado</TableComponents.TableHeader>
                        <TableComponents.TableHeader>Real</TableComponents.TableHeader>
                        <TableComponents.TableHeader>Desvio</TableComponents.TableHeader>
                        <TableComponents.TableHeader>Sobre o previsto</TableComponents.TableHeader>
                        <TableComponents.TableHeader>Por tipo</TableComponents.TableHeader>
                      </tr>
                    </thead>

                    <tbody>
                      {data.items.map(item => (
                        <TableComponents.TableRow key={item.bucket}>
                          <TableComponents.TableCell className="whitespace-nowrap">
                            {formatBucket(item.bucket, data.groupBy)}
                          </TableComponents.TableCell>

                          <TableComponents.TableCell className="whitespace-nowrap">
                            {formatCurrency(item.estimatedCost)}
                          </TableComponents.TableCell>

                          <TableComponents.TableCell className="whitespace-nowrap">
                            {formatCurrency(item.realCost)}
                          </TableComponents.TableCell>

                          <TableComponents.TableCell
                            className={cn(
                              'whitespace-nowrap font-medium',
                              item.differenceCost > 0 && 'text-red-900',
                            )}
                          >
                            {formatCurrency(item.differenceCost)}
                          </TableComponents.TableCell>

                          <TableComponents.TableCell className="whitespace-nowrap">
                            {formatPercent(item.wastePercent)}
                          </TableComponents.TableCell>

                          <TableComponents.TableCell>
                            <div className="flex flex-wrap gap-2">
                              {(Object.entries(item.costByMovementType) as [StockMovementType, number][])
                                .map(([type, cost]) => (
                                  <span
                                    key={type}
                                    className="whitespace-nowrap rounded bg-gray-500/10 px-2 py-0.5 text-xs"
                                  >
                                    {stockMovementTypeLabels[type]} {formatCurrency(cost)}
                                  </span>
                                ))}
                            </div>
                          </TableComponents.TableCell>
                        </TableComponents.TableRow>
                      ))}
                    </tbody>
                  </TableComponents.Table>
                </div>

                <p className="mt-4 text-xs text-gray-400">
                  O estimado de cada período sai das vendas pagas nele; o real,
                  das movimentações lançadas nele. Um preparo feito na segunda
                  para vender na terça aparece como desvio na segunda e como
                  sobra na terça, sem que nada esteja errado.
                </p>
              </>
            )}

            <InterpretationPanel
              className="mt-6"
              interpretation={data.interpretation}
            />
          </>
        )}
      </ListFeedback>
    </>
  );
}
