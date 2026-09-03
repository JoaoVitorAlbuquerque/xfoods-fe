import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatDateTime } from "../../../../../app/utils/formatDateTime";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import {
  StockMovementType,
  stockMovementTypeLabels,
} from "../../../../../types/StockMovement";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { Select } from "../../../../components/Select";
import { SupplySelect } from "../../../../components/SupplySelect";
import { TableComponents } from "../../../../components/TableElements";
import { useStockMovementsController } from "./useStockMovementsController";

const movementTypes: StockMovementType[] = [
  'PURCHASE',
  'SALE',
  'LOSS',
  'ADJUSTMENT',
  'PRODUCTION',
  'RETURN',
  'TRANSFER',
];

export function StockMovements() {
  const {
    items,
    pageItems,
    page,
    pageCount,
    setPage,
    total,
    isFetching,
    isError,
    refetch,
    supplyId,
    setSupplyId,
    type,
    setType,
    from,
    setFrom,
    to,
    setTo,
  } = useStockMovementsController();

  return (
    <>
      <ContentHeader title="Movimentações" quantity={items.length} />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SupplySelect
          value={supplyId}
          onChange={setSupplyId}
          placeholder="Todos os insumos"
        />

        <Select
          value={type}
          onChange={event => setType(event.target.value as StockMovementType | '')}
        >
          <option value="">Todos os tipos</option>

          {movementTypes.map(movementType => (
            <option key={movementType} value={movementType}>
              {stockMovementTypeLabels[movementType]}
            </option>
          ))}
        </Select>

        <label className="relative">
          <span className="absolute left-3 top-2 text-xs text-gray-700">De</span>

          <input
            type="date"
            value={from}
            onChange={event => setFrom(event.target.value)}
            className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 pt-4 text-gray-800 outline-none transition-all focus:border-gray-800"
          />
        </label>

        <label className="relative">
          <span className="absolute left-3 top-2 text-xs text-gray-700">Até</span>

          <input
            type="date"
            value={to}
            onChange={event => setTo(event.target.value)}
            className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 pt-4 text-gray-800 outline-none transition-all focus:border-gray-800"
          />
        </label>
      </div>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={items.length === 0}
        emptyMessage="Nenhuma movimentação encontrada nesse filtro."
        errorMessage="Não foi possível carregar o extrato."
        onRetry={refetch}
      >
        {total > items.length && (
          <p className="mb-4 rounded-lg bg-gray-100 p-3 text-xs text-gray-400">
            Mostrando as {items.length} movimentações mais recentes de {total} no
            período. Use os filtros de insumo, tipo e data para chegar às demais.
          </p>
        )}

        <div className="space-y-3 md:hidden">
          {pageItems.map(movement => (
            <div key={movement.id} className="rounded-lg border border-gray-600 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="block truncate font-semibold text-gray-500">
                    {movement.supply.name}
                  </span>

                  <span className="text-xs text-gray-400">
                    {stockMovementTypeLabels[movement.type]} ·{' '}
                    {formatDateTime(new Date(movement.occurredAt))}
                  </span>
                </div>

                <span className={cn(
                  'whitespace-nowrap text-sm font-bold',
                  movement.direction === 'OUT' ? 'text-red-800' : 'text-green-800',
                )}>
                  {formatQuantity(movement.quantity)} {movement.unit.code}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                <span>Saldo depois: {formatQuantity(movement.balanceAfter)}</span>

                <span>{formatCurrency(movement.totalCost)}</span>
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
                <TableComponents.TableHeader>Insumo</TableComponents.TableHeader>
                <TableComponents.TableHeader>Tipo</TableComponents.TableHeader>
                <TableComponents.TableHeader>Sentido</TableComponents.TableHeader>
                <TableComponents.TableHeader>Quantidade</TableComponents.TableHeader>
                <TableComponents.TableHeader>Saldo depois</TableComponents.TableHeader>
                <TableComponents.TableHeader>Valor</TableComponents.TableHeader>
                <TableComponents.TableHeader>Motivo</TableComponents.TableHeader>
              </tr>
            </thead>

            <tbody>
              {pageItems.map(movement => (
                <TableComponents.TableRow key={movement.id}>
                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatDateTime(new Date(movement.occurredAt))}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>{movement.supply.name}</TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {stockMovementTypeLabels[movement.type]}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    <span className={cn(
                      'rounded px-2 py-0.5 text-xs font-medium',
                      movement.direction === 'OUT'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-green-100 text-green-900',
                    )}>
                      {movement.direction === 'OUT' ? 'Saída' : 'Entrada'}
                    </span>
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap font-medium">
                    {formatQuantity(movement.quantity)} {movement.unit.code}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatQuantity(movement.balanceAfter)}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatCurrency(movement.totalCost)}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>{movement.reason ?? '—'}</TableComponents.TableCell>
                </TableComponents.TableRow>
              ))}
            </tbody>
          </TableComponents.Table>
        </div>

        {pageCount > 1 && (
          <div className="mt-4 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className={cn(
                'rounded-full border border-gray-600 px-4 py-2 text-sm font-medium text-gray-500',
                page === 0 && 'cursor-not-allowed text-gray-300',
              )}
            >
              Anterior
            </button>

            <span className="text-sm text-gray-400">
              Página {page + 1} de {pageCount}
            </span>

            <button
              type="button"
              disabled={page + 1 >= pageCount}
              onClick={() => setPage(page + 1)}
              className={cn(
                'rounded-full border border-gray-600 px-4 py-2 text-sm font-medium text-gray-500',
                page + 1 >= pageCount && 'cursor-not-allowed text-gray-300',
              )}
            >
              Próxima
            </button>
          </div>
        )}
      </ListFeedback>
    </>
  );
}
