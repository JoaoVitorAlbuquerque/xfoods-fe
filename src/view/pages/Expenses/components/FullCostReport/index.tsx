import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { costAllocationService } from "../../../../../app/services/costAllocationService";
import { costAllocationQueryKey } from "../../../../../app/hooks/useExpenseQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatCompetenceDate } from "../../../../../app/utils/formatCompetenceDate";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { NotesPanel } from "../../../../components/NotesPanel";
import { PeriodFilter } from "../../../../components/PeriodFilter";
import { TableComponents } from "../../../../components/TableElements";
import { MethodNotImplementedNotice } from "../MethodNotImplementedNotice";

export function FullCostReport() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const period = useMemo(() => ({
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }), [from, to]);

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: [...costAllocationQueryKey, 'full-cost', period],
    queryFn: () => costAllocationService.getFullCost(period),
  });

  const isNotImplemented =
    axios.isAxiosError(error) && error.response?.status === 501;

  const belowFullCost = data?.summary.belowFullCost ?? [];
  const withoutRecipe = data?.summary.productsWithoutRecipe ?? [];

  return (
    <>
      <div className="mb-6">
        <PeriodFilter from={from} to={to} onChangeFrom={setFrom} onChangeTo={setTo} />
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
        emptyMessage="Nenhum prato com ficha ativa para calcular o custo completo."
        errorMessage="Não foi possível carregar o custo completo."
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
              </strong>
            </p>

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Indireto por unidade</span>

                <strong className="text-xl font-bold text-gray-500">
                  {data.allocatedIndirectCostPerUnit === null
                    ? '—'
                    : formatCurrency(data.allocatedIndirectCostPerUnit)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Despesas do período</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(data.summary.indirectCostTotal)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Abaixo do custo completo</span>

                <strong className={cn(
                  'text-xl font-bold',
                  belowFullCost.length > 0 ? 'text-red-900' : 'text-green-800',
                )}>
                  {belowFullCost.length}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Sem ficha técnica</span>

                <strong className={cn(
                  'text-xl font-bold',
                  withoutRecipe.length > 0 ? 'text-yellow-800' : 'text-green-800',
                )}>
                  {withoutRecipe.length}
                </strong>
              </div>
            </div>

            {belowFullCost.length > 0 && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2 text-red-900">
                  <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                  <div className="min-w-0">
                    <strong className="block text-sm">
                      {belowFullCost.length} prato(s) com preço abaixo do custo completo
                    </strong>

                    <p className="mt-1 text-xs">
                      Nestes pratos, vender mais aumenta a perda.
                    </p>

                    <ul className="mt-3 space-y-1 text-xs">
                      {belowFullCost.map(item => (
                        <li key={item.productId ?? item.productName}>
                          <strong>{item.productName}</strong>: preço{' '}
                          {item.sellingPrice === null ? '—' : formatCurrency(item.sellingPrice)},
                          custo completo {formatCurrency(item.fullCost)} → resultado{' '}
                          {item.resultPerUnit === null ? '—' : formatCurrency(item.resultPerUnit)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {withoutRecipe.length > 0 && (
              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900">
                <strong className="block text-sm">
                  {withoutRecipe.length} prato(s) sem ficha ativa ficam fora deste relatório
                </strong>

                <p className="mt-1 text-xs">
                  Sem ficha não há custo direto, e o custo completo deles é
                  desconhecido:{' '}
                  {withoutRecipe.map(product => product.name).join(', ')}.{' '}
                  <Link to="/menu/recipes-coverage" className="font-bold underline">
                    Ver a cobertura de fichas
                  </Link>
                  .
                </p>
              </div>
            )}

            <ContentHeader title="Custo completo por prato" quantity={data.items.length} />

            <div className="space-y-3 md:hidden">
              {data.items.map(item => (
                <div
                  key={item.recipeId}
                  className={cn(
                    'rounded-lg border bg-white p-4',
                    item.resultPerUnit !== null && item.resultPerUnit < 0
                      ? 'border-red-200'
                      : 'border-gray-600',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong className="min-w-0 truncate text-gray-500">
                      {item.productName}
                    </strong>

                    {item.hasMissingCost && (
                      <span className="whitespace-nowrap rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-900">
                        custo incompleto
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="block text-xs text-gray-400">Custo direto</span>
                      <span className="text-gray-500">{formatCurrency(item.directCost)}</span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Custo indireto</span>
                      <span className="text-gray-500">
                        {formatCurrency(item.allocatedIndirectCost)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Custo completo</span>
                      <strong className="text-gray-500">{formatCurrency(item.fullCost)}</strong>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Preço de venda</span>
                      <span className="text-gray-500">
                        {item.sellingPrice === null ? '—' : formatCurrency(item.sellingPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-600/40 pt-2">
                    <span className="text-xs text-gray-400">Resultado por unidade</span>

                    <strong className={cn(
                      'text-sm',
                      item.resultPerUnit !== null && item.resultPerUnit < 0
                        ? 'text-red-900'
                        : 'text-gray-500',
                    )}>
                      {item.resultPerUnit === null ? '—' : formatCurrency(item.resultPerUnit)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <TableComponents.Table>
                <thead>
                  <tr className="bg-gray-600/20">
                    <TableComponents.TableHeader>Prato</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo direto</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo indireto</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo completo</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Preço de venda</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Resultado</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo / preço</TableComponents.TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {data.items.map(item => (
                    <TableComponents.TableRow key={item.recipeId}>
                      <TableComponents.TableCell>
                        {item.productName}

                        {item.hasMissingCost && (
                          <span
                            className="ml-2 rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-900"
                            title="A ficha usa insumo nunca comprado: o custo direto está subestimado."
                          >
                            custo incompleto
                          </span>
                        )}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatCurrency(item.directCost)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatCurrency(item.allocatedIndirectCost)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap font-medium">
                        {formatCurrency(item.fullCost)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {item.sellingPrice === null ? '—' : formatCurrency(item.sellingPrice)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell
                        className={cn(
                          'whitespace-nowrap font-medium',
                          item.resultPerUnit !== null && item.resultPerUnit < 0 && 'text-red-900',
                        )}
                      >
                        {item.resultPerUnit === null ? '—' : formatCurrency(item.resultPerUnit)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {item.fullCostPercentOfPrice === null
                          ? '—'
                          : `${formatQuantity(item.fullCostPercentOfPrice, 1)}%`}
                      </TableComponents.TableCell>
                    </TableComponents.TableRow>
                  ))}
                </tbody>
              </TableComponents.Table>
            </div>

            <NotesPanel
              className="mt-6"
              variant="info"
              title="Como ler este relatório"
              notes={data.notes}
            />
          </>
        )}
      </ListFeedback>
    </>
  );
}
