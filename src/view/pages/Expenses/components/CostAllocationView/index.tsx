import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { costAllocationService } from "../../../../../app/services/costAllocationService";
import { costAllocationQueryKey } from "../../../../../app/hooks/useExpenseQueries";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatCompetenceDate } from "../../../../../app/utils/formatCompetenceDate";
import {
  allocationMethodLabels,
  allocationPeriodLabels,
} from "../../../../../types/CostAllocation";
import { ListFeedback } from "../../../../components/ListFeedback";
import { NotesPanel } from "../../../../components/NotesPanel";
import { PeriodFilter } from "../../../../components/PeriodFilter";
import { MethodNotImplementedNotice } from "../MethodNotImplementedNotice";

export function CostAllocationView() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const period = useMemo(() => ({
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }), [from, to]);

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: [...costAllocationQueryKey, 'allocation', period],
    queryFn: () => costAllocationService.getAllocation(period),
  });

  const isNotImplemented =
    axios.isAxiosError(error) && error.response?.status === 501;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PeriodFilter from={from} to={to} onChangeFrom={setFrom} onChangeTo={setTo} />

        <Link to="/settings/allocation" className="text-sm font-bold text-red-600">
          Configurar rateio
        </Link>
      </div>

      {isNotImplemented && (
        <div className="mb-6">
          <MethodNotImplementedNotice error={error} />
        </div>
      )}

      <ListFeedback
        isLoading={isFetching}
        isError={isError && !isNotImplemented}
        isEmpty={!data && !isNotImplemented}
        emptyMessage="Nenhum custo operacional no período."
        errorMessage="Não foi possível carregar o rateio de custo indireto."
        onRetry={refetch}
      >
        {data && (
          <>
            <p className="mb-6 text-sm text-gray-400">
              Competência de{' '}
              <strong className="text-gray-500">
                {formatCompetenceDate(data.period.from)}
              </strong>{' '}
              a{' '}
              <strong className="text-gray-500">
                {formatCompetenceDate(data.period.to)}
              </strong>{' '}
              · método {allocationMethodLabels[data.method]}
            </p>

            <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
              <ul className="space-y-2">
                {data.indirectCost.byCategory.map(category => (
                  <li
                    key={category.categoryId ?? 'sem-categoria'}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 truncate text-gray-500">{category.name}</span>

                    <span className="whitespace-nowrap text-gray-500">
                      {formatCurrency(category.total)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-600/40 pt-3">
                <strong className="text-gray-500">Total</strong>

                <strong className="text-gray-500">
                  {formatCurrency(data.indirectCost.total)}
                </strong>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 text-sm text-gray-400">
                <span>
                  ÷ {formatQuantity(data.divisor.estimatedSalesUnits)} unidades estimadas
                </span>

                <span>
                  {formatQuantity(data.divisor.estimatedSalesUnitsPerPeriod)}{' '}
                  {allocationPeriodLabels[data.divisor.referencePeriod].toLowerCase()}
                  {data.divisor.referencePeriods > 1
                    && ` × ${data.divisor.referencePeriods} período(s)`}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-600/40 pt-4">
                <span className="font-medium text-gray-500">
                  Custo indireto por unidade
                </span>

                <strong className="text-2xl font-bold text-gray-500">
                  {data.costPerUnit === null ? '—' : formatCurrency(data.costPerUnit)}
                </strong>
              </div>

              {data.costPerUnit === null && (
                <p className="mt-2 text-xs text-yellow-800">
                  Sem vendas estimadas configuradas não há divisor, e por isso
                  não existe custo por unidade.{' '}
                  <Link to="/settings/allocation" className="font-bold underline">
                    Informe a estimativa
                  </Link>
                  .
                </p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  Pelas vendas reais do período
                </span>

                <strong className="text-xl font-bold text-gray-500">
                  {data.costPerUnitByActualSales === null
                    ? '—'
                    : formatCurrency(data.costPerUnitByActualSales)}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  O mesmo cálculo com o volume que de fato saiu — é o teste da
                  estimativa.
                </span>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Unidades vendidas</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatQuantity(data.divisor.actualSalesUnits)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Faturamento do período</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(data.divisor.actualRevenue)}
                </strong>
              </div>
            </div>

            <NotesPanel
              className="mt-6"
              title="Ressalvas deste cálculo"
              notes={data.caveats}
            />

            <p className="mt-6 text-xs text-gray-400">
              Entram no rateio:{' '}
              {data.settings.includeFixed ? 'despesas fixas' : ''}
              {data.settings.includeFixed && data.settings.includeVariable ? ' e ' : ''}
              {data.settings.includeVariable ? 'despesas variáveis' : ''}
              {!data.settings.includeFixed && !data.settings.includeVariable
                && 'nenhum tipo de despesa — o total sai zero por configuração'}
              . Despesas marcadas como fora do rateio e categorias de natureza
              direta ficam de fora.
            </p>

            {data.indirectCost.expenses.length > 0 && (
              <div className="mt-6 rounded-lg border border-gray-600 bg-white p-4 md:p-6">
                <strong className="text-sm font-bold text-gray-500">
                  Despesas somadas ({data.indirectCost.expenses.length})
                </strong>

                <ul className="mt-3 space-y-2">
                  {data.indirectCost.expenses.map(expense => (
                    <li
                      key={expense.expenseId}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 truncate text-gray-500">
                        {expense.description}

                        <span className="ml-2 text-xs text-gray-400">
                          {expense.occurrences} competência(s)
                        </span>
                      </span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(expense.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </ListFeedback>
    </>
  );
}
