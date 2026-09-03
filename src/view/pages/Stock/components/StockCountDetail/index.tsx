import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";

import { stockCountsService } from "../../../../../app/services/stockCountsService";
import { stockCountsQueryKey, useInvalidateStock } from "../../../../../app/hooks/useStockQueries";
import { formatDate } from "../../../../../app/utils/formatDate";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { cn } from "../../../../../app/utils/cn";
import {
  stockCountStatusClasses,
  stockCountStatusLabels,
} from "../../../../../types/StockCount";
import { Button } from "../../../../components/Button";
import { ListFeedback } from "../../../../components/ListFeedback";
import { Modal } from "../../../../components/Modal";
import { TableComponents } from "../../../../components/TableElements";

export function StockCountDetail() {
  const { stockCountId } = useParams<{ stockCountId: string }>();
  const [confirming, setConfirming] = useState<'apply' | 'cancel' | null>(null);

  const { data: stockCount, isFetching, isError, refetch } = useQuery({
    queryKey: [...stockCountsQueryKey, stockCountId],
    queryFn: () => stockCountsService.getById(stockCountId!),
    enabled: Boolean(stockCountId),
  });

  const invalidateStock = useInvalidateStock();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (action: 'apply' | 'cancel') => (
      action === 'apply'
        ? stockCountsService.apply(stockCountId!)
        : stockCountsService.cancel(stockCountId!)
    ),
  });

  const handleConfirm = useCallback(async () => {
    if (!confirming) {
      return;
    }

    try {
      await mutateAsync(confirming);

      invalidateStock();
      refetch();
      toast.success(
        confirming === 'apply'
          ? 'Inventário aplicado: os ajustes foram lançados.'
          : 'Inventário cancelado.',
      );
      setConfirming(null);
    } catch (error) {
      toastApiError(error, 'Não foi possível concluir a operação!');
    }
  }, [confirming, mutateAsync, invalidateStock, refetch]);

  const isOpen = stockCount?.status === 'OPEN';

  return (
    <>
      {confirming && (
        <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
          <Modal
            visible
            onClose={() => setConfirming(null)}
            title={confirming === 'apply' ? 'Aplicar Inventário' : 'Cancelar Inventário'}
          >
            <div className="flex flex-col items-center gap-4 sm:max-w-[420px]">
              <span className="text-center font-medium text-gray-400">
                {confirming === 'apply'
                  ? 'Aplicar gera um ajuste de estoque para cada insumo com diferença.'
                  : 'Cancelar descarta esta contagem sem tocar no estoque.'}
              </span>

              {confirming === 'apply' && (
                <span className="text-center text-xs text-gray-400">
                  A ação é irreversível e entra tudo de uma vez: ou o inventário
                  inteiro é aplicado, ou nenhum ajuste é lançado. O saldo comparado
                  é o de agora, não o do momento da contagem.
                </span>
              )}
            </div>

            <footer className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                disabled={isPending}
                className="py-3 font-bold text-red-800"
              >
                Voltar
              </button>

              <Button onClick={handleConfirm} isLoading={isPending} className="w-full sm:w-auto">
                {confirming === 'apply' ? 'Aplicar Inventário' : 'Cancelar Inventário'}
              </Button>
            </footer>
          </Modal>
        </div>
      )}

      <Link
        to="/stock/counts"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-400"
      >
        <ChevronLeftIcon />
        Voltar para inventários
      </Link>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={!stockCount}
        emptyMessage="Inventário não encontrado."
        errorMessage="Não foi possível carregar o inventário."
        onRetry={refetch}
      >
        {stockCount && (
          <>
            <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-500">
                    Contagem de {formatDate(new Date(stockCount.countedAt))}
                  </h2>

                  <span className="text-sm text-gray-400">
                    {stockCount.items.length} insumo(s)
                    {stockCount.appliedAt && ` · aplicado em ${formatDate(new Date(stockCount.appliedAt))}`}
                    {stockCount.canceledAt && ` · cancelado em ${formatDate(new Date(stockCount.canceledAt))}`}
                  </span>

                  {stockCount.note && (
                    <p className="mt-1 text-sm text-gray-400">{stockCount.note}</p>
                  )}
                </div>

                <span className={cn(
                  'rounded px-2 py-0.5 text-xs font-medium',
                  stockCountStatusClasses[stockCount.status],
                )}>
                  {stockCountStatusLabels[stockCount.status]}
                </span>
              </div>

              {isOpen && (
                <>
                  <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
                    Este inventário ainda não encostou no estoque. Aplicar é que
                    gera os ajustes.
                  </p>

                  <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setConfirming('cancel')}
                      className="rounded-full border border-gray-600 px-4 py-2 text-sm font-medium text-gray-500"
                    >
                      Cancelar inventário
                    </button>

                    <Button onClick={() => setConfirming('apply')} className="w-full sm:w-auto">
                      Aplicar inventário
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 overflow-x-auto">
              <TableComponents.Table>
                <thead>
                  <tr className="bg-gray-600/20">
                    <TableComponents.TableHeader>Insumo</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Contado</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Sistema</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Diferença</TableComponents.TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {stockCount.items.map(item => (
                    <TableComponents.TableRow key={item.id}>
                      <TableComponents.TableCell>{item.supply.name}</TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(item.countedQuantity)} {item.unit.code}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {item.systemQuantityBase === null
                          ? '— só na aplicação'
                          : formatQuantity(item.systemQuantityBase)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell
                        className={cn(
                          'whitespace-nowrap font-medium',
                          item.differenceBase !== null && item.differenceBase < 0 && 'text-red-800',
                          item.differenceBase !== null && item.differenceBase > 0 && 'text-green-800',
                        )}
                      >
                        {item.differenceBase === null
                          ? '—'
                          : formatQuantity(item.differenceBase)}
                      </TableComponents.TableCell>
                    </TableComponents.TableRow>
                  ))}
                </tbody>
              </TableComponents.Table>
            </div>
          </>
        )}
      </ListFeedback>
    </>
  );
}
