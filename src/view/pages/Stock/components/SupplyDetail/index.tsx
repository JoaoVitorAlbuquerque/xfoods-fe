import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon } from "@radix-ui/react-icons";

import { suppliesService } from "../../../../../app/services/suppliesService";
import { suppliesQueryKey } from "../../../../../app/hooks/useStockQueries";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatDate } from "../../../../../app/utils/formatDate";
import { cn } from "../../../../../app/utils/cn";
import { stockMovementTypeLabels } from "../../../../../types/StockMovement";
import { ListFeedback } from "../../../../components/ListFeedback";
import { StockStatusBadge } from "../../../../components/StockStatusBadge";
import { TableComponents } from "../../../../components/TableElements";
import { StockOperationModal } from "../StockOperationModal";
import { StockOperation } from "../StockOperationModal/useStockOperationModalController";

const operationButtons = [
  { operation: 'ENTRY', label: 'Entrada' },
  { operation: 'EXIT', label: 'Saída' },
  { operation: 'LOSS', label: 'Perda' },
  { operation: 'ADJUSTMENT', label: 'Ajuste' },
] as const;

export function SupplyDetail() {
  const { supplyId } = useParams<{ supplyId: string }>();
  const [operation, setOperation] = useState<StockOperation | null>(null);

  const { data: supply, isFetching, isError, refetch } = useQuery({
    queryKey: [...suppliesQueryKey, 'detail', supplyId],
    queryFn: () => suppliesService.getById(supplyId!),
    enabled: Boolean(supplyId),
  });

  return (
    <>
      {operation && supply && (
        <StockOperationModal
          visible
          operation={operation}
          supplyId={supply.id}
          onClose={() => setOperation(null)}
        />
      )}

      <Link
        to="/stock/supplies"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-400"
      >
        <ChevronLeftIcon />
        Voltar para insumos
      </Link>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={!supply}
        emptyMessage="Insumo não encontrado."
        errorMessage="Não foi possível carregar o insumo."
        onRetry={refetch}
      >
        {supply && (
          <>
            <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-500">{supply.name}</h2>

                  <span className="text-sm text-gray-400">
                    {supply.category?.name ?? 'Sem categoria'}
                    {!supply.active && ' · inativo'}
                  </span>

                  {supply.description && (
                    <p className="mt-1 text-sm text-gray-400">{supply.description}</p>
                  )}
                </div>

                <StockStatusBadge status={supply.stockStatus} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div>
                  <span className="block text-xs text-gray-400">Saldo atual</span>
                  <strong className="text-gray-500">
                    {formatQuantity(supply.currentStock)} {supply.baseUnit.code}
                  </strong>
                </div>

                <div>
                  <span className="block text-xs text-gray-400">Custo médio</span>
                  <strong className="text-gray-500">{formatCurrency(supply.averageCost)}</strong>

                  <Link
                    to={`/purchases/supplies/${supply.id}/history`}
                    className="block text-xs font-bold text-red-600"
                  >
                    Histórico de custo
                  </Link>
                </div>

                <div>
                  <span className="block text-xs text-gray-400">Mínimo</span>
                  <span className="text-gray-500">
                    {supply.minStock > 0
                      ? `${formatQuantity(supply.minStock)} ${supply.baseUnit.code}`
                      : '— não acompanhado'}
                  </span>
                </div>

                <div>
                  <span className="block text-xs text-gray-400">Máximo</span>
                  <span className="text-gray-500">
                    {supply.maxStock
                      ? `${formatQuantity(supply.maxStock)} ${supply.baseUnit.code}`
                      : '—'}
                  </span>
                </div>
              </div>

              {supply.shortfall > 0 && (
                <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
                  Faltam {formatQuantity(supply.shortfall)} {supply.baseUnit.code} para
                  voltar ao mínimo.
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {operationButtons.map(button => (
                  <button
                    key={button.operation}
                    type="button"
                    onClick={() => setOperation(button.operation)}
                    className="rounded-full border border-gray-600 px-4 py-2 text-sm font-medium text-gray-500"
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-2">
              <strong className="text-lg font-semibold text-gray-500">
                Últimas movimentações
              </strong>

              <Link to="/stock/movements" className="text-sm font-bold text-red-600">
                Ver extrato completo
              </Link>
            </div>

            {supply.lastMovements.length === 0 ? (
              <div className="rounded-lg border border-gray-600 bg-white p-8 text-center text-gray-400">
                Este insumo ainda não tem movimentações.
              </div>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {supply.lastMovements.map(movement => (
                    <div
                      key={movement.id}
                      className="rounded-lg border border-gray-600 bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-500">
                          {stockMovementTypeLabels[movement.type]}
                        </span>

                        <span className={cn(
                          'text-sm font-bold',
                          movement.quantityBase < 0 ? 'text-red-800' : 'text-green-800',
                        )}>
                          {formatQuantity(movement.quantityBase)} {supply.baseUnit.code}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                        <span>{formatDate(new Date(movement.occurredAt))}</span>

                        <span>
                          Saldo: {formatQuantity(movement.balanceAfter)} {supply.baseUnit.code}
                        </span>
                      </div>

                      {movement.reason && (
                        <p className="mt-2 text-xs text-gray-400">{movement.reason}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <TableComponents.Table>
                    <thead>
                      <tr className="bg-gray-600/20">
                        <TableComponents.TableHeader>Data</TableComponents.TableHeader>
                        <TableComponents.TableHeader>Tipo</TableComponents.TableHeader>
                        <TableComponents.TableHeader>Quantidade</TableComponents.TableHeader>
                        <TableComponents.TableHeader>Saldo depois</TableComponents.TableHeader>
                        <TableComponents.TableHeader>Motivo</TableComponents.TableHeader>
                      </tr>
                    </thead>

                    <tbody>
                      {supply.lastMovements.map(movement => (
                        <TableComponents.TableRow key={movement.id}>
                          <TableComponents.TableCell className="whitespace-nowrap">
                            {formatDate(new Date(movement.occurredAt))}
                          </TableComponents.TableCell>

                          <TableComponents.TableCell>
                            {stockMovementTypeLabels[movement.type]}
                          </TableComponents.TableCell>

                          <TableComponents.TableCell
                            className={cn(
                              'whitespace-nowrap font-medium',
                              movement.quantityBase < 0 ? 'text-red-800' : 'text-green-800',
                            )}
                          >
                            {formatQuantity(movement.quantityBase)} {supply.baseUnit.code}
                          </TableComponents.TableCell>

                          <TableComponents.TableCell className="whitespace-nowrap">
                            {formatQuantity(movement.balanceAfter)} {supply.baseUnit.code}
                          </TableComponents.TableCell>

                          <TableComponents.TableCell>
                            {movement.reason ?? '—'}
                          </TableComponents.TableCell>
                        </TableComponents.TableRow>
                      ))}
                    </tbody>
                  </TableComponents.Table>
                </div>
              </>
            )}
          </>
        )}
      </ListFeedback>
    </>
  );
}
