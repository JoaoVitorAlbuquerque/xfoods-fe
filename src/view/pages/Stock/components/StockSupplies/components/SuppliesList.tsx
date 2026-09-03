import { Link } from "react-router-dom";

import { Supply } from "../../../../../../types/Supply";
import { formatCurrency } from "../../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../../app/utils/formatQuantity";
import { cn } from "../../../../../../app/utils/cn";
import { ActionButton } from "../../../../../components/ActionButton";
import { StockStatusBadge } from "../../../../../components/StockStatusBadge";
import { TableComponents } from "../../../../../components/TableElements";

import editIcon from '../../../../../components/icons/edit-icon.svg';
import trashIcon from '../../../../../components/icons/trash-icon.svg';

interface SuppliesListProps {
  supplies: Supply[];
  isTogglingActive: boolean;
  onEdit(supply: Supply): void;
  onDeactivate(supply: Supply): void;
  onReactivate(supply: Supply): void;
}

function formatLimit(value: number | null, unitCode: string) {
  if (value === null || value === 0) {
    return '—';
  }

  return `${formatQuantity(value)} ${unitCode}`;
}

function SupplyActions({
  supply,
  isTogglingActive,
  onEdit,
  onDeactivate,
  onReactivate,
}: Omit<SuppliesListProps, 'supplies'> & { supply: Supply }) {
  if (!supply.active) {
    return (
      <button
        type="button"
        disabled={isTogglingActive}
        onClick={() => onReactivate(supply)}
        className={cn('text-sm font-bold text-red-600', isTogglingActive && 'text-gray-400')}
      >
        Reativar
      </button>
    );
  }

  return (
    <div className="flex items-center">
      <ActionButton title="Editar insumo" onClick={() => onEdit(supply)}>
        <img src={editIcon} alt="Editar" />
      </ActionButton>

      <ActionButton title="Desativar insumo" onClick={() => onDeactivate(supply)}>
        <img src={trashIcon} alt="Desativar" />
      </ActionButton>
    </div>
  );
}

export function SuppliesList(props: SuppliesListProps) {
  const { supplies } = props;

  return (
    <>
      <div className="space-y-3 md:hidden">
        {supplies.map(supply => (
          <div key={supply.id} className="rounded-lg border border-gray-600 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={`/stock/supplies/${supply.id}`}
                  className="block truncate font-semibold text-gray-500"
                >
                  {supply.name}
                </Link>

                <span className="text-xs text-gray-400">
                  {supply.category?.name ?? 'Sem categoria'}
                  {!supply.active && ' · inativo'}
                </span>
              </div>

              <StockStatusBadge status={supply.stockStatus} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="block text-xs text-gray-400">Saldo</span>
                <strong className="text-gray-500">
                  {formatQuantity(supply.currentStock)} {supply.baseUnit.code}
                </strong>
              </div>

              <div>
                <span className="block text-xs text-gray-400">Custo médio</span>
                <span className="text-gray-500">{formatCurrency(supply.averageCost)}</span>
              </div>

              <div>
                <span className="block text-xs text-gray-400">Mínimo</span>
                <span className="text-gray-500">
                  {formatLimit(supply.minStock, supply.baseUnit.code)}
                </span>
              </div>

              <div>
                <span className="block text-xs text-gray-400">Máximo</span>
                <span className="text-gray-500">
                  {formatLimit(supply.maxStock, supply.baseUnit.code)}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <SupplyActions {...props} supply={supply} />
            </div>
          </div>
        ))}
      </div>

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
              <TableComponents.TableHeader>Ações</TableComponents.TableHeader>
            </tr>
          </thead>

          <tbody>
            {supplies.map(supply => (
              <TableComponents.TableRow key={supply.id}>
                <TableComponents.TableCell>
                  <Link
                    to={`/stock/supplies/${supply.id}`}
                    className="font-medium hover:underline"
                  >
                    {supply.name}
                  </Link>

                  <span className="block text-xs text-gray-400">
                    {supply.category?.name ?? 'Sem categoria'}
                    {!supply.active && ' · inativo'}
                  </span>
                </TableComponents.TableCell>

                <TableComponents.TableCell>
                  <StockStatusBadge status={supply.stockStatus} />
                </TableComponents.TableCell>

                <TableComponents.TableCell className="whitespace-nowrap font-medium">
                  {formatQuantity(supply.currentStock)} {supply.baseUnit.code}
                </TableComponents.TableCell>

                <TableComponents.TableCell className="whitespace-nowrap">
                  {formatLimit(supply.minStock, supply.baseUnit.code)}
                </TableComponents.TableCell>

                <TableComponents.TableCell className="whitespace-nowrap">
                  {formatLimit(supply.maxStock, supply.baseUnit.code)}
                </TableComponents.TableCell>

                <TableComponents.TableCell className="whitespace-nowrap">
                  {formatCurrency(supply.averageCost)}
                </TableComponents.TableCell>

                <TableComponents.TableCell>
                  <SupplyActions {...props} supply={supply} />
                </TableComponents.TableCell>
              </TableComponents.TableRow>
            ))}
          </tbody>
        </TableComponents.Table>
      </div>
    </>
  );
}
