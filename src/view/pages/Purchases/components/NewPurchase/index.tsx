import { Link } from "react-router-dom";
import { ChevronLeftIcon, InfoCircledIcon, PlusIcon } from "@radix-ui/react-icons";

import { computePurchaseLine } from "../../../../../app/utils/computePurchaseLine";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { PurchaseItemFields } from "./components/PurchaseItemFields";
import { emptyItem, useNewPurchaseController } from "./useNewPurchaseController";

export function NewPurchase() {
  const {
    control,
    register,
    setValue,
    errors,
    handleSubmit,
    isPending,
    fields,
    append,
    remove,
    items,
    suppliers,
    supplies,
    units,
  } = useNewPurchaseController();

  const total = (items ?? []).reduce((sum, item) => {
    const supply = supplies.find(candidate => candidate.id === item.supplyId);

    const line = computePurchaseLine({
      quantity: item.quantity,
      price: item.price,
      priceMode: item.priceMode,
      unit: units.find(candidate => candidate.id === item.unitId),
      baseUnit: units.find(candidate => candidate.id === supply?.baseUnitId),
    });

    return sum + (line?.totalPrice ?? 0);
  }, 0);

  return (
    <>
      <Link
        to="/purchases"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-400"
      >
        <ChevronLeftIcon />
        Voltar para compras
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <span className="text-sm font-normal text-gray-500">
                Fornecedor (opcional)
              </span>

              <Select {...register('supplierId')}>
                <option value="">Sem fornecedor</option>

                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-normal text-gray-500">
                Número da nota (opcional)
              </span>

              <Input
                type="text"
                placeholder="Ex: 12345"
                error={errors.documentNumber?.message}
                {...register('documentNumber')}
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-normal text-gray-500">Data de emissão</span>

              <input
                type="date"
                {...register('issuedAt')}
                className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <span className="text-sm font-normal text-gray-500">Observação (opcional)</span>

            <Input
              type="text"
              placeholder="Ex: entrega parcial, o restante vem na semana que vem"
              error={errors.notes?.message}
              {...register('notes')}
            />
          </div>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <PurchaseItemFields
              key={field.id}
              index={index}
              control={control}
              register={register}
              setValue={setValue}
              errors={errors}
              item={items?.[index]}
              supplies={supplies}
              units={units}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
            />
          ))}

          {errors.items?.message && (
            <span className="block text-xs text-red-900">{errors.items.message}</span>
          )}

          <button
            type="button"
            onClick={() => append(emptyItem)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 py-3 text-sm font-medium text-gray-500"
          >
            <PlusIcon />
            Adicionar item
          </button>
        </div>

        <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-gray-400">Total da nota</span>

            <strong className="text-2xl font-bold text-gray-500">
              {formatCurrency(total)}
            </strong>
          </div>

          <p className="mt-3 flex items-start gap-2 text-xs text-gray-400">
            <InfoCircledIcon className="mt-0.5 shrink-0" />

            O total é a soma dos itens e é calculado pela API — não existe campo
            para informá-lo, porque um cabeçalho que não bate com as linhas
            deixaria o sistema sem saber qual dos dois está certo.
          </p>
        </div>

        <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-900">
          A compra é salva como <strong>rascunho</strong>: ela não encosta no
          estoque nem no custo dos insumos até você confirmar, na tela seguinte.
        </div>

        <footer className="flex flex-col-reverse items-stretch gap-3 pb-4 sm:flex-row sm:items-center sm:justify-end">
          <Link to="/purchases" className="py-3 text-center font-bold text-red-800">
            Cancelar
          </Link>

          <Button isLoading={isPending} className="w-full sm:w-auto">
            Salvar Rascunho
          </Button>
        </footer>
      </form>
    </>
  );
}
