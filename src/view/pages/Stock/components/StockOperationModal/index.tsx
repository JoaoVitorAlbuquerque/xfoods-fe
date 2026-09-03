import { Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { Modal } from "../../../../components/Modal";
import { RadixSelect } from "../../../../components/RadixSelect";
import { SupplySelect } from "../../../../components/SupplySelect";
import { QuantityInput } from "../../../../components/QuantityInput";
import { BaseQuantityHint } from "../../../../components/BaseQuantityHint";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { stockMovementTypeLabels } from "../../../../../types/StockMovement";
import {
  StockOperation,
  useStockOperationModalController,
} from "./useStockOperationModalController";

interface StockOperationModalProps {
  visible: boolean;
  operation: StockOperation;
  /** Insumo já escolhido, quando a operação parte da linha dele. */
  supplyId?: string;
  onClose(): void;
}

const titles: Record<StockOperation, string> = {
  ENTRY: 'Entrada de estoque',
  EXIT: 'Saída de estoque',
  LOSS: 'Registrar perda',
  ADJUSTMENT: 'Ajustar saldo',
};

const descriptions: Record<StockOperation, string> = {
  ENTRY: 'Soma ao saldo e, com custo informado, recalcula o custo médio do insumo.',
  EXIT: 'Baixa manual. Venda não entra aqui: ela dá baixa sozinha ao fechar a conta.',
  LOSS: 'Quebra, vencimento, descarte. O motivo é obrigatório para a perda ser auditável.',
  ADJUSTMENT: 'Informe o saldo que realmente existe. A diferença é calculada e vira lançamento.',
};

const entryTypes = ['PURCHASE', 'RETURN', 'PRODUCTION', 'TRANSFER'] as const;
const exitTypes = ['PRODUCTION', 'RETURN', 'TRANSFER'] as const;

export function StockOperationModal({
  visible,
  operation,
  supplyId: preselectedSupplyId,
  onClose,
}: StockOperationModalProps) {
  const {
    control,
    register,
    setValue,
    errors,
    handleSubmit,
    isPending,
    conflictMessage,
    selectedSupply,
    unitId,
    quantity,
    targetQuantity,
  } = useStockOperationModalController(operation, preselectedSupplyId, onClose);

  if (!visible) {
    return null;
  }

  const isAdjustment = operation === 'ADJUSTMENT';
  const typeOptions = operation === 'ENTRY' ? entryTypes : exitTypes;

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal visible={visible} onClose={onClose} title={titles[operation]}>
        <form onSubmit={handleSubmit} className="space-y-5 sm:w-[440px]">
          <p className="text-xs text-gray-400">{descriptions[operation]}</p>

          {conflictMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
              <div className="flex items-start gap-2 text-red-900">
                <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                <span className="text-sm font-medium whitespace-pre-line">
                  {conflictMessage}
                </span>
              </div>

              <p className="text-xs text-red-800">
                Nada foi lançado. Reponha o saldo por uma entrada, corrija por
                ajuste, ou permita saldo negativo em{' '}
                <Link to="/settings/stock" className="font-bold underline">
                  Configurações › Estoque
                </Link>
                .
              </p>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-gray-500 font-normal text-sm">Insumo</span>

            <Controller
              control={control}
              name="supplyId"
              render={({ field: { value, onChange } }) => (
                <SupplySelect
                  value={value}
                  onChange={onChange}
                  error={errors.supplyId?.message}
                  disabled={Boolean(preselectedSupplyId)}
                />
              )}
            />

            {selectedSupply && (
              <span className="block text-xs text-gray-400">
                Saldo atual: {formatQuantity(selectedSupply.currentStock)}{' '}
                {selectedSupply.baseUnit.code}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-gray-500 font-normal text-sm">
              {isAdjustment ? 'Saldo correto encontrado' : 'Quantidade'}
            </span>

            <QuantityInput
              quantity={isAdjustment ? targetQuantity : quantity}
              onQuantityChange={value => setValue(isAdjustment ? 'targetQuantity' : 'quantity', value)}
              unitId={unitId}
              onUnitChange={value => setValue('unitId', value)}
              kind={selectedSupply?.baseUnit.kind}
              allowPackaging={false}
              disabled={!selectedSupply}
              error={
                (isAdjustment ? errors.targetQuantity?.message : errors.quantity?.message)
                ?? errors.unitId?.message
              }
            />

            {selectedSupply && (
              <BaseQuantityHint
                quantity={isAdjustment ? targetQuantity : quantity}
                unitId={unitId}
                targetUnitId={selectedSupply.baseUnitId}
              />
            )}
          </div>

          {operation !== 'LOSS' && !isAdjustment && (
            <div className="space-y-2">
              <span className="text-gray-500 font-normal text-sm">
                Tipo {operation === 'ENTRY' && '(opcional)'}
              </span>

              <Controller
                control={control}
                name="type"
                render={({ field: { value, onChange } }) => (
                  <RadixSelect
                    placeholder="Selecione o tipo"
                    value={value ?? ''}
                    onChange={onChange}
                    error={errors.type?.message}
                    options={typeOptions.map(type => ({
                      value: type,
                      label: stockMovementTypeLabels[type],
                    }))}
                  />
                )}
              />
            </div>
          )}

          {operation === 'ENTRY' && (
            <div className="space-y-2">
              <span className="text-gray-500 font-normal text-sm">
                Custo por unidade informada (opcional)
              </span>

              <Controller
                control={control}
                name="unitCost"
                render={({ field: { value, onChange } }) => (
                  <NumericFormat
                    value={value ?? ''}
                    onValueChange={(values, sourceInfo) => {
                      if (sourceInfo.source === 'event') {
                        onChange(values.value);
                      }
                    }}
                    valueIsNumericString
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    decimalScale={6}
                    prefix="R$ "
                    placeholder="R$ 0,00"
                    className="bg-white w-full rounded-lg border border-gray-600 px-3 h-[52px] text-gray-800 focus:border-gray-800 transition-all outline-none"
                  />
                )}
              />

              <span className="flex items-start gap-2 text-xs text-gray-400">
                <InfoCircledIcon className="mt-0.5 shrink-0" />

                Informar o custo recalcula o custo médio do insumo. Em branco, o
                custo atual é mantido.
              </span>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-gray-500 font-normal text-sm">
              Motivo {operation === 'ENTRY' || operation === 'EXIT' ? '(opcional)' : ''}
            </span>

            <Input
              type="text"
              placeholder={
                operation === 'LOSS'
                  ? 'Ex: Vencimento do lote'
                  : 'Ex: Conferência do estoque'
              }
              error={errors.reason?.message}
              {...register('reason')}
            />
          </div>

          {isAdjustment && (
            <p className="flex items-start gap-2 text-xs text-gray-400">
              <InfoCircledIcon className="mt-0.5 shrink-0" />

              Não existe "editar saldo": o ajuste registra a diferença como
              movimentação, para que o extrato continue explicando o saldo.
            </p>
          )}

          <footer className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="py-3 font-bold text-red-800"
            >
              Cancelar
            </button>

            <Button isLoading={isPending} className="w-full sm:w-auto">
              Registrar
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
