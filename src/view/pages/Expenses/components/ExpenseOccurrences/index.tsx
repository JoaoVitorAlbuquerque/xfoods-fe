import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { expensesService } from "../../../../../app/services/expensesService";
import { expensesQueryKey } from "../../../../../app/hooks/useExpenseQueries";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatCompetenceDate } from "../../../../../app/utils/formatCompetenceDate";
import {
  ExpenseRecurrence,
  ExpenseType,
  expenseRecurrenceLabels,
  expenseTypeLabels,
} from "../../../../../types/Expense";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { PeriodFilter } from "../../../../components/PeriodFilter";
import { TableComponents } from "../../../../components/TableElements";

export function ExpenseOccurrences() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const period = useMemo(() => ({
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }), [from, to]);

  const occurrencesQuery = useQuery({
    queryKey: [...expensesQueryKey, 'occurrences', period],
    queryFn: () => expensesService.getOccurrences(period),
  });

  const summaryQuery = useQuery({
    queryKey: [...expensesQueryKey, 'summary', period],
    queryFn: () => expensesService.getSummary(period),
  });

  const items = occurrencesQuery.data?.items ?? [];
  const summary = summaryQuery.data;

  return (
    <>
      <div className="mb-6">
        <PeriodFilter from={from} to={to} onChangeFrom={setFrom} onChangeTo={setTo} />
      </div>

      {occurrencesQuery.data && (
        <p className="mb-6 text-sm text-gray-400">
          Competência de{' '}
          <strong className="text-gray-500">
            {formatCompetenceDate(occurrencesQuery.data.period.from)}
          </strong>{' '}
          a{' '}
          <strong className="text-gray-500">
            {formatCompetenceDate(occurrencesQuery.data.period.to)}
          </strong>
          .
        </p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-600 bg-white p-4">
          <span className="block text-xs text-gray-400">Total do período</span>

          <strong className="text-2xl font-bold text-gray-500">
            {formatCurrency(summary?.total ?? 0)}
          </strong>
        </div>

        <div className="rounded-lg border border-gray-600 bg-white p-4">
          <span className="block text-xs text-gray-400">Competências</span>

          <strong className="text-2xl font-bold text-gray-500">
            {occurrencesQuery.data?.summary.occurrences ?? 0}
          </strong>
        </div>

        <div className="rounded-lg border border-gray-600 bg-white p-4">
          <span className="block text-xs text-gray-400">Despesas fixas</span>

          <strong className="text-xl font-bold text-gray-500">
            {formatCurrency(summary?.byType.FIXED ?? 0)}
          </strong>
        </div>

        <div className="rounded-lg border border-gray-600 bg-white p-4">
          <span className="block text-xs text-gray-400">Despesas variáveis</span>

          <strong className="text-xl font-bold text-gray-500">
            {formatCurrency(summary?.byType.VARIABLE ?? 0)}
          </strong>
        </div>
      </div>

      {summary && summary.byCategory.length > 0 && (
        <div className="mb-8 rounded-lg border border-gray-600 bg-white p-4 md:p-6">
          <strong className="text-sm font-bold text-gray-500">Por categoria</strong>

          <ul className="mt-3 space-y-2">
            {summary.byCategory.map(category => (
              <li
                key={category.categoryId ?? 'sem-categoria'}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="min-w-0 truncate text-gray-500">
                  {category.name}

                  {category.nature === 'DIRECT' && (
                    <span
                      className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-400"
                      title="Categoria marcada como custo direto: fica fora do rateio para não ser contada duas vezes."
                    >
                      direto
                    </span>
                  )}
                </span>

                <strong className="whitespace-nowrap text-gray-500">
                  {formatCurrency(category.total)}
                </strong>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-gray-600/40 pt-3">
            <strong className="text-xs font-bold uppercase text-gray-400">
              Por periodicidade
            </strong>

            <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              {Object.entries(summary.byRecurrence).map(([recurrence, total]) => (
                <li key={recurrence}>
                  {expenseRecurrenceLabels[recurrence as ExpenseRecurrence]}:{' '}
                  <strong>{formatCurrency(total)}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <ContentHeader title="Extrato de competências" quantity={items.length} />

      <p className="mb-4 flex items-start gap-2 text-sm text-gray-400">
        <InfoCircledIcon className="mt-0.5 shrink-0" />

        Cada repetição da regra vira uma linha datada. É o que prova que o
        aluguel de março está sendo contado sem ninguém precisar lançar nada.
      </p>

      <ListFeedback
        isLoading={occurrencesQuery.isFetching}
        isError={occurrencesQuery.isError}
        isEmpty={items.length === 0}
        emptyMessage="Nenhuma competência neste período."
        errorMessage="Não foi possível carregar o extrato de competências."
        onRetry={occurrencesQuery.refetch}
      >
        <div className="space-y-3 md:hidden">
          {items.map((item, index) => (
            <div
              key={`${item.expenseId}-${item.competenceDate}-${index}`}
              className="rounded-lg border border-gray-600 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-gray-500">
                    {item.description}
                  </strong>

                  <span className="text-xs text-gray-400">
                    {formatCompetenceDate(item.competenceDate)} ·{' '}
                    {item.category?.name ?? 'Sem categoria'}
                  </span>
                </div>

                <strong className="whitespace-nowrap text-gray-500">
                  {formatCurrency(item.amount)}
                </strong>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <TableComponents.Table>
            <thead>
              <tr className="bg-gray-600/20">
                <TableComponents.TableHeader>Competência</TableComponents.TableHeader>
                <TableComponents.TableHeader>Despesa</TableComponents.TableHeader>
                <TableComponents.TableHeader>Categoria</TableComponents.TableHeader>
                <TableComponents.TableHeader>Tipo</TableComponents.TableHeader>
                <TableComponents.TableHeader>Periodicidade</TableComponents.TableHeader>
                <TableComponents.TableHeader>Valor</TableComponents.TableHeader>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <TableComponents.TableRow key={`${item.expenseId}-${item.competenceDate}-${index}`}>
                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatCompetenceDate(item.competenceDate)}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>{item.description}</TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {item.category?.name ?? '—'}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {expenseTypeLabels[item.type as ExpenseType]}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {expenseRecurrenceLabels[item.recurrence]}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap font-medium">
                    {formatCurrency(item.amount)}
                  </TableComponents.TableCell>
                </TableComponents.TableRow>
              ))}
            </tbody>
          </TableComponents.Table>
        </div>
      </ListFeedback>
    </>
  );
}
