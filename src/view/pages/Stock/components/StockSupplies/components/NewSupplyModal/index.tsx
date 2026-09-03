import { Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { Button } from "../../../../../../components/Button";
import { Input } from "../../../../../../components/Input";
import { Modal } from "../../../../../../components/Modal";
import { Select } from "../../../../../../components/Select";
import { UnitSelect } from "../../../../../../components/UnitSelect";
import { QuantityInput } from "../../../../../../components/QuantityInput";
import { BaseQuantityHint } from "../../../../../../components/BaseQuantityHint";
import { useNewSupplyModalController } from "./useNewSupplyModalController";

interface NewSupplyModalProps {
  visible: boolean;
  onClose(): void;
}

export function NewSupplyModal({ visible, onClose }: NewSupplyModalProps) {
  const {
    control,
    register,
    setValue,
    errors,
    handleSubmit,
    isPending,
    categories,
    baseUnit,
    baseUnitId,
    initialStock,
    initialStockUnitId,
  } = useNewSupplyModalController(onClose);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal visible={visible} onClose={onClose} title="Novo Insumo">
        <form onSubmit={handleSubmit} className="space-y-5 sm:w-[440px]">
          <div className="space-y-2">
            <span className="text-gray-500 font-normal text-sm">Nome</span>

            <Input
              type="text"
              placeholder="Ex: Queijo mussarela"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="space-y-2">
            <span className="text-gray-500 font-normal text-sm">Categoria (opcional)</span>

            <Select {...register('supplyCategoryId')}>
              <option value="">Sem categoria</option>

              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-gray-500 font-normal text-sm">Unidade base</span>

            <Controller
              control={control}
              name="baseUnitId"
              render={({ field: { value, onChange } }) => (
                <UnitSelect
                  value={value}
                  onChange={onChange}
                  allowPackaging={false}
                  placeholder="Unidade base"
                  error={errors.baseUnitId?.message}
                />
              )}
            />

            <span className="flex items-start gap-2 text-xs text-yellow-800">
              <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

              A unidade base define como todo saldo deste insumo é guardado e não
              pode ser trocada depois: mudá-la reinterpretaria toda movimentação
              já registrada. Queijo em grama, refrigerante em mililitro, espeto
              em unidade.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-gray-500 font-normal text-sm">
                Estoque mínimo {baseUnit && `(${baseUnit.code})`}
              </span>

              <Controller
                control={control}
                name="minStock"
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
                    decimalScale={4}
                    placeholder="0"
                    className="bg-white w-full rounded-lg border border-gray-600 px-3 h-[52px] text-gray-800 focus:border-gray-800 transition-all outline-none"
                  />
                )}
              />

              <span className="block text-xs text-gray-400">
                Em branco ou zero: este insumo não acompanha mínimo e nunca
                aparece em alerta por falta.
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-gray-500 font-normal text-sm">
                Estoque máximo {baseUnit && `(${baseUnit.code})`}
              </span>

              <Controller
                control={control}
                name="maxStock"
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
                    decimalScale={4}
                    placeholder="Opcional"
                    className="bg-white w-full rounded-lg border border-gray-600 px-3 h-[52px] text-gray-800 focus:border-gray-800 transition-all outline-none"
                  />
                )}
              />

              {errors.maxStock?.message && (
                <span className="block text-xs text-red-900">{errors.maxStock.message}</span>
              )}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-gray-600 p-4">
            <span className="text-gray-500 font-normal text-sm">
              Saldo inicial (opcional)
            </span>

            <QuantityInput
              quantity={initialStock}
              onQuantityChange={value => setValue('initialStock', value)}
              unitId={initialStockUnitId}
              onUnitChange={value => setValue('initialStockUnitId', value)}
              kind={baseUnit?.kind}
              allowPackaging={false}
              disabled={!baseUnitId}
            />

            <BaseQuantityHint
              quantity={initialStock}
              unitId={initialStockUnitId}
              targetUnitId={baseUnitId}
            />

            <div className="pt-2">
              <span className="text-gray-500 font-normal text-sm">
                Custo por unidade informada (opcional)
              </span>

              <Controller
                control={control}
                name="initialUnitCost"
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
                    className="mt-2 bg-white w-full rounded-lg border border-gray-600 px-3 h-[52px] text-gray-800 focus:border-gray-800 transition-all outline-none"
                  />
                )}
              />
            </div>

            <span className="block pt-2 text-xs text-gray-400">
              O saldo inicial não é gravado direto: ele vira uma movimentação de
              ajuste com o motivo "saldo inicial do cadastro", para que nem o
              primeiro número do insumo apareça sem registro de onde veio.
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-gray-500 font-normal text-sm">Descrição (opcional)</span>

            <Input
              type="text"
              placeholder="Ex: Fatiado, pacote de 2 kg"
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

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
              Cadastrar Insumo
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
