import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import { productionService } from "../../../../../app/services/productionService";
import { productionQueryKey } from "../../../../../app/hooks/useProductionQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { formatDateTime } from "../../../../../app/utils/formatDateTime";
import { Button } from "../../../../components/Button";
import { ListFeedback } from "../../../../components/ListFeedback";
import { ProductionStatusBadge } from "../../../../components/ProductionStatusBadge";
import { TableComponents } from "../../../../components/TableElements";
import { CancelProductionModal } from "../CancelProductionModal";
import { ConfirmProductionModal } from "../ConfirmProductionModal";

export function ProductionOrderDetail() {
  const { productionOrderId } = useParams<{ productionOrderId: string }>();

  const [action, setAction] = useState<'confirm' | 'cancel' | null>(null);

  const { data: order, isFetching, isError, refetch } = useQuery({
    queryKey: [...productionQueryKey, productionOrderId],
    queryFn: () => productionService.getById(productionOrderId!),
    enabled: Boolean(productionOrderId),
  });

  const isDraft = order?.status === 'DRAFT';
  const isConfirmed = order?.status === 'CONFIRMED';

  return (
    <>
      {order && action === 'confirm' && (
        <ConfirmProductionModal visible order={order} onClose={() => setAction(null)} />
      )}

      {order && action === 'cancel' && (
        <CancelProductionModal visible order={order} onClose={() => setAction(null)} />
      )}

      <Link
        to="/production"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-400"
      >
        <ChevronLeftIcon />
        Voltar aos lotes
      </Link>

      <ListFeedback
        isLoading={isFetching && !order}
        isError={isError}
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar este lote."
        onRetry={refetch}
      >
        {order && (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <strong className="text-xl font-bold text-gray-500">
                {order.recipe.name ?? 'Sub-receita'} → {order.outputSupply.name}
              </strong>

              <ProductionStatusBadge status={order.status} />

              <span className="text-xs text-gray-400">
                ficha v{order.recipe.version}
              </span>
            </div>

            <p className="mb-6 text-sm text-gray-400">
              Produzido em{' '}
              <strong className="text-gray-500">
                {formatDateTime(new Date(order.producedAt))}
              </strong>

              {order.confirmedAt && (
                <>
                  {' '}· confirmado em{' '}
                  <strong className="text-gray-500">
                    {formatDateTime(new Date(order.confirmedAt))}
                  </strong>
                </>
              )}

              {order.canceledAt && (
                <>
                  {' '}· cancelado em{' '}
                  <strong className="text-gray-500">
                    {formatDateTime(new Date(order.canceledAt))}
                  </strong>
                </>
              )}
            </p>

            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Lotes</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatQuantity(order.batches)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  Rendimento previsto
                </span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatQuantity(order.expectedQuantity)}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  {order.outputSupply.baseUnit.code}
                </span>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  {isConfirmed ? 'Rendimento real' : 'Rendimento assumido'}
                </span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatQuantity(order.actualQuantity)}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  {order.outputSupply.baseUnit.code}
                  {!isConfirmed && ' · o real é informado na confirmação'}
                </span>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  Custo por {order.outputSupply.baseUnit.code}
                </span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(order.unitCost)}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  total de {formatCurrency(order.totalCost)}
                </span>
              </div>
            </div>

            {isConfirmed && order.yieldDifference !== 0 && (
              <div className={cn(
                'mb-4 rounded-lg border p-4',
                order.yieldDifference < 0
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-green-200 bg-green-50',
              )}>
                <strong className={cn(
                  'block text-sm',
                  order.yieldDifference < 0 ? 'text-yellow-900' : 'text-green-800',
                )}>
                  O lote rendeu {formatPercentPlain(order.yieldPercent)} do previsto
                </strong>

                <p className="mt-1 text-xs text-gray-500">
                  {order.yieldDifference < 0 ? (
                    <>
                      Faltaram {formatQuantity(Math.abs(order.yieldDifference))}{' '}
                      {order.outputSupply.baseUnit.code}. O mesmo custo de
                      ingredientes foi dividido por menos produto, então o custo
                      por {order.outputSupply.baseUnit.code} subiu — e essa perda
                      chega ao preço dos pratos que usam este subproduto.
                    </>
                  ) : (
                    <>
                      Saíram {formatQuantity(order.yieldDifference)}{' '}
                      {order.outputSupply.baseUnit.code} a mais que o previsto, e
                      o custo por unidade caiu junto. Se todo lote rende acima, a
                      ficha é que está subestimando o rendimento.
                    </>
                  )}
                </p>
              </div>
            )}

            {order.notes && (
              <p className="mb-4 rounded-lg border border-gray-600 bg-white p-4 text-sm text-gray-500">
                {order.notes}
              </p>
            )}

            <h3 className="mb-4 text-lg font-semibold text-gray-500">
              Ingredientes ({order.items.length})
            </h3>

            <div className="space-y-3 md:hidden">
              {order.items.map(item => (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-600 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/stock/supplies/${item.supplyId}`}
                      className="min-w-0 truncate font-medium text-gray-500 underline"
                    >
                      {item.supply.name}
                    </Link>

                    <strong className="whitespace-nowrap text-gray-500">
                      {formatCurrency(item.totalCost)}
                    </strong>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="block text-xs text-gray-400">Quantidade</span>
                      <span className="text-gray-500">
                        {formatQuantity(item.quantity)} {item.unit.code}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Custo unitário</span>
                      <span className="text-gray-500">
                        {formatCurrency(item.unitCost)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <TableComponents.Table>
                <thead>
                  <tr className="bg-gray-600/20">
                    <TableComponents.TableHeader>Insumo</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Quantidade</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Na base</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo unitário</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Total</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Movimentação</TableComponents.TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {order.items.map(item => (
                    <TableComponents.TableRow key={item.id}>
                      <TableComponents.TableCell>
                        <Link
                          to={`/stock/supplies/${item.supplyId}`}
                          className="underline"
                        >
                          {item.supply.name}
                        </Link>
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(item.quantity)} {item.unit.code}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(item.quantityBase)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatCurrency(item.unitCost)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap font-medium">
                        {formatCurrency(item.totalCost)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap text-xs text-gray-400">
                        {item.movementId ? 'lançada' : 'ainda não lançada'}
                      </TableComponents.TableCell>
                    </TableComponents.TableRow>
                  ))}
                </tbody>
              </TableComponents.Table>
            </div>

            {isDraft && (
              <p className="mt-4 flex items-start gap-2 text-xs text-gray-400">
                <InfoCircledIcon className="mt-0.5 shrink-0" />

                <span>
                  Rascunho não encosta no estoque: nenhuma dessas saídas foi
                  lançada ainda. O custo acima é o previsto pelos preços de hoje;
                  o custo real do lote sai do razão no momento da confirmação.
                </span>
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to={`/stock/supplies/${order.outputSupplyId}`}
                className="text-sm font-bold text-red-600"
              >
                Ver {order.outputSupply.name} no estoque
              </Link>

              {isConfirmed && (
                <Link
                  to={`/purchases/supplies/${order.outputSupplyId}/history`}
                  className="text-sm font-bold text-red-600"
                >
                  Ver o histórico de custo do subproduto
                </Link>
              )}
            </div>

            {isDraft && (
              <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setAction('cancel')}
                  className="py-3 font-bold text-red-800"
                >
                  Cancelar Lote
                </button>

                <Button
                  onClick={() => setAction('confirm')}
                  className="w-full sm:w-auto"
                >
                  Confirmar Lote
                </Button>
              </div>
            )}
          </>
        )}
      </ListFeedback>
    </>
  );
}
