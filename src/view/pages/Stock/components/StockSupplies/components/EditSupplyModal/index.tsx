import { Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { Supply } from "../../../../../../../types/Supply";
import { formatQuantity } from "../../../../../../../app/utils/formatQuantity";
import { Button } from "../../../../../../components/Button";
import { Input } from "../../../../../../components/Input";
import { Modal } from "../../../../../../components/Modal";
import { Select } from "../../../../../../components/Select";
import { useEditSupplyModalController } from "./useEditSupplyModalController";

interface EditSupplyModalProps {
  visible: boolean;
  onClose(): void;
  supply: Supply;
}

export function EditSupplyModal({ visible, onClose, supply }: EditSupplyModalProps) {
  const {
    control,
    register,
    errors,
    handleSubmit,
    isPending,
    categories,
  } = useEditSupplyModalController(supply, onClose);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal visible={visible} onClose={onClose} title="Editar Insumo">
        <form onSubmit={handleSubmit} className="space-y-5 sm:w-[440px]">
          <div className="rounded-lg bg-gray-50 p-4 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
              <span>
                Unidade base: <strong>{supply.baseUnit.code}</strong>
              </span>

              <span>
                Saldo: <strong>{formatQuantity(supply.currentStock)} {supply.baseUnit.code}</strong>
              </span>
            </div>

            <span className="flex items-start gap-2 text-xs text-gray-400">
              <InfoCircledIcon className="mt-0.5 shrink-0" />

              Nem a unidade base nem o saldo são editáveis aqui. Toda alteração de
              saldo gera movimentação — o caminho é uma entrada, um ajuste ou um
              inventário.
            </span>
          </div>

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
            <span className="text-gray-500 font-normal text-sm">Categoria</span>

            <Select {...register('supplyCategoryId')}>
              <option value="">Sem categoria</option>

              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}{!category.active && ' (inativa)'}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-gray-500 font-normal text-sm">
                Estoque mínimo ({supply.baseUnit.code})
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
                Zero significa "não acompanho mínimo deste insumo".
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-gray-500 font-normal text-sm">
                Estoque máximo ({supply.baseUnit.code})
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

          <div className="space-y-2">
            <span className="text-gray-500 font-normal text-sm">Descrição</span>

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
              Salvar Alterações
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
