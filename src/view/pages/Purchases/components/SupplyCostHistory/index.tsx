import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import { supplyCostsService } from "../../../../../app/services/supplyCostsService";
import { supplyCostsQueryKey } from "../../../../../app/hooks/usePurchaseQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatDate } from "../../../../../app/utils/formatDate";
import { formatPercent } from "../../../../../app/utils/formatPercent";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { costSourceLabels } from "../../../../../types/SupplyCost";
import { ListFeedback } from "../../../../components/ListFeedback";

export function SupplyCostHistory() {
  const { supplyId } = useParams<{ supplyId: string }>();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...supplyCostsQueryKey, 'history', supplyId],
    queryFn: () => supplyCostsService.getHistory(supplyId!),
    enabled: Boolean(supplyId),
  });

  return (
    <>
      <Link
        to="/purchases/cost-report"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-400"
      >
        <ChevronLeftIcon />
        Voltar para variação de preço
      </Link>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={!data}
        emptyMessage="Insumo não encontrado."
        errorMessage="Não foi possível carregar o histórico de custo."
        onRetry={refetch}
      >
        {data && (
          <>
            <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-500">{data.supply.name}</h2>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <span className="block text-xs text-gray-400">Custo atual</span>
                  <strong className="text-gray-500">
                    {data.supply.currentUnitCostBase === null
                      ? '— nunca comprado'
                      : `${formatCurrency(data.supply.currentUnitCostBase)}/${data.supply.baseUnit.code}`}
                  </strong>
                </div>

                <div>
                  <span className="block text-xs text-gray-400">Unidade base</span>
                  <span className="text-gray-500">
                    {data.supply.baseUnit.code} — {data.supply.baseUnit.name}
                  </span>
                </div>

                <div>
                  <span className="block text-xs text-gray-400">Método de custeio</span>
                  <span className="text-gray-500">{data.supply.costingMethod}</span>
                </div>
              </div>

              <Link
                to={`/stock/supplies/${data.supply.id}`}
                className="mt-4 inline-block text-sm font-bold text-red-600"
              >
                Ver o insumo no estoque
              </Link>
            </div>

            <h3 className="mt-8 mb-2 text-lg font-semibold text-gray-500">
              Linha do tempo
            </h3>

            <p className="mb-4 flex items-start gap-2 text-xs text-gray-400">
              <InfoCircledIcon className="mt-0.5 shrink-0" />

              Cada compra confirmada acrescenta uma linha e nenhuma anterior é
              sobrescrita. A variação de cada linha é a que valia no dia — não é
              recalculada depois.
            </p>

            <ListFeedback
              isLoading={false}
              isError={false}
              isEmpty={data.history.length === 0}
              emptyMessage="Este insumo ainda não tem histórico de custo. Confirme uma compra para criar a primeira linha."
            >
              <ol className="space-y-3">
                {data.history.map((entry, index) => (
                  <li
                    key={entry.id}
                    className={cn(
                      'rounded-lg border bg-white p-4',
                      index === 0 ? 'border-red-200' : 'border-gray-600',
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <strong className="text-gray-500">
                          {formatCurrency(entry.unitCostBase)}/{data.supply.baseUnit.code}
                        </strong>

                        <span className="ml-2 text-xs text-gray-400">
                          {formatDate(new Date(entry.effectiveAt))}
                        </span>

                        {index === 0 && (
                          <span className="ml-2 rounded bg-red-50 px-2 py-0.5 text-xs text-red-800">
                            atual
                          </span>
                        )}
                      </div>

                      <span className={cn(
                        'whitespace-nowrap text-sm font-medium',
                        entry.variationPercent === null && 'text-gray-400',
                        entry.variationPercent !== null && entry.variationPercent > 0 && 'text-red-800',
                        entry.variationPercent !== null && entry.variationPercent < 0 && 'text-green-800',
                      )}>
                        {entry.variationPercent === null
                          ? '— primeira compra'
                          : formatPercent(entry.variationPercent)}
                      </span>
                    </div>

                    <div className="mt-2 space-y-0.5 text-xs text-gray-400">
                      <span className="block">
                        Comprado a {formatCurrency(entry.unitPrice)}/{entry.unit.code}
                        {entry.purchaseItem && (
                          <> · {formatQuantity(entry.purchaseItem.quantity)} {entry.unit.code} por{' '}
                          {formatCurrency(entry.purchaseItem.totalPrice)}</>
                        )}
                      </span>

                      <span className="block">
                        Origem: {costSourceLabels[entry.source]}
                        {entry.supplier && ` · ${entry.supplier.name}`}
                        {entry.purchaseItem?.batch && ` · lote ${entry.purchaseItem.batch}`}
                      </span>

                      {entry.previousUnitCostBase !== null && (
                        <span className="block">
                          Custo anterior:{' '}
                          {formatCurrency(entry.previousUnitCostBase)}/{data.supply.baseUnit.code}
                        </span>
                      )}
                    </div>

                    {entry.purchaseItem && (
                      <Link
                        to={`/purchases/${entry.purchaseItem.purchase.id}`}
                        className="mt-2 inline-block text-xs font-bold text-red-600"
                      >
                        Ver a compra
                        {entry.purchaseItem.purchase.documentNumber
                          && ` (nota ${entry.purchaseItem.purchase.documentNumber})`}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </ListFeedback>
          </>
        )}
      </ListFeedback>
    </>
  );
}
