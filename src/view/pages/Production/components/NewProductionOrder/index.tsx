import { Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { ChevronLeftIcon, InfoCircledIcon, TrashIcon } from "@radix-ui/react-icons";

import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { SupplySelect } from "../../../../components/SupplySelect";
import { Spinner } from "../../../../components/Spinner";
import { useNewProductionOrderController } from "./useNewProductionOrderController";

export function NewProductionOrder() {
  const {
    control,
    register,
    errors,
    handleSubmit,
    isPending,
    fields,
    remove,
    items,
    recipes,
    compositionOnly,
    isLoadingRecipes,
    isLoadingRecipe,
    recipe,
    recipeDetail,
    outputSupply,
    supplies,
    preview,
    previewCost,
    expectedYield,
    batchCount,
    adjustItems,
    canAdjustItems,
    hasSubRecipeLines,
  } = useNewProductionOrderController();

  return (
    <>
      <Link
        to="/production"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-400"
      >
        <ChevronLeftIcon />
        Voltar
      </Link>

      <h2 className="mb-6 text-lg font-semibold text-gray-500">
        Nova ordem de produção
      </h2>

      {!isLoadingRecipes && recipes.length === 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900">
          <strong className="block text-sm">
            Nenhuma sub-receita pode ser produzida ainda
          </strong>

          <p className="mt-2 text-xs">
            Só sub-receita com <strong>insumo de saída</strong> vira lote: é ele
            que dá ao subproduto um saldo próprio para repor.{' '}
            {compositionOnly.length > 0 && (
              <>
                As {compositionOnly.length} sub-receita(s) existentes são
                composição de custo — elas se desdobram nos ingredientes a cada
                venda.{' '}
              </>
            )}
            <Link to="/menu/sub-recipes" className="font-bold underline">
              Abrir as sub-receitas
            </Link>{' '}
            para informar o insumo de saída.
          </p>
        </div>
      )}

      {recipes.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm font-normal text-gray-500">Sub-receita</span>

                <Select error={errors.recipeId?.message} {...register('recipeId')}>
                  <option value="">Selecione a sub-receita</option>

                  {recipes.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name ?? `Ficha v${option.version}`}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-normal text-gray-500">
                  Lotes (quantas vezes a receita foi executada)
                </span>

                <Controller
                  control={control}
                  name="batches"
                  render={({ field: { value, onChange } }) => (
                    <NumericFormat
                      value={value}
                      onValueChange={(values, sourceInfo) => {
                        if (sourceInfo.source === 'event') {
                          onChange(values.value);
                        }
                      }}
                      valueIsNumericString
                      decimalSeparator=","
                      allowNegative={false}
                      decimalScale={2}
                      placeholder="1"
                      className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
                    />
                  )}
                />

                {errors.batches?.message && (
                  <span className="block text-xs text-red-900">
                    {errors.batches.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-sm font-normal text-gray-500">
                  Data da produção (opcional)
                </span>

                <input
                  type="datetime-local"
                  {...register('producedAt')}
                  className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
                />

                <span className="block text-xs text-gray-400">
                  Em branco, agora. É a data que as movimentações vão carregar.
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-normal text-gray-500">
                  Observações (opcional)
                </span>

                <Input
                  type="text"
                  placeholder="Ex: panela nova, fogo baixo"
                  error={errors.notes?.message}
                  {...register('notes')}
                />
              </div>
            </div>
          </div>

          {isLoadingRecipe && (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          )}

          {recipeDetail && recipe && (
            <>
              <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <span className="block text-xs text-gray-400">
                      Rendimento previsto
                    </span>

                    <strong className="text-xl font-bold text-gray-500">
                      {formatQuantity(expectedYield)}{' '}
                      {recipeDetail.yieldUnit?.code ?? ''}
                    </strong>

                    <span className="mt-1 block text-xs text-gray-400">
                      {formatQuantity(recipeDetail.yieldQuantity)}{' '}
                      {recipeDetail.yieldUnit?.code ?? ''} × {formatQuantity(batchCount)}{' '}
                      lote(s)
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-400">Subproduto</span>

                    <strong className="block text-gray-500">
                      {outputSupply?.name ?? '—'}
                    </strong>

                    {outputSupply && (
                      <span className="mt-1 block text-xs text-gray-400">
                        saldo hoje: {formatQuantity(outputSupply.currentStock)}{' '}
                        {outputSupply.baseUnit.code}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="block text-xs text-gray-400">
                      Custo previsto dos ingredientes
                    </span>

                    <strong className="text-xl font-bold text-gray-500">
                      {formatCurrency(previewCost)}
                    </strong>
                  </div>
                </div>

                {recipeDetail.hasMissingCost && (
                  <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
                    A ficha usa insumo nunca comprado: o custo previsto está
                    subestimado, e o custo por unidade do subproduto vai sair
                    baixo demais.
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-500">
                  Ingredientes que serão consumidos
                </h3>

                <label className="flex items-start gap-3 rounded-lg border border-gray-600 bg-white p-4" role="button">
                  <input
                    type="checkbox"
                    disabled={!canAdjustItems}
                    className="mt-1 size-5 shrink-0 rounded text-red-500 focus:ring-0 disabled:cursor-not-allowed"
                    {...register('adjustItems')}
                  />

                  <span>
                    <span className="block font-medium text-gray-500">
                      Ajustar o que foi realmente usado
                    </span>

                    <span className="mt-1 block text-xs text-gray-400">
                      A produção registra o que aconteceu, não o que estava
                      planejado. Use se sobrou meio quilo de tomate na panela.
                    </span>
                  </span>
                </label>

                {/*
                  A API desdobra sub-receita aninhada até o insumo; informar
                  `items` substitui a lista inteira. Deixar ajustar aqui
                  descartaria em silêncio os ingredientes da sub-receita.
                */}
                {hasSubRecipeLines && (
                  <p className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                    <InfoCircledIcon className="mt-0.5 shrink-0" />

                    <span>
                      Esta ficha usa sub-receitas, e quem as desdobra até o insumo
                      é a API. Ajustar as quantidades aqui exigiria refazer esse
                      desdobramento no navegador e descartaria os ingredientes
                      das sub-receitas, então o lote vai com as quantidades da
                      ficha. Depois de confirmar, corrija a diferença com um
                      ajuste ou uma perda de estoque.
                    </span>
                  </p>
                )}

                {!adjustItems && (
                  <div className="rounded-lg border border-gray-600 bg-white">
                    <ul className="divide-y divide-gray-600/40">
                      {preview.map(line => (
                        <li
                          key={line.id}
                          className="flex flex-wrap items-center justify-between gap-3 p-4"
                        >
                          <div className="min-w-0">
                            <strong className="block truncate text-sm text-gray-500">
                              {line.name}
                            </strong>

                            <span className="text-xs text-gray-400">
                              {line.type === 'SUPPLY'
                                ? 'insumo'
                                : line.type === 'SUB_RECIPE_STOCKED'
                                  ? 'sub-receita estocada'
                                  : 'sub-receita desdobrada'}

                              {line.wastePercent > 0
                                && ` · perda de preparo de ${formatQuantity(line.wastePercent, 2)}%`}
                            </span>
                          </div>

                          <span className="whitespace-nowrap text-right text-sm">
                            <strong className="block text-gray-500">
                              {formatQuantity(line.previewQuantity)}
                            </strong>

                            <span className="text-xs text-gray-400">
                              {formatCurrency(line.previewCost)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {adjustItems && (
                  <div className="space-y-3">
                    {fields.map((field, index) => {
                      const supply = supplies.find(
                        item => item.id === items?.[index]?.supplyId,
                      );

                      return (
                        <div
                          key={field.id}
                          className="rounded-lg border border-gray-600 bg-white p-4"
                        >
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-start">
                            <Controller
                              control={control}
                              name={`items.${index}.supplyId`}
                              render={({ field: { value, onChange } }) => (
                                <SupplySelect
                                  value={value}
                                  onChange={onChange}
                                  error={errors.items?.[index]?.supplyId?.message}
                                />
                              )}
                            />

                            <div>
                              <Controller
                                control={control}
                                name={`items.${index}.quantity`}
                                render={({ field: { value, onChange } }) => (
                                  <NumericFormat
                                    value={value}
                                    onValueChange={(values, sourceInfo) => {
                                      if (sourceInfo.source === 'event') {
                                        onChange(values.value);
                                      }
                                    }}
                                    valueIsNumericString
                                    decimalSeparator=","
                                    allowNegative={false}
                                    decimalScale={6}
                                    placeholder="Quantidade"
                                    className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
                                  />
                                )}
                              />

                              <span className="mt-1 block text-xs text-gray-400">
                                {supply
                                  ? `na unidade base: ${supply.baseUnit.code}`
                                  : 'na unidade base do insumo'}
                              </span>

                              {errors.items?.[index]?.quantity?.message && (
                                <span className="mt-1 block text-xs text-red-900">
                                  {errors.items[index]?.quantity?.message}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="flex h-[52px] items-center justify-center gap-2 rounded-lg border border-gray-600 px-4 text-sm text-gray-400"
                            >
                              <TrashIcon />
                              <span className="sm:hidden">Remover</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {errors.items?.message && (
                      <span className="block text-xs text-red-900">
                        {errors.items.message}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
            <span className="text-xs text-gray-400 sm:mr-auto">
              O lote nasce <strong>rascunho</strong> e não encosta no estoque.
              Nada sai nem entra até a confirmação.
            </span>

            <Button type="submit" isLoading={isPending} className="w-full sm:w-auto">
              Criar Rascunho
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
