import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import { purchasesService } from "../../../../../app/services/purchasesService";
import { purchasesQueryKey } from "../../../../../app/hooks/usePurchaseQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatDate } from "../../../../../app/utils/formatDate";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import {
  purchaseStatusClasses,
  purchaseStatusLabels,
} from "../../../../../types/Purchase";
import { Button } from "../../../../components/Button";
import { ListFeedback } from "../../../../components/ListFeedback";
import { TableComponents } from "../../../../components/TableElements";
import { PurchaseAction, PurchaseActionModal } from "../PurchaseActionModal";

export function PurchaseDetail() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const [action, setAction] = useState<PurchaseAction | null>(null);

  const { data: purchase, isFetching, isError, refetch } = useQuery({
    queryKey: [...purchasesQueryKey, purchaseId],
    queryFn: () => purchasesService.getById(purchaseId!),
    enabled: Boolean(purchaseId),
  });

  const isDraft = purchase?.status === 'DRAFT';

  return (
    <>
      {action && purchase && (
        <PurchaseActionModal
          visible
          action={action}
          purchase={purchase}
          onClose={() => setAction(null)}
          onDone={refetch}
        />
      )}

      <Link
        to="/purchases"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-400"
      >
        <ChevronLeftIcon />
        Voltar para compras
      </Link>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={!purchase}
        emptyMessage="Compra não encontrada."
        errorMessage="Não foi possível carregar a compra."
        onRetry={refetch}
      >
        {purchase && (
          <>
            <div className={cn(
              'rounded-lg border bg-white p-4 md:p-6',
              isDraft ? 'border-yellow-400' : 'border-gray-600',
            )}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-500">
                    {purchase.documentNumber
                      ? `Nota ${purchase.documentNumber}`
                      : 'Compra sem número de nota'}
                  </h2>

                  <span className="text-sm text-gray-400">
                    {purchase.supplier?.name ?? 'Sem fornecedor'} · emitida em{' '}
                    {formatDate(new Date(purchase.issuedAt))}
                  </span>

                  {purchase.confirmedAt && (
                    <span className="block text-xs text-gray-400">
                      Confirmada em {formatDate(new Date(purchase.confirmedAt))}
                    </span>
                  )}

                  {purchase.canceledAt && (
                    <span className="block text-xs text-gray-400">
                      Cancelada em {formatDate(new Date(purchase.canceledAt))}
                    </span>
                  )}

                  {purchase.notes && (
                    <p className="mt-2 text-sm text-gray-400">{purchase.notes}</p>
                  )}
                </div>

                <div className="text-right">
                  <span className={cn(
                    'inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium',
                    purchaseStatusClasses[purchase.status],
                  )}>
                    {purchaseStatusLabels[purchase.status]}
                  </span>

                  <strong className="mt-2 block text-2xl font-bold text-gray-500">
                    {formatCurrency(purchase.totalAmount)}
                  </strong>
                </div>
              </div>

              {isDraft && (
                <>
                  <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
                    Rascunho: esta compra <strong>ainda não encostou no
                    estoque</strong> nem alterou o custo de nenhum insumo.
                    Confirmar é que dá entrada em tudo.
                  </p>

                  <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setAction('cancel')}
                      className="rounded-full border border-gray-600 px-4 py-2 text-sm font-medium text-gray-500"
                    >
                      Cancelar rascunho
                    </button>

                    <Button onClick={() => setAction('confirm')} className="w-full sm:w-auto">
                      Confirmar compra
                    </Button>
                  </div>
                </>
              )}

              {purchase.status === 'CONFIRMED' && (
                <p className="mt-4 flex items-start gap-2 text-xs text-gray-400">
                  <InfoCircledIcon className="mt-0.5 shrink-0" />

                  Compra confirmada é definitiva: cancelar exigiria estornar o
                  estoque e reconstruir o custo a partir da linha anterior do
                  histórico. Se algo entrou errado, o caminho é uma perda ou um
                  ajuste no estoque.
                </p>
              )}
            </div>

            <h3 className="mt-8 mb-4 text-lg font-semibold text-gray-500">Itens</h3>

            <div className="space-y-3 md:hidden">
              {purchase.items.map(item => (
                <div key={item.id} className="rounded-lg border border-gray-600 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0 truncate font-semibold text-gray-500">
                      {item.supply.name}
                    </span>

                    <strong className="whitespace-nowrap text-gray-500">
                      {formatCurrency(item.totalPrice)}
                    </strong>
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <span className="block">
                      {formatQuantity(item.quantity)} {item.unit.code} ={' '}
                      {formatQuantity(item.quantityBase)} {item.supply.baseUnit.code}
                    </span>

                    <span className="block">
                      {formatCurrency(item.unitPrice)}/{item.unit.code} ·{' '}
                      <strong className="text-gray-500">
                        {formatCurrency(item.unitCostBase)}/{item.supply.baseUnit.code}
                      </strong>
                    </span>

                    {item.batch && <span className="block">Lote {item.batch}</span>}

                    {item.expiresAt && (
                      <span className="block">
                        Validade {formatDate(new Date(item.expiresAt))}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/purchases/supplies/${item.supplyId}/history`}
                    className="mt-3 inline-block text-xs font-bold text-red-600"
                  >
                    Ver histórico de custo
                  </Link>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <TableComponents.Table>
                <thead>
                  <tr className="bg-gray-600/20">
                    <TableComponents.TableHeader>Insumo</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Quantidade</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Na unidade base</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Preço unitário</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Total</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo/unidade base</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Histórico</TableComponents.TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {purchase.items.map(item => (
                    <TableComponents.TableRow key={item.id}>
                      <TableComponents.TableCell>
                        {item.supply.name}

                        {(item.batch || item.expiresAt) && (
                          <span className="block text-xs text-gray-400">
                            {item.batch && `Lote ${item.batch}`}
                            {item.batch && item.expiresAt && ' · '}
                            {item.expiresAt && `Validade ${formatDate(new Date(item.expiresAt))}`}
                          </span>
                        )}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(item.quantity)} {item.unit.code}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(item.quantityBase)} {item.supply.baseUnit.code}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatCurrency(item.unitPrice)}/{item.unit.code}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap font-medium">
                        {formatCurrency(item.totalPrice)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap font-medium">
                        {formatCurrency(item.unitCostBase)}/{item.supply.baseUnit.code}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>
                        <Link
                          to={`/purchases/supplies/${item.supplyId}/history`}
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

            <p className="mt-4 flex items-start gap-2 text-xs text-gray-400">
              <InfoCircledIcon className="mt-0.5 shrink-0" />

              A variação contra a compra anterior é congelada na confirmação e
              vive no histórico de custo do insumo — por isso ela é mostrada lá,
              e não aqui: nesta tela ela mudaria a cada compra nova.
            </p>
          </>
        )}
      </ListFeedback>
    </>
  );
}
