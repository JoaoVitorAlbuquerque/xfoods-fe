import { LockClosedIcon } from "@radix-ui/react-icons";

import { MeasurementUnit, unitKindLabels } from "../../../../../../types/MeasurementUnit";
import { formatQuantity } from "../../../../../../app/utils/formatQuantity";
import { cn } from "../../../../../../app/utils/cn";
import { ActionButton } from "../../../../../components/ActionButton";
import { TableComponents } from "../../../../../components/TableElements";

import editIcon from '../../../../../components/icons/edit-icon.svg';
import trashIcon from '../../../../../components/icons/trash-icon.svg';

interface UnitsTableProps {
  units: MeasurementUnit[];
  baseUnitCodeByKind: Record<string, string>;
  isReactivating: boolean;
  onOpenEditUnitModal(unit: MeasurementUnit): void;
  onOpenDeleteUnitModal(unit: MeasurementUnit): void;
  onReactivateUnit(unit: MeasurementUnit): void;
}

export function UnitsTable({
  units,
  baseUnitCodeByKind,
  isReactivating,
  onOpenEditUnitModal,
  onOpenDeleteUnitModal,
  onReactivateUnit,
}: UnitsTableProps) {
  return (
    <>
      {/* Celular: um cartão por unidade — a tabela tem colunas demais para 375px. */}
      <div className="space-y-3 md:hidden">
        {units.map(unit => {
          const baseCode = baseUnitCodeByKind[unit.kind];

          return (
            <div key={unit.id} className="rounded-lg border border-gray-600 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong className="text-gray-500">{unit.code}</strong>

                  <span className="block text-sm text-gray-400">{unit.name}</span>
                </div>

                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                  {unitKindLabels[unit.kind]}
                </span>
              </div>

              <span className="mt-3 block text-sm text-gray-500">
                {unit.isPackaging || unit.factorToBase === null
                  ? '— embalagem, sem fator universal'
                  : `1 ${unit.code} = ${formatQuantity(unit.factorToBase, 8)} ${baseCode}`}
              </span>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {unit.isSystem ? 'Unidade do sistema' : 'Personalizada'}
                  {!unit.active && ' · inativa'}
                </span>

                {!unit.isSystem && (
                  unit.active ? (
                    <div className="flex items-center">
                      <ActionButton
                        title="Editar unidade"
                        onClick={() => onOpenEditUnitModal(unit)}
                      >
                        <img src={editIcon} alt="Editar" />
                      </ActionButton>

                      <ActionButton
                        title="Desativar unidade"
                        onClick={() => onOpenDeleteUnitModal(unit)}
                      >
                        <img src={trashIcon} alt="Desativar" />
                      </ActionButton>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isReactivating}
                      onClick={() => onReactivateUnit(unit)}
                      className={cn(
                        'text-sm font-bold text-red-600',
                        isReactivating && 'cursor-not-allowed text-gray-400',
                      )}
                    >
                      Reativar
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <TableComponents.Table>
        <thead>
          <tr className="bg-gray-600/20">
            <TableComponents.TableHeader>Sigla</TableComponents.TableHeader>
            <TableComponents.TableHeader>Nome</TableComponents.TableHeader>
            <TableComponents.TableHeader>Grandeza</TableComponents.TableHeader>
            <TableComponents.TableHeader>Conversão</TableComponents.TableHeader>
            <TableComponents.TableHeader>Origem</TableComponents.TableHeader>
            <TableComponents.TableHeader>Ações</TableComponents.TableHeader>
          </tr>
        </thead>

        <tbody>
          {units.map(unit => {
            const baseCode = baseUnitCodeByKind[unit.kind];

            return (
              <TableComponents.TableRow key={unit.id}>
                <TableComponents.TableCell className="font-bold text-gray-500">
                  <div className="flex items-center gap-2">
                    {unit.code}

                    {!unit.active && (
                      <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-normal text-gray-400">
                        Inativa
                      </span>
                    )}
                  </div>
                </TableComponents.TableCell>

                <TableComponents.TableCell>{unit.name}</TableComponents.TableCell>

                <TableComponents.TableCell>
                  {unitKindLabels[unit.kind]}

                  {unit.isBase && (
                    <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-800">
                      base
                    </span>
                  )}
                </TableComponents.TableCell>

                <TableComponents.TableCell className="whitespace-nowrap">
                  {unit.isPackaging || unit.factorToBase === null ? (
                    <span
                      className="text-gray-400"
                      title="Embalagem não tem fator universal: o valor depende do insumo e é definido na compra."
                    >
                      — embalagem
                    </span>
                  ) : (
                    <>
                      1 {unit.code} = {formatQuantity(unit.factorToBase, 8)} {baseCode}
                    </>
                  )}
                </TableComponents.TableCell>

                <TableComponents.TableCell>
                  {unit.isSystem ? 'Sistema' : 'Personalizada'}
                </TableComponents.TableCell>

                <TableComponents.TableCell>
                  {unit.isSystem ? (
                    <div
                      className="flex items-center gap-2 text-gray-400"
                      title="Unidade de sistema: seu fator é uma constante física, compartilhada por todos os estabelecimentos."
                    >
                      <LockClosedIcon />

                      <span className="text-xs">Constante física</span>
                    </div>
                  ) : unit.active ? (
                    <div className="flex items-center">
                      <ActionButton
                        title="Editar unidade"
                        onClick={() => onOpenEditUnitModal(unit)}
                      >
                        <img src={editIcon} alt="Editar" />
                      </ActionButton>

                      <ActionButton
                        title="Desativar unidade"
                        onClick={() => onOpenDeleteUnitModal(unit)}
                      >
                        <img src={trashIcon} alt="Desativar" />
                      </ActionButton>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isReactivating}
                      onClick={() => onReactivateUnit(unit)}
                      className={cn(
                        'text-sm font-bold text-red-600',
                        isReactivating && 'cursor-not-allowed text-gray-400',
                      )}
                    >
                      Reativar
                    </button>
                  )}
                </TableComponents.TableCell>
              </TableComponents.TableRow>
            );
          })}
        </tbody>
      </TableComponents.Table>
      </div>
    </>
  );
}
