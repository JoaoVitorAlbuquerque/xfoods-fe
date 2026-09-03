import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { consumptionService } from "../../../../../app/services/consumptionService";
import {
  consumptionQueryKey,
  consumptionStaleTime,
} from "../../../../../app/hooks/useConsumptionQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatPercent } from "../../../../../app/utils/formatPercent";
import { ConsumptionClassificationBadge } from "../../../../components/ConsumptionClassificationBadge";
import { ContentHeader } from "../../../../components/ContentHeader";
import { Input } from "../../../../components/Input";
import { ListFeedback } from "../../../../components/ListFeedback";
import { TableComponents } from "../../../../components/TableElements";
import { ConsumptionFilterBar } from "../ConsumptionFilterBar";
import { ConsumptionPeriodLine } from "../ConsumptionPeriodLine";
import { InterpretationPanel } from "../InterpretationPanel";
import { useConsumptionFilters } from "../../useConsumptionFilters";

export function ConsumptionByProduct() {
  const { filters, setFilters } = useConsumptionFilters();
  const [search, setSearch] = useState('');

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...consumptionQueryKey, 'by-product', filters],
    queryFn: () => consumptionService.getByProduct(filters),
    staleTime: consumptionStaleTime,
  });

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return data?.items ?? [];
    }

    return (data?.items ?? []).filter(item =>
      item.productName.toLowerCase().includes(term)
      || item.supplyName.toLowerCase().includes(term),
    );
  }, [data, search]);

  const summary = data?.summary;

  return (
    <>
      <ConsumptionFilterBar filters={filters} onChange={setFilters} />

      <ListFeedback
        isLoading={isFetching && !data}
        isError={isError}
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar o Estimado × Real por prato."
        onRetry={refetch}
      >
        {data && summary && (
          <>
            <ConsumptionPeriodLine period={data.period} />

            {/*
              Perda e ajuste de inventário não sabem de qual prato vieram. Dizer
              isso antes da tabela evita que a linha seja lida como uma medição
              exata do consumo daquele prato.
            */}
            <p className="mb-4 flex items-start gap-2 rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
              <InfoCircledIcon className="mt-0.5 shrink-0" />

              <span>
                Uma perda de estoque não sabe de qual prato veio. Por isso o real
                de cada linha vem separado em <strong>medido</strong> — as
                movimentações da própria venda — e <strong>rateado</strong>, que
                é a fatia do desvio sem dono, distribuída na proporção do consumo
                previsto.
              </span>
            </p>

            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Pratos vendidos</span>

                <strong className="text-xl font-bold text-gray-500">
                  {summary.products}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Linhas</span>

                <strong className="text-xl font-bold text-gray-500">
                  {summary.rows}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  combinações prato × insumo
                </span>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Custo do desvio</span>

                <strong className={cn(
                  'text-xl font-bold',
                  summary.differenceCost > 0 ? 'text-yellow-800' : 'text-gray-500',
                )}>
                  {formatCurrency(summary.differenceCost)}
                </strong>
              </div>

              <div className={cn(
                'rounded-lg border p-4',
                summary.unallocatedDeviationCost !== 0
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-gray-600 bg-white',
              )}>
                <span className="block text-xs text-gray-400">Sem prato</span>

                <strong className={cn(
                  'text-xl font-bold',
                  summary.unallocatedDeviationCost !== 0
                    ? 'text-yellow-800'
                    : 'text-gray-500',
                )}>
                  {formatCurrency(summary.unallocatedDeviationCost)}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  desvio que nenhuma venda previa
                </span>
              </div>
            </div>

            {summary.unallocatedDeviationCost !== 0 && (
              <p className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-xs text-yellow-900">
                {formatCurrency(summary.unallocatedDeviationCost)} de desvio não
                couberam em prato nenhum: são insumos que saíram do estoque sem
                que venda alguma do período os previsse. Eles ficam fora da
                tabela abaixo de propósito — ratear seria inventar um dono.{' '}
                <Link to="/consumption/by-supply" className="font-bold underline">
                  Ver por insumo
                </Link>
                .
              </p>
            )}

            <ContentHeader title="Prato × insumo" quantity={items.length} />

            <div className="mb-6 sm:max-w-md">
              <Input
                name="search"
                placeholder="Buscar prato ou insumo"
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </div>

            {items.length === 0 && (
              <div className="rounded-lg border border-gray-600 bg-white p-8 text-center text-gray-400">
                Nenhuma linha para estes filtros.
              </div>
            )}

            <div className="space-y-3 md:hidden">
              {items.map(item => (
                <div
                  key={`${item.productId}-${item.supplyId}`}
                  className="rounded-lg border border-gray-600 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <strong className="block truncate text-gray-500">
                        {item.productName}
                      </strong>

                      <span className="text-xs text-gray-400">
                        {item.supplyName} · {formatQuantity(item.quantitySold)} vendida(s)
                      </span>
                    </div>

                    <ConsumptionClassificationBadge classification={item.classification} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="block text-xs text-gray-400">Estimado</span>
                      <span className="text-gray-500">
                        {formatQuantity(item.estimatedQuantity)} {item.baseUnit}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Real</span>
                      <span className="text-gray-500">
                        {formatQuantity(item.realQuantity)} {item.baseUnit}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Variação</span>

                      <strong className={cn(
                        item.difference > 0 ? 'text-red-900' : 'text-gray-500',
                      )}>
                        {formatPercent(item.variationPercent)}
                      </strong>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Custo do desvio</span>

                      <strong className={cn(
                        item.differenceCost > 0 ? 'text-red-900' : 'text-gray-500',
                      )}>
                        {formatCurrency(item.differenceCost)}
                      </strong>
                    </div>
                  </div>

                  <p className="mt-3 border-t border-gray-600/40 pt-2 text-xs text-gray-400">
                    Medido {formatQuantity(item.attribution.realAttributed)}{' '}
                    {item.baseUnit} · rateado{' '}
                    {formatQuantity(item.attribution.allocatedDeviation)}{' '}
                    {item.baseUnit}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <TableComponents.Table>
                <thead>
                  <tr className="bg-gray-600/20">
                    <TableComponents.TableHeader>Prato</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Insumo</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Vendidas</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Estimado</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Real</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Variação</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo do desvio</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Situação</TableComponents.TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {items.map(item => (
                    <TableComponents.TableRow key={`${item.productId}-${item.supplyId}`}>
                      <TableComponents.TableCell>
                        {item.productName}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>
                        <Link
                          to={`/stock/supplies/${item.supplyId}`}
                          className="underline"
                        >
                          {item.supplyName}
                        </Link>
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(item.quantitySold)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(item.estimatedQuantity)} {item.baseUnit}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(item.realQuantity)} {item.baseUnit}

                        <span
                          className="mt-1 block text-xs text-gray-400"
                          title={item.attribution.note}
                        >
                          medido {formatQuantity(item.attribution.realAttributed)} ·
                          rateado {formatQuantity(item.attribution.allocatedDeviation)}
                        </span>
                      </TableComponents.TableCell>

                      <TableComponents.TableCell
                        className={cn(
                          'whitespace-nowrap font-medium',
                          item.difference > 0 && 'text-red-900',
                        )}
                      >
                        {formatPercent(item.variationPercent)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell
                        className={cn(
                          'whitespace-nowrap font-medium',
                          item.differenceCost > 0 && 'text-red-900',
                        )}
                      >
                        {formatCurrency(item.differenceCost)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>
                        <ConsumptionClassificationBadge
                          classification={item.classification}
                        />
                      </TableComponents.TableCell>
                    </TableComponents.TableRow>
                  ))}
                </tbody>
              </TableComponents.Table>
            </div>

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
