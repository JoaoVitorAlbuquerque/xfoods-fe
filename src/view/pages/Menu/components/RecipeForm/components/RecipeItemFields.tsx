import { Controller, Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { TrashIcon } from "@radix-ui/react-icons";

import { MeasurementUnit } from "../../../../../../types/MeasurementUnit";
import { RecipeListItem } from "../../../../../../types/Recipe";
import { Supply } from "../../../../../../types/Supply";
import { formatQuantity } from "../../../../../../app/utils/formatQuantity";
import { grossQuantity } from "../../../../../../app/utils/grossQuantity";
import { Input } from "../../../../../components/Input";
import { QuantityInput } from "../../../../../components/QuantityInput";
import { Select } from "../../../../../components/Select";
import { SupplySelect } from "../../../../../components/SupplySelect";
import { RecipeFormData } from "../useRecipeFormController";

interface RecipeItemFieldsProps {
  index: number;
  control: Control<RecipeFormData>;
  register: UseFormRegister<RecipeFormData>;
  setValue: UseFormSetValue<RecipeFormData>;
  errors: FieldErrors<RecipeFormData>;
  item: RecipeFormData['items'][number] | undefined;
  supplies: Supply[];
  subRecipes: RecipeListItem[];
  units: MeasurementUnit[];
  canRemove: boolean;
  onRemove(): void;
}

export function RecipeItemFields({
  index,
  control,
  register,
  setValue,
  errors,
  item,
  supplies,
  subRecipes,
  units,
  canRemove,
  onRemove,
}: RecipeItemFieldsProps) {
  const itemErrors = errors.items?.[index];

  const supply = supplies.find(candidate => candidate.id === item?.supplyId);
  const subRecipe = subRecipes.find(candidate => candidate.id === item?.subRecipeId);

  // A unidade do item precisa ser da mesma grandeza da unidade base do insumo
  // ou do rendimento da sub-receita — a API recusa o resto.
  const subRecipeYieldUnit = units.find(unit => unit.code === subRecipe?.yieldUnit?.code);
  const kind = item?.kind === 'SUB_RECIPE' ? subRecipeYieldUnit?.kind : supply?.baseUnit.kind;

  const selectedUnit = units.find(unit => unit.id === item?.unitId);
  const net = Number(item?.quantity);
  const waste = Number(item?.wastePercent || 0);
  const gross = grossQuantity(net, waste);

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
        <div className="space-y-2">
          <span className="text-sm font-normal text-gray-500">Tipo do item</span>

          <Select
            {...register(`items.${index}.kind`, {
              onChange: () => {
                // Trocar o tipo zera a escolha anterior: um item é insumo OU
                // sub-receita, e deixar as duas preenchidas mandaria as duas.
                setValue(`items.${index}.supplyId`, '');
                setValue(`items.${index}.subRecipeId`, '');
                setValue(`items.${index}.unitId`, '');
              },
            })}
          >
            <option value="SUPPLY">Insumo</option>
            <option value="SUB_RECIPE">Sub-receita</option>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-normal text-gray-500">
            {item?.kind === 'SUB_RECIPE' ? 'Sub-receita' : 'Insumo'}
          </span>

          {item?.kind === 'SUB_RECIPE' ? (
            <Select
              error={itemErrors?.subRecipeId?.message}
              {...register(`items.${index}.subRecipeId`, {
                onChange: event => {
                  const selected = subRecipes.find(
                    candidate => candidate.id === event.target.value,
                  );
                  const yieldUnit = units.find(
                    unit => unit.code === selected?.yieldUnit?.code,
                  );

                  setValue(`items.${index}.unitId`, yieldUnit?.id ?? '');
                },
              })}
            >
              <option value="">Selecione a sub-receita</option>

              {subRecipes.map(candidate => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name} (v{candidate.version})
                </option>
              ))}
            </Select>
          ) : (
            <Controller
              control={control}
              name={`items.${index}.supplyId`}
              render={({ field: { value, onChange } }) => (
                <SupplySelect
                  value={value}
                  onChange={supplyId => {
                    onChange(supplyId);

                    const selected = supplies.find(candidate => candidate.id === supplyId);

                    if (selected) {
                      setValue(`items.${index}.unitId`, selected.baseUnitId);
                    }
                  }}
                  error={itemErrors?.supplyId?.message}
                />
              )}
            />
          )}
        </div>

        <div className="space-y-2">
          <span className="text-sm font-normal text-gray-500">
            Quantidade líquida
          </span>

          <QuantityInput
            quantity={item?.quantity}
            onQuantityChange={value => setValue(`items.${index}.quantity`, value)}
            unitId={item?.unitId}
            onUnitChange={value => setValue(`items.${index}.unitId`, value)}
            kind={kind}
            allowPackaging={false}
            disabled={!supply && !subRecipe}
            error={itemErrors?.quantity?.message ?? itemErrors?.unitId?.message}
          />

          <span className="block text-xs text-gray-400">
            É o que a receita de fato usa — a perda de preparo entra ao lado.
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-normal text-gray-500">
            Perda de preparo (%)
          </span>

          <Controller
            control={control}
            name={`items.${index}.wastePercent`}
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
                suffix=" %"
                placeholder="0 %"
                className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
              />
            )}
          />

          {itemErrors?.wastePercent?.message && (
            <span className="block text-xs text-red-900">
              {itemErrors.wastePercent.message}
            </span>
          )}

          {gross !== null && waste > 0 && selectedUnit && (
            <span className="block text-xs font-medium text-gray-500">
              Bruto necessário: {formatQuantity(gross)} {selectedUnit.code} — a
              perda é sobre o que entra, então {formatQuantity(net)} líquidos
              exigem partir de {formatQuantity(gross)}.
            </span>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <span className="text-sm font-normal text-gray-500">Observação (opcional)</span>

          <Input
            type="text"
            placeholder="Ex: ralado na hora"
            error={itemErrors?.notes?.message}
            {...register(`items.${index}.notes`)}
          />
        </div>
      </div>
    </div>
  );
}
