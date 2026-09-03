import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { stockCountsService } from "../../../../../app/services/stockCountsService";
import { stockCountsQueryKey } from "../../../../../app/hooks/useStockQueries";
import { formatDate } from "../../../../../app/utils/formatDate";
import { cn } from "../../../../../app/utils/cn";
import {
  stockCountStatusClasses,
  stockCountStatusLabels,
} from "../../../../../types/StockCount";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { TableComponents } from "../../../../components/TableElements";
import { NewStockCountModal } from "./components/NewStockCountModal";

export function StockCounts() {
  const [isCreating, setIsCreating] = useState(false);

  const { data = [], isFetching, isError, refetch } = useQuery({
    queryKey: stockCountsQueryKey,
    queryFn: stockCountsService.getAll,
  });

  return (
    <>
      <NewStockCountModal visible={isCreating} onClose={() => setIsCreating(false)} />

      <ContentHeader title="Inventários" quantity={data.length}>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="pt-1 text-sm font-bold text-red-600"
        >
          Novo Inventário
        </button>
      </ContentHeader>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={data.length === 0}
        emptyMessage="Nenhum inventário registrado ainda."
        errorMessage="Não foi possível carregar os inventários."
        onRetry={refetch}
      >
        <div className="space-y-3 md:hidden">
          {data.map(stockCount => (
            <Link
              key={stockCount.id}
              to={`/stock/counts/${stockCount.id}`}
              className="block rounded-lg border border-gray-600 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm text-gray-500">
                  {formatDate(new Date(stockCount.countedAt))}
                </strong>

                <span className={cn(
                  'rounded px-2 py-0.5 text-xs font-medium',
                  stockCountStatusClasses[stockCount.status],
                )}>
                  {stockCountStatusLabels[stockCount.status]}
                </span>
              </div>

              <span className="mt-2 block text-xs text-gray-400">
                {stockCount._count.items} insumo(s) contado(s)
              </span>

              {stockCount.note && (
                <p className="mt-1 text-xs text-gray-400">{stockCount.note}</p>
              )}
            </Link>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <TableComponents.Table>
            <thead>
              <tr className="bg-gray-600/20">
                <TableComponents.TableHeader>Data</TableComponents.TableHeader>
                <TableComponents.TableHeader>Situação</TableComponents.TableHeader>
                <TableComponents.TableHeader>Itens</TableComponents.TableHeader>
                <TableComponents.TableHeader>Observação</TableComponents.TableHeader>
                <TableComponents.TableHeader>Ações</TableComponents.TableHeader>
              </tr>
            </thead>

            <tbody>
              {data.map(stockCount => (
                <TableComponents.TableRow key={stockCount.id}>
                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatDate(new Date(stockCount.countedAt))}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    <span className={cn(
                      'rounded px-2 py-0.5 text-xs font-medium',
                      stockCountStatusClasses[stockCount.status],
                    )}>
                      {stockCountStatusLabels[stockCount.status]}
                    </span>
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {stockCount._count.items}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {stockCount.note ?? '—'}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    <Link
                      to={`/stock/counts/${stockCount.id}`}
                      className="text-sm font-bold text-red-600"
                    >
                      Abrir
                    </Link>
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
