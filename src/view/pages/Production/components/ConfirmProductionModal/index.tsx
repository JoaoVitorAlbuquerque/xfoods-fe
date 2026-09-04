import { Link } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { ProductionOrder } from "../../../../../types/Production";
import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { Modal } from "../../../../components/Modal";
import { Select } from "../../../../components/Select";
import { useConfirmProductionModalController } from "./useConfirmProductionModalController";

interface ConfirmProductionModalProps {
  visible: boolean;
  onClose(): void;
  order: ProductionOrder;
}

export function ConfirmProductionModal({
  visible,
  onClose,
  order,
}: ConfirmProductionModalProps) {
  const {
    baseUnit,
    unitOptions,
    unitCode,
    handleChangeUnit,
    actualQuantity,
    setActualQuantity,
    notes,
    setNotes,
    actualInBase,
    difference,
    yieldPercent,
    projectedUnitCost,
    conflictMessage,
    isPending,
    handleConfirm,
  } = useConfirmProductionModalController(order, onClose);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal visible onClose={onClose} title="Confirmar lote">
        <div className="space-y-6 sm:max-w-[520px]">
          {/*
            409 de falta de insumo: a transação inteira voltou atrás. Dizer que
            nada se moveu é o que impede o usuário sair procurando o tomate que
            "já teria saído".
          */}
          {conflictMessage ? (
            <>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2 text-red-900">
                  <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                  <div>
                    <strong className="block text-sm">
                      O lote NÃO foi confirmado
                    </strong>

                    <p className="mt-2 whitespace-pre-line text-xs">
                      {conflictMessage}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                <strong>Nada se moveu.</strong> Nem os ingredientes que já teriam
                saído — a confirmação é uma transação só, e ela voltou inteira.
                O lote continua rascunho e pode ser confirmado depois da
                reposição.
              </p>

              <div className="space-y-2 text-sm">
                <Link
                  to="/stock/supplies"
                  className="block font-bold text-red-600"
                >
                  Repor ou ajustar o saldo do insumo
                </Link>

                <Link to="/purchases/new" className="block font-bold text-red-600">
                  Lançar a compra que faltou
                </Link>

                <Link to="/settings/stock" className="block font-bold text-red-600">
                  Permitir saldo negativo nas configurações
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* A conta do escopo, na ordem em que ela é lida. */}
              <div className="rounded-lg border border-gray-600 p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500">Rendimento esperado</span>

                  <span className="whitespace-nowrap text-gray-500">
                    {formatQuantity(order.expectedQuantity)} {baseUnit.code}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <span className="block text-sm font-medium text-gray-500">
                    Rendimento real
                  </span>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
                    <NumericFormat
                      value={actualQuantity}
                      onValueChange={(values, sourceInfo) => {
                        if (sourceInfo.source === 'event') {
                          setActualQuantity(values.value);
                        }
                      }}
                      valueIsNumericString
                      decimalSeparator=","
                      allowNegative={false}
                      decimalScale={6}
                      placeholder="Quanto de fato saiu"
                      className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
                    />

                    <Select
                      value={unitCode}
                      onChange={event => handleChangeUnit(event.target.value)}
                    >
                      {unitOptions.map(unit => (
                        <option key={unit.id} value={unit.code}>
                          {unit.code}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {unitCode !== baseUnit.code && (
                    <span className="block text-xs text-gray-400">
                      Entra no estoque como {formatQuantity(actualInBase)}{' '}
                      {baseUnit.code}.
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-600/40 pt-3 text-sm">
                  <span className="text-gray-500">Diferença</span>

                  <span className="whitespace-nowrap">
                    <strong className={cn(
                      difference < 0 ? 'text-red-900' : difference > 0 ? 'text-green-800' : 'text-gray-500',
                    )}>
                      {difference > 0 ? '+' : ''}
                      {formatQuantity(difference)} {baseUnit.code}
                    </strong>

                    <span className="ml-2 text-xs text-gray-400">
                      ({formatPercentPlain(yieldPercent)})
                    </span>
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500">
                    Custo por {baseUnit.code}
                  </span>

                  <span className="whitespace-nowrap">
                    <strong className={cn(
                      projectedUnitCost !== null && projectedUnitCost > order.unitCost
                        ? 'text-red-900'
                        : 'text-gray-500',
                    )}>
                      {projectedUnitCost === null
                        ? '—'
                        : formatCurrency(projectedUnitCost)}
                    </strong>

                    <span className="ml-2 text-xs text-gray-400">
                      (era {formatCurrency(order.unitCost)})
                    </span>
                  </span>
                </div>
              </div>

              {/* É este parágrafo que liga a perda de produção ao preço do prato. */}
              {difference < 0 && (
                <p className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
                  <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                  <span>
                    O lote rendeu menos que o previsto, e{' '}
                    <strong>isso encarece a unidade</strong>: o mesmo custo de
                    ingredientes dividido por menos produto. É assim que a perda
                    de produção chega ao preço do prato em vez de sumir.
                  </span>
                </p>
              )}

              <div className="space-y-2">
                <span className="text-sm text-gray-500">Observações (opcional)</span>

                <Input
                  name="notes"
                  type="text"
                  placeholder="Ex: reduziu mais que o normal"
                  value={notes}
                  onChange={event => setNotes(event.target.value)}
                />
              </div>

              <p className="flex items-start gap-2 text-xs text-gray-400">
                <InfoCircledIcon className="mt-0.5 shrink-0" />

                <span>
                  Confirmar é uma transação só: {order.items.length} ingrediente(s)
                  saem e {order.outputSupply.name} entra. Se faltar insumo, nada
                  se move e o lote continua rascunho. Depois de confirmado, não
                  há cancelamento — as movimentações são históricas.
                </span>
              </p>
            </>
          )}
        </div>

        <footer className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="py-3 font-bold text-red-800"
          >
            {conflictMessage ? 'Fechar' : 'Voltar'}
          </button>

          {!conflictMessage && (
            <Button
              onClick={handleConfirm}
              isLoading={isPending}
              className="w-full sm:w-auto"
            >
              Confirmar Lote
            </Button>
          )}
        </footer>
      </Modal>
    </div>
  );
}
