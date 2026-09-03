import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { analyticsService } from "../../../../../app/services/analyticsService";
import {
  analyticsQueryKey,
  analyticsStaleTime,
} from "../../../../../app/hooks/useAnalyticsQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatCompetenceDate } from "../../../../../app/utils/formatCompetenceDate";
import { stockMovementTypeLabels } from "../../../../../types/StockMovement";
import { SupplyMovementTotal } from "../../../../../types/Analytics";
import { ListFeedback } from "../../../../components/ListFeedback";
import { StockStatusBadge } from "../../../../components/StockStatusBadge";
import { ReportFilterBar } from "../../../../components/ReportFilterBar";
import { useAnalyticsFilters } from "../../useAnalyticsFilters";

interface SupplyTotalsListProps {
  title: string;
  description: string;
  items: SupplyMovementTotal[];
  emptyMessage: string;
}

function SupplyTotalsList({
  title,
  description,
  items,
  emptyMessage,
}: SupplyTotalsListProps) {
  const largest = Math.max(...items.map(item => Math.abs(item.cost)), 0);

  return (
    <section className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
      <strong className="block text-gray-500">{title}</strong>

      <span className="mt-1 block text-xs text-gray-400">{description}</span>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map(item => (
            <li key={item.supplyId}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  to={`/stock/supplies/${item.supplyId}`}
                  className="min-w-0 truncate text-sm font-medium text-gray-500 underline"
                >
                  {item.supplyName}
                </Link>

                <span className="whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(item.cost)}
                </span>
              </div>

              {/* Barra proporcional ao maior da lista: a ordem já vem da API. */}
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-500/10">
                <div
                  className="h-full bg-gray-500"
                  style={{
                    width: largest === 0
                      ? '0%'
                      : `${(Math.abs(item.cost) / largest) * 100}%`,
                  }}
                />
              </div>

              <span className="mt-1 block text-xs text-gray-400">
                {formatQuantity(item.quantityBase)} {item.baseUnit} em{' '}
                {item.movements} movimentação(ões)
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function StockDashboard() {
  const { filters, setFilters } = useAnalyticsFilters();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...analyticsQueryKey, 'stock', filters],
    queryFn: () => analyticsService.getStockDashboard(filters),
    staleTime: analyticsStaleTime,
  });

  return (
    <>
      <ReportFilterBar
        filters={filters}
        onChange={setFilters}
        periodHint="Em branco, o período é o mês corrente. O recorte vale para as vendas e para a despesa rateada."
        show={['supplyCategory', 'supply']}
      />

      <ListFeedback
        isLoading={isFetching && !data}
        isError={isError}
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar o painel de estoque."
        onRetry={refetch}
      >
        {data && (
          <>
            <p className="mb-6 text-sm text-gray-400">
              Movimentação de{' '}
              <strong className="text-gray-500">
                {formatCompetenceDate(data.period.from)}
              </strong>{' '}
              a{' '}
              <strong className="text-gray-500">
                {formatCompetenceDate(data.period.to)}
              </strong>
              . O valor e as contagens são a posição de <strong>hoje</strong>,
              não do fim do período.
            </p>

            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Valor em estoque</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(data.totalValue)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Insumos</span>

                <strong className="text-xl font-bold text-gray-500">
                  {data.counts.supplies}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Abaixo do mínimo</span>

                <strong className={cn(
                  'text-xl font-bold',
                  data.counts.belowMinimum > 0 ? 'text-yellow-800' : 'text-green-800',
                )}>
                  {data.counts.belowMinimum}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Zerados</span>

                <strong className="text-xl font-bold text-gray-500">
                  {data.counts.zero}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Negativos</span>

                <strong className={cn(
                  'text-xl font-bold',
                  data.counts.negative > 0 ? 'text-red-900' : 'text-green-800',
                )}>
                  {data.counts.negative}
                </strong>
              </div>
            </div>

            {data.counts.overMaximum > 0 && (
              <p className="mb-4 text-xs text-gray-400">
                {data.counts.overMaximum} insumo(s) acima do estoque máximo — capital
                parado, não falta.
              </p>
            )}

            {data.alerts.length > 0 && (
              <section className="mb-4 rounded-lg border border-gray-600 bg-white p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <strong className="block text-gray-500">
                      Insumos em alerta
                    </strong>

                    <span className="mt-1 block text-xs text-gray-400">
                      Do mais grave ao menos grave.
                    </span>
                  </div>

                  <Link to="/stock" className="text-sm font-bold text-red-600">
                    Abrir o estoque
                  </Link>
                </div>

                <ul className="mt-4 space-y-3">
                  {data.alerts.map(item => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-600/40 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/stock/supplies/${item.id}`}
                          className="block truncate font-medium text-gray-500 underline"
                        >
                          {item.name}
                        </Link>

                        <span className="text-xs text-gray-400">
                          {formatQuantity(item.currentStock)} {item.baseUnit.code}
                          {item.minStock > 0
                            && ` · mínimo ${formatQuantity(item.minStock)}`}
                          {item.shortfall > 0
                            && ` · faltam ${formatQuantity(item.shortfall)}`}
                        </span>
                      </div>

                      <span className="flex items-center gap-3">
                        <span className="whitespace-nowrap text-sm text-gray-400">
                          {formatCurrency(item.stockValue)}
                        </span>

                        <StockStatusBadge status={item.stockStatus} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SupplyTotalsList
                title="Maiores consumos"
                description="Saídas por venda e produção, em dinheiro, no período."
                items={data.topConsumption}
                emptyMessage="Nenhum consumo registrado no período."
              />

              <SupplyTotalsList
                title="Maiores perdas"
                description="Só o que foi lançado como perda — desvio não explicado é outra conta."
                items={data.topLosses}
                emptyMessage="Nenhuma perda lançada no período."
              />
            </div>

            <section className="mt-4 rounded-lg border border-gray-600 bg-white p-4 md:p-6">
              <strong className="block text-gray-500">
                Consumo por tipo de movimentação
              </strong>

              <span className="mt-1 block text-xs text-gray-400">
                O custo de cada movimentação é o do dia em que ela aconteceu:
                perder 2 kg em março custou o preço de março.
              </span>

              {data.consumptionByMovementType.length === 0 ? (
                <p className="mt-4 text-sm text-gray-400">
                  Nenhuma movimentação de consumo no período.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {data.consumptionByMovementType.map(row => (
                    <li
                      key={row.type}
                      className="flex flex-wrap items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-gray-500">
                        {stockMovementTypeLabels[row.type]}

                        <span className="ml-2 text-xs text-gray-400">
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
          </>
        )}
      </ListFeedback>
    </>
  );
}
