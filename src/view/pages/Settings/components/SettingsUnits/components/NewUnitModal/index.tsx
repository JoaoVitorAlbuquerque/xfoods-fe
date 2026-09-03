import { Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { Button } from "../../../../../../components/Button";
import { Input } from "../../../../../../components/Input";
import { Modal } from "../../../../../../components/Modal";
import { RadixSelect } from "../../../../../../components/RadixSelect";
import { unitKindLabels, unitKinds } from "../../../../../../../types/MeasurementUnit";
import { formatQuantity } from "../../../../../../../app/utils/formatQuantity";
import { useNewUnitModalController } from "./useNewUnitModalController";

interface NewUnitModalProps {
  visible: boolean;
  onClose(): void;
}

export function NewUnitModal({ visible, onClose }: NewUnitModalProps) {
  const {
    register,
    control,
    errors,
    handleSubmit,
    isPending,
    code,
    isPackaging,
    factorToBase,
    baseUnit,
  } = useNewUnitModalController(onClose);

  if (!visible) {
    return null;
  }

  const parsedFactor = Number(factorToBase);
  const canPreviewFactor = !isPackaging && baseUnit && factorToBase && parsedFactor > 0;

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10">
      <Modal
        visible={visible}
        onClose={onClose}
        title="Nova Unidade"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-w-[480px]">
          <div className="space-y-2">
            <span className="text-gray-500 font-normal text-sm">Sigla</span>

            <Input
              type="text"
              placeholder="Ex: BANDEJA"
              error={errors.code?.message}
              {...register('code')}
            />
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

          <div className="space-y-2">
            <span className="text-gray-500 font-normal text-sm">Grandeza</span>

            <Controller
              control={control}
              name="kind"
              render={({ field: { value, onChange } }) => (
                <RadixSelect
                  placeholder="Selecione a grandeza"
                  value={value ?? ''}
                  onChange={onChange}
                  error={errors.kind?.message}
                  options={unitKinds.map(kind => ({
                    value: kind,
                    label: unitKindLabels[kind],
                  }))}
                />
              )}
            />

            <span className="block text-xs text-gray-400">
              Contagem nunca converte para peso ou volume: 1 KG não é 1 UN.
            </span>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-gray-600 p-4" role="button">
            <input
              type="checkbox"
              className="mt-1 form-checkbox rounded text-red-500 focus:ring-0"
              {...register('isPackaging')}
            />

            <span className="flex-grow">
              <span className="block text-gray-500 font-normal text-sm">
                É unidade de embalagem (caixa, pacote, fardo)
              </span>

              <span className="block mt-1 text-xs text-gray-400">
                Embalagem não tem fator universal — uma caixa de tomate não pesa o
                mesmo que uma de azeite. O fator passa a ser definido por insumo,
                na compra, e ela não pode ser unidade base de insumo.
              </span>
            </span>
          </label>

          {!isPackaging && (
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

              {errors.factorToBase?.message && (
                <div className="flex items-center gap-2 text-red-900">
                  <InfoCircledIcon />

                  <span className="text-xs">{errors.factorToBase.message}</span>
                </div>
              )}

              {canPreviewFactor && (
                <span className="block text-xs text-gray-400">
                  1 {code || 'unidade'} = {formatQuantity(parsedFactor, 8)} {baseUnit.code}
                </span>
              )}
            </div>
          )}

          <footer className="flex items-center justify-end pt-2">
            <Button isLoading={isPending}>
              Criar Unidade
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
