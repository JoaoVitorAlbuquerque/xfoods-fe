import { Controller, Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { TrashIcon } from "@radix-ui/react-icons";

import { MeasurementUnit } from "../../../../../../types/MeasurementUnit";
import { Supply } from "../../../../../../types/Supply";
import { computePurchaseLine } from "../../../../../../app/utils/computePurchaseLine";
import { formatCurrency } from "../../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../../app/utils/formatQuantity";
import { Input } from "../../../../../components/Input";
import { QuantityInput } from "../../../../../components/QuantityInput";
import { Select } from "../../../../../components/Select";
import { SupplySelect } from "../../../../../components/SupplySelect";
import { NewPurchaseFormData } from "../useNewPurchaseController";

interface PurchaseItemFieldsProps {
  index: number;
  control: Control<NewPurchaseFormData>;
  register: UseFormRegister<NewPurchaseFormData>;
  setValue: UseFormSetValue<NewPurchaseFormData>;
  errors: FieldErrors<NewPurchaseFormData>;
  item: NewPurchaseFormData['items'][number] | undefined;
  supplies: Supply[];
  units: MeasurementUnit[];
  canRemove: boolean;
  onRemove(): void;
}

export function PurchaseItemFields({
  index,
  control,
  register,
  setValue,
  errors,
  item,
  supplies,
  units,
  canRemove,
  onRemove,
}: PurchaseItemFieldsProps) {
  const itemErrors = errors.items?.[index];

  const supply = supplies.find(candidate => candidate.id === item?.supplyId);
  const unit = units.find(candidate => candidate.id === item?.unitId);
  const baseUnit = units.find(candidate => candidate.id === supply?.baseUnitId);

  const line = computePurchaseLine({
    quantity: item?.quantity,
    price: item?.price,
    priceMode: item?.priceMode ?? 'TOTAL',
    unit,
    baseUnit,
  });

  return (
    <div className="rounded-lg border border-gray-600 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-500">Item {index + 1}</span>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            title="Remover item"
            className="flex items-center gap-1 text-xs font-medium text-red-800"
          >
            <TrashIcon />
            Remover
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <span className="text-sm font-normal text-gray-500">Insumo</span>

          <Controller
            control={control}
            name={`items.${index}.supplyId`}
            render={({ field: { value, onChange } }) => (
              <SupplySelect
                value={value}
                onChange={supplyId => {
                  onChange(supplyId);

                  // A unidade base do insumo é o palpite certo na maioria das
                  // notas; trocar de insumo sem trocar a unidade deixaria um KG
                  // selecionado num insumo contado em unidades.
                  const selected = supplies.find(candidate => candidate.id === supplyId);

                  if (selected) {
                    setValue(`items.${index}.unitId`, selected.baseUnitId);
                  }
                }}
                error={itemErrors?.supplyId?.message}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-normal text-gray-500">Quantidade comprada</span>

          <QuantityInput
            quantity={item?.quantity}
            onQuantityChange={value => setValue(`items.${index}.quantity`, value)}
            unitId={item?.unitId}
            onUnitChange={value => setValue(`items.${index}.unitId`, value)}
            kind={supply?.baseUnit.kind}
            allowPackaging={false}
            disabled={!supply}
            error={itemErrors?.quantity?.message ?? itemErrors?.unitId?.message}
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-normal text-gray-500">Preço da nota</span>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Select {...register(`items.${index}.priceMode`)}>
              <option value="TOTAL">Total da linha</option>
              <option value="UNIT">Preço por unidade</option>
            </Select>

            <Controller
              control={control}
              name={`items.${index}.price`}
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
                  className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
                />
              )}
            />
          </div>

          {itemErrors?.price?.message && (
            <span className="block text-xs text-red-900">{itemErrors.price.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <span className="text-sm font-normal text-gray-500">Lote (opcional)</span>

          <Input
            type="text"
            placeholder="Ex: L-2291"
            error={itemErrors?.batch?.message}
            {...register(`items.${index}.batch`)}
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-normal text-gray-500">Validade (opcional)</span>

          <input
            type="date"
            {...register(`items.${index}.expiresAt`)}
            className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
          />
        </div>
      </div>

      {line && supply && baseUnit && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <span className="block">
            {formatQuantity(line.quantity)} {unit?.code} ={' '}
            {formatQuantity(line.quantityBase)} {baseUnit.code}
          </span>

          <span className="mt-1 block">
            Total da linha: <strong>{formatCurrency(line.totalPrice)}</strong>
          </span>

          <span className="mt-1 block">
            Custo por unidade base:{' '}
            <strong>
              {formatCurrency(line.unitCostBase)}/{baseUnit.code}
            </strong>{' '}
            — é este número que torna esta compra comparável com as anteriores.
          </span>
        </div>
      )}
    </div>
  );
}
