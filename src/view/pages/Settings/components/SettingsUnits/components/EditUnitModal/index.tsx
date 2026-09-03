import { Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";

import { Button } from "../../../../../../components/Button";
import { Input } from "../../../../../../components/Input";
import { Modal } from "../../../../../../components/Modal";
import { MeasurementUnit, unitKindLabels } from "../../../../../../../types/MeasurementUnit";
import { formatQuantity } from "../../../../../../../app/utils/formatQuantity";
import { useEditUnitModalController } from "./useEditUnitModalController";

interface EditUnitModalProps {
  visible: boolean;
  onClose(): void;
  unit: MeasurementUnit;
}

export function EditUnitModal({ visible, onClose, unit }: EditUnitModalProps) {
  const {
    register,
    control,
    errors,
    handleSubmit,
    isPending,
    factorToBase,
    baseUnit,
  } = useEditUnitModalController(unit, onClose);

  if (!visible) {
    return null;
  }

  const parsedFactor = Number(factorToBase);
  const canPreviewFactor = !unit.isPackaging && baseUnit && factorToBase && parsedFactor > 0;

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10">
      <Modal
        visible={visible}
        onClose={onClose}
        title="Editar Unidade"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-w-[480px]">
          <div className="rounded-lg bg-gray-50 p-4 space-y-1">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="font-bold">{unit.code}</span>
              <span>{unitKindLabels[unit.kind]}</span>
            </div>

            <span className="block text-xs text-gray-400">
              Sigla e grandeza não podem ser alteradas: mudá-las reescreveria o
              significado de toda quantidade já registrada com esta unidade. O
              caminho é desativar esta e criar outra.
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-gray-500 font-normal text-sm">Nome</span>

            <Input
              type="text"
              placeholder="Ex: Bandeja de ovos"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          {unit.isPackaging ? (
            <span className="block text-xs text-gray-400">
              Unidade de embalagem: não tem fator de conversão universal para editar.
              O fator é definido por insumo, na compra.
            </span>
          ) : (
            <div className="space-y-2">
              <span className="text-gray-500 font-normal text-sm">
                Fator de conversão para a unidade base
                {baseUnit && ` (${baseUnit.code})`}
              </span>

              <Controller
                control={control}
                name="factorToBase"
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
                    decimalScale={8}
                    placeholder="Ex: 30"
                    className="bg-white w-full rounded-lg border border-gray-600 px-3 h-[52px] text-gray-800 focus:border-gray-800 transition-all outline-none"
                  />
                )}
              />

              {canPreviewFactor && (
                <span className="block text-xs text-gray-400">
                  1 {unit.code} = {formatQuantity(parsedFactor, 8)} {baseUnit.code}
                </span>
              )}

              <span className="block text-xs text-yellow-800">
                Alterar o fator muda como toda quantidade nova nesta unidade é
                convertida. Quantidades já gravadas não são recalculadas.
              </span>
            </div>
          )}

          <footer className="flex items-center justify-end pt-2">
            <Button isLoading={isPending}>
              Salvar Alterações
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
