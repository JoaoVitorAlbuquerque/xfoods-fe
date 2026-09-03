import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { supplyCostsService } from "../../../../../app/services/supplyCostsService";
import { supplyCostsQueryKey } from "../../../../../app/hooks/usePurchaseQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatDate } from "../../../../../app/utils/formatDate";
import { formatPercent } from "../../../../../app/utils/formatPercent";
import { CostDirection } from "../../../../../types/SupplyCost";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { TableComponents } from "../../../../components/TableElements";

const directionClasses: Record<CostDirection, string> = {
  UP: 'bg-red-50 text-red-800',
  DOWN: 'bg-green-100 text-green-900',
  FLAT: 'bg-gray-100 text-gray-400',
};

const directionLabels: Record<CostDirection, string> = {
  UP: 'Subiu',
  DOWN: 'Caiu',
  FLAT: 'Estável',
};

function VariationBadge({
  direction,
  variationPercent,
}: {
  direction: CostDirection | null;
  variationPercent: number | null;
}) {
  if (direction === null) {
    return (
      <span
        className="whitespace-nowrap text-xs text-gray-400"
        title="Primeira compra deste insumo: não há custo anterior para comparar."
      >
        — primeira compra
      </span>
    );
  }

  return (
    <span className={cn(
      'whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium',
      directionClasses[direction],
    )}>
      {directionLabels[direction]} {formatPercent(variationPercent)}
    </span>
  );
}

export function CostVariationReport() {
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...supplyCostsQueryKey, 'report'],
    queryFn: supplyCostsService.getReport,
  });

  const items = data?.items ?? [];

  const counters = [
    { label: 'Encareceram', value: data?.summary.increased ?? 0, className: 'text-red-800' },
    { label: 'Baratearam', value: data?.summary.decreased ?? 0, className: 'text-green-800' },
    { label: 'Sem mudança', value: data?.summary.unchanged ?? 0, className: 'text-gray-500' },
    { label: 'Primeira compra', value: data?.summary.firstPurchase ?? 0, className: 'text-gray-500' },
  ];

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {counters.map(counter => (
          <div key={counter.label} className="rounded-lg border border-gray-600 bg-white p-4">
            <span className="block text-xs text-gray-400">{counter.label}</span>

            <strong className={cn('text-2xl font-bold', counter.className)}>
              {counter.value}
            </strong>
          </div>
        ))}
      </div>

      <ContentHeader title="Variação de preço" quantity={items.length} />

      <p className="mb-6 text-sm text-gray-400">
        A comparação é sempre por <strong>unidade base</strong>: uma compra em KG
        e outra em G geram preços unitários incomparáveis, e só o custo por
        unidade base diz se o insumo realmente encareceu. A variação é a que foi
        congelada na confirmação da última compra.
      </p>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={items.length === 0}
        emptyMessage="Nenhum insumo tem histórico de custo ainda. Confirme uma compra para começar."
        errorMessage="Não foi possível carregar o relatório de variação."
        onRetry={refetch}
      >
        <div className="space-y-3 md:hidden">
          {items.map(item => (
            <Link
              key={item.supplyId}
              to={`/purchases/supplies/${item.supplyId}/history`}
              className="block rounded-lg border border-gray-600 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <strong className="min-w-0 truncate text-gray-500">{item.supplyName}</strong>

                <VariationBadge
                  direction={item.direction}
                  variationPercent={item.variationPercent}
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="block text-xs text-gray-400">Custo anterior</span>
                  <span className="text-gray-500">
                    {item.previousUnitCostBase === null
                      ? '—'
                      : `${formatCurrency(item.previousUnitCostBase)}/${item.baseUnit.code}`}
                  </span>
                </div>

                <div>
                  <span className="block text-xs text-gray-400">Custo atual</span>
                  <strong className="text-gray-500">
                    {formatCurrency(item.currentUnitCostBase)}/{item.baseUnit.code}
                  </strong>
                </div>
              </div>

              <span className="mt-3 block text-xs text-gray-400">
                Comprado a {formatCurrency(item.currentUnitPrice)}/{item.currentPriceUnit} em{' '}
                {formatDate(new Date(item.lastPurchaseAt))}
                {item.supplier && ` · ${item.supplier.name}`}
              </span>
            </Link>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <TableComponents.Table>
            <thead>
              <tr className="bg-gray-600/20">
                <TableComponents.TableHeader>Insumo</TableComponents.TableHeader>
                <TableComponents.TableHeader>Custo anterior</TableComponents.TableHeader>
                <TableComponents.TableHeader>Custo atual</TableComponents.TableHeader>
                <TableComponents.TableHeader>Preço comprado</TableComponents.TableHeader>
                <TableComponents.TableHeader>Última compra</TableComponents.TableHeader>
                <TableComponents.TableHeader>Variação</TableComponents.TableHeader>
                <TableComponents.TableHeader>Histórico</TableComponents.TableHeader>
              </tr>
            </thead>

            <tbody>
              {items.map(item => (
                <TableComponents.TableRow key={item.supplyId}>
                  <TableComponents.TableCell>
                    {item.supplyName}

                    {item.supplier && (
                      <span className="block text-xs text-gray-400">{item.supplier.name}</span>
                    )}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {item.previousUnitCostBase === null
                      ? '—'
                      : `${formatCurrency(item.previousUnitCostBase)}/${item.baseUnit.code}`}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap font-medium">
                    {formatCurrency(item.currentUnitCostBase)}/{item.baseUnit.code}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatCurrency(item.currentUnitPrice)}/{item.currentPriceUnit}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatDate(new Date(item.lastPurchaseAt))}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    <VariationBadge
                      direction={item.direction}
                      variationPercent={item.variationPercent}
                    />
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
      </ListFeedback>
    </>
  );
}
