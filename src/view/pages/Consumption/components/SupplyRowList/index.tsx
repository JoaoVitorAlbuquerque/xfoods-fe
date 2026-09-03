import { Link } from "react-router-dom";

import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatPercent } from "../../../../../app/utils/formatPercent";
import { ConsumptionSupplyRow } from "../../../../../types/Consumption";
import { ConsumptionClassificationBadge } from "../../../../components/ConsumptionClassificationBadge";
import { TableComponents } from "../../../../components/TableElements";
import { DeviationBreakdown } from "../DeviationBreakdown";

interface SupplyRowListProps {
  items: ConsumptionSupplyRow[];
  emptyMessage: string;
}

/** Estimado zero: consumo que nenhuma venda previa, o desvio mais grave. */
function isUnforeseen(item: ConsumptionSupplyRow) {
  return item.variationPercent === null && item.difference !== 0;
}

/**
 * A lista de insumos do Estimado x Real, compartilhada pelos relatórios de
 * maiores desvios e maiores perdas — eles diferem no recorte, não na leitura.
 */
export function SupplyRowList({ items, emptyMessage }: SupplyRowListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-600 bg-white p-8 text-center text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map(item => (
          <div
            key={item.supplyId}
            className={cn(
              'rounded-lg border p-4',
              isUnforeseen(item)
                ? 'border-red-200 bg-red-50'
                : 'border-gray-600 bg-white',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <Link
                to={`/stock/supplies/${item.supplyId}`}
                className="min-w-0 truncate font-medium text-gray-500 underline"
              >
                {item.supplyName}
              </Link>

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

            {isUnforeseen(item) && (
              <p className="mt-3 text-xs text-red-900">
                Nenhuma venda previa este insumo: não há base para porcentagem, e
                tudo o que saiu é desvio.
              </p>
            )}

            <DeviationBreakdown
              className="mt-3"
              breakdown={item.deviationBreakdown}
              difference={item.difference}
              baseUnit={item.baseUnit}
            />
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <TableComponents.Table>
          <thead>
            <tr className="bg-gray-600/20">
              <TableComponents.TableHeader>Insumo</TableComponents.TableHeader>
              <TableComponents.TableHeader>Estimado</TableComponents.TableHeader>
              <TableComponents.TableHeader>Real</TableComponents.TableHeader>
              <TableComponents.TableHeader>Diferença</TableComponents.TableHeader>
              <TableComponents.TableHeader>Variação</TableComponents.TableHeader>
              <TableComponents.TableHeader>Custo do desvio</TableComponents.TableHeader>
              <TableComponents.TableHeader>Situação</TableComponents.TableHeader>
            </tr>
          </thead>

          <tbody>
            {items.map(item => (
              <TableComponents.TableRow
                key={item.supplyId}
                className={cn(
                  'border-b border-gray-600/40 bg-white',
                  isUnforeseen(item) && 'bg-red-50',
                )}
              >
                <TableComponents.TableCell>
                  <Link to={`/stock/supplies/${item.supplyId}`} className="underline">
                    {item.supplyName}
                  </Link>

                  {item.supplyCategory && (
                    <span className="ml-2 text-xs text-gray-400">
                      {item.supplyCategory}
                    </span>
                  )}
                </TableComponents.TableCell>

                <TableComponents.TableCell className="whitespace-nowrap">
                  {formatQuantity(item.estimatedQuantity)} {item.baseUnit}
                </TableComponents.TableCell>

                <TableComponents.TableCell className="whitespace-nowrap">
                  {formatQuantity(item.realQuantity)} {item.baseUnit}
                </TableComponents.TableCell>

                <TableComponents.TableCell
                  className={cn(
                    'whitespace-nowrap',
                    item.difference > 0 && 'text-red-900',
                  )}
                >
                  {item.difference > 0 ? '+' : ''}
                  {formatQuantity(item.difference)} {item.baseUnit}
                </TableComponents.TableCell>

                <TableComponents.TableCell
                  className={cn(
                    'whitespace-nowrap font-medium',
                    item.difference > 0 && 'text-red-900',
                  )}
                  title={
                    isUnforeseen(item)
                      ? 'Estimado zero: nenhuma venda previa este insumo, então não existe porcentagem.'
                      : undefined
                  }
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
                  <ConsumptionClassificationBadge classification={item.classification} />

                  <DeviationBreakdown
                    compact
                    className="ml-2"
                    breakdown={item.deviationBreakdown}
                    difference={item.difference}
                    baseUnit={item.baseUnit}
                  />
                </TableComponents.TableCell>
              </TableComponents.TableRow>
            ))}
          </tbody>
        </TableComponents.Table>
      </div>
    </>
  );
}
