import { Link } from "react-router-dom";

import {
  PurchaseStatus,
  purchaseStatusClasses,
  purchaseStatusLabels,
} from "../../../../../types/Purchase";
import { useSuppliers } from "../../../../../app/hooks/usePurchaseQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatDate } from "../../../../../app/utils/formatDate";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { Select } from "../../../../components/Select";
import { TableComponents } from "../../../../components/TableElements";
import { PurchaseActionModal } from "../PurchaseActionModal";
import { usePurchasesListController } from "./usePurchasesListController";

const statusOptions: PurchaseStatus[] = ['DRAFT', 'CONFIRMED', 'CANCELED'];

export function PurchasesList() {
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
    status,
    setStatus,
    supplierId,
    setSupplierId,
    from,
    setFrom,
    to,
    setTo,
    purchaseInAction,
    action,
    handleOpenAction,
    handleCloseAction,
  } = usePurchasesListController();

  const { suppliers } = useSuppliers();

  return (
    <>
      {purchaseInAction && (
        <PurchaseActionModal
          visible
          action={action}
          purchase={purchaseInAction}
          onClose={handleCloseAction}
        />
      )}

      <ContentHeader title="Compras" quantity={items.length}>
        <Link to="/purchases/new" className="pt-1 text-sm font-bold text-red-600">
          Nova Compra
        </Link>
      </ContentHeader>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value={status}
          onChange={event => setStatus(event.target.value as PurchaseStatus | '')}
        >
          <option value="">Todas as situações</option>

          {statusOptions.map(option => (
            <option key={option} value={option}>
              {purchaseStatusLabels[option]}
            </option>
          ))}
        </Select>

        <Select
          value={supplierId}
          onChange={event => setSupplierId(event.target.value)}
        >
          <option value="">Todos os fornecedores</option>

          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}{!supplier.active && ' (inativo)'}
            </option>
          ))}
        </Select>

        <label className="relative">
          <span className="absolute left-3 top-2 text-xs text-gray-700">Emitida de</span>

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
        emptyMessage="Nenhuma compra encontrada com esses filtros."
        errorMessage="Não foi possível carregar as compras."
        onRetry={refetch}
      >
        {total > items.length && (
          <p className="mb-4 rounded-lg bg-gray-100 p-3 text-xs text-gray-400">
            Mostrando as {items.length} compras mais recentes de {total}. Use os
            filtros de fornecedor, situação e data para chegar às demais.
          </p>
        )}

        <div className="space-y-3 md:hidden">
          {pageItems.map(purchase => (
            <div key={purchase.id} className={cn(
              'rounded-lg border bg-white p-4',
              purchase.status === 'DRAFT' ? 'border-yellow-400' : 'border-gray-600',
            )}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/purchases/${purchase.id}`}
                    className="block truncate font-semibold text-gray-500"
                  >
                    {purchase.documentNumber
                      ? `Nota ${purchase.documentNumber}`
                      : 'Compra sem número'}
                  </Link>

                  <span className="text-xs text-gray-400">
                    {purchase.supplier?.name ?? 'Sem fornecedor'} ·{' '}
                    {formatDate(new Date(purchase.issuedAt))}
                  </span>
                </div>

                <span className={cn(
                  'whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium',
                  purchaseStatusClasses[purchase.status],
                )}>
                  {purchaseStatusLabels[purchase.status]}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {purchase.items.length} item(ns)
                </span>

                <strong className="text-gray-500">
                  {formatCurrency(purchase.totalAmount)}
                </strong>
              </div>

              {purchase.status === 'DRAFT' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAction(purchase, 'confirm')}
                    className="rounded-full bg-red-800 px-4 py-2 text-xs font-bold text-white"
                  >
                    Confirmar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAction(purchase, 'cancel')}
                    className="rounded-full border border-gray-600 px-4 py-2 text-xs font-medium text-gray-500"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <TableComponents.Table>
            <thead>
              <tr className="bg-gray-600/20">
                <TableComponents.TableHeader>Nota</TableComponents.TableHeader>
                <TableComponents.TableHeader>Fornecedor</TableComponents.TableHeader>
                <TableComponents.TableHeader>Emissão</TableComponents.TableHeader>
                <TableComponents.TableHeader>Itens</TableComponents.TableHeader>
                <TableComponents.TableHeader>Total</TableComponents.TableHeader>
                <TableComponents.TableHeader>Situação</TableComponents.TableHeader>
                <TableComponents.TableHeader>Ações</TableComponents.TableHeader>
              </tr>
            </thead>

            <tbody>
              {pageItems.map(purchase => (
                <TableComponents.TableRow key={purchase.id}>
                  <TableComponents.TableCell>
                    <Link
                      to={`/purchases/${purchase.id}`}
                      className="font-medium hover:underline"
                    >
                      {purchase.documentNumber ?? 'Sem número'}
                    </Link>
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {purchase.supplier?.name ?? '—'}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatDate(new Date(purchase.issuedAt))}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {purchase.items.length}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap font-medium">
                    {formatCurrency(purchase.totalAmount)}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    <span className={cn(
                      'whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium',
                      purchaseStatusClasses[purchase.status],
                    )}>
                      {purchaseStatusLabels[purchase.status]}
                    </span>
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {purchase.status === 'DRAFT' ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenAction(purchase, 'confirm')}
                          className="rounded-full bg-red-800 px-3 py-1 text-xs font-bold text-white"
                        >
                          Confirmar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenAction(purchase, 'cancel')}
                          className="rounded-full border border-gray-600 px-3 py-1 text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <Link
                        to={`/purchases/${purchase.id}`}
                        className="text-sm font-bold text-red-600"
                      >
                        Abrir
                      </Link>
                    )}
                  </TableComponents.TableCell>
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
