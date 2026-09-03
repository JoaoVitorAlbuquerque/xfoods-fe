import { Link } from "react-router-dom";

import { StockOverviewItem } from "../../../../../../types/Stock";
import { formatCurrency } from "../../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../../app/utils/formatQuantity";
import { StockStatusBadge } from "../../../../../components/StockStatusBadge";
import { TableComponents } from "../../../../../components/TableElements";
import { StockOperation } from "../../StockOperationModal/useStockOperationModalController";

interface StockPanelListProps {
  items: StockOverviewItem[];
  onOperate(operation: StockOperation, supplyId: string): void;
}

/**
 * `minStock: 0` significa "não acompanho mínimo deste insumo", não "o mínimo é
 * zero" — por isso vira travessão em vez de 0.
 */
function formatLimit(value: number | null, unitCode: string) {
  if (value === null || value === 0) {
    return '—';
  }

  return `${formatQuantity(value)} ${unitCode}`;
}

export function StockPanelList({ items, onOperate }: StockPanelListProps) {
  return (
    <>
      {/* Celular: um cartão por insumo. */}
      <div className="space-y-3 md:hidden">
        {items.map(item => (
          <div key={item.id} className="rounded-lg border border-gray-600 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={`/stock/supplies/${item.id}`}
                  className="block truncate font-semibold text-gray-500"
                >
                  {item.name}
                </Link>

                <span className="text-xs text-gray-400">
                  {item.category?.name ?? 'Sem categoria'}
                </span>
              </div>

              <StockStatusBadge status={item.stockStatus} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="block text-xs text-gray-400">Saldo</span>
                <strong className="text-gray-500">
                  {formatQuantity(item.currentStock)} {item.baseUnit.code}
                </strong>
              </div>

              <div>
                <span className="block text-xs text-gray-400">Valor</span>
                <span className="text-gray-500">{formatCurrency(item.stockValue)}</span>
              </div>

              <div>
                <span className="block text-xs text-gray-400">Mínimo</span>
                <span className="text-gray-500">
                  {formatLimit(item.minStock, item.baseUnit.code)}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-400">Máximo</span>
                <span className="text-gray-500">
                  {formatLimit(item.maxStock, item.baseUnit.code)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onOperate('ENTRY', item.id)}
                className="rounded-full border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-500"
              >
                Entrada
              </button>

              <button
                type="button"
                onClick={() => onOperate('EXIT', item.id)}
                className="rounded-full border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-500"
              >
                Saída
              </button>

              <button
                type="button"
                onClick={() => onOperate('LOSS', item.id)}
                className="rounded-full border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-500"
              >
                Perda
              </button>

              <button
                type="button"
                onClick={() => onOperate('ADJUSTMENT', item.id)}
                className="rounded-full border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-500"
              >
                Ajustar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: tabela, com rolagem horizontal se faltar largura. */}
      <div className="hidden overflow-x-auto md:block">
        <TableComponents.Table>
          <thead>
            <tr className="bg-gray-600/20">
              <TableComponents.TableHeader>Insumo</TableComponents.TableHeader>
              <TableComponents.TableHeader>Situação</TableComponents.TableHeader>
              <TableComponents.TableHeader>Saldo</TableComponents.TableHeader>
              <TableComponents.TableHeader>Mínimo</TableComponents.TableHeader>
              <TableComponents.TableHeader>Máximo</TableComponents.TableHeader>
              <TableComponents.TableHeader>Custo médio</TableComponents.TableHeader>
              <TableComponents.TableHeader>Valor em estoque</TableComponents.TableHeader>
              <TableComponents.TableHeader>Ações</TableComponents.TableHeader>
            </tr>
          </thead>

          <tbody>
            {items.map(item => (
              <TableComponents.TableRow key={item.id}>
                <TableComponents.TableCell>
                  <Link to={`/stock/supplies/${item.id}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>

                  <span className="block text-xs text-gray-400">
                    {item.category?.name ?? 'Sem categoria'}
                  </span>
                </TableComponents.TableCell>

                <TableComponents.TableCell>
                  <StockStatusBadge status={item.stockStatus} />
                </TableComponents.TableCell>

                <TableComponents.TableCell className="whitespace-nowrap font-medium">
                  {formatQuantity(item.currentStock)} {item.baseUnit.code}
                </TableComponents.TableCell>

                <TableComponents.TableCell className="whitespace-nowrap">
                  {formatLimit(item.minStock, item.baseUnit.code)}
                </TableComponents.TableCell>

                <TableComponents.TableCell className="whitespace-nowrap">
                  {formatLimit(item.maxStock, item.baseUnit.code)}
                </TableComponents.TableCell>

                <TableComponents.TableCell className="whitespace-nowrap">
                  {formatCurrency(item.averageCost)}
                </TableComponents.TableCell>

                <TableComponents.TableCell className="whitespace-nowrap">
                  {formatCurrency(item.stockValue)}
                </TableComponents.TableCell>

                <TableComponents.TableCell>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => onOperate('ENTRY', item.id)}
                      className="rounded-full border border-gray-600 px-2 py-1 text-xs"
                    >
                      Entrada
                    </button>

                    <button
                      type="button"
                      onClick={() => onOperate('EXIT', item.id)}
                      className="rounded-full border border-gray-600 px-2 py-1 text-xs"
                    >
                      Saída
                    </button>

                    <button
                      type="button"
                      onClick={() => onOperate('LOSS', item.id)}
                      className="rounded-full border border-gray-600 px-2 py-1 text-xs"
                    >
                      Perda
                    </button>

                    <button
                      type="button"
                      onClick={() => onOperate('ADJUSTMENT', item.id)}
                      className="rounded-full border border-gray-600 px-2 py-1 text-xs"
                    >
                      Ajustar
                    </button>
                  </div>
                </TableComponents.TableCell>
              </TableComponents.TableRow>
            ))}
          </tbody>
        </TableComponents.Table>
      </div>
    </>
  );
}
