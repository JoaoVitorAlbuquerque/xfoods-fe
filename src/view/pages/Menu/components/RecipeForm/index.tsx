import { Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { ChevronLeftIcon, InfoCircledIcon, PlusIcon } from "@radix-ui/react-icons";

import { RecipeDetail, RecipeType, sizeTypeLabels, sizeTypes } from "../../../../../types/Recipe";
import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { QuantityInput } from "../../../../components/QuantityInput";
import { SupplySelect } from "../../../../components/SupplySelect";
import { RecipeItemFields } from "./components/RecipeItemFields";
import {
  RecipeFormMode,
  emptyRecipeItem,
  useRecipeFormController,
} from "./useRecipeFormController";

interface RecipeFormProps {
  mode: RecipeFormMode;
  recipeType: RecipeType;
  presetProductId?: string;
  recipe?: RecipeDetail;
  backTo: string;
}

const titles: Record<RecipeFormMode, string> = {
  create: 'Nova ficha técnica',
  edit: 'Editar ficha técnica',
  'new-version': 'Nova versão da ficha',
};

export function RecipeForm({ mode, recipeType, presetProductId, recipe, backTo }: RecipeFormProps) {
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
    outputSupplyId,
    defineSizeFactors,
    sizeFactors,
    yieldUnitId,
    yieldQuantity,
    units,
    supplies,
    subRecipes,
    products,
  } = useRecipeFormController({ mode, recipeType, presetProductId, recipe });

  const isSubRecipe = recipeType === 'SUB';

  return (
    <>
      <Link
        to={backTo}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-400"
      >
        <ChevronLeftIcon />
        Voltar
      </Link>

      <h2 className="mb-6 text-lg font-semibold text-gray-500">
        {titles[mode]}
        {recipe && ` — ${recipe.product?.name ?? recipe.name} (v${recipe.version})`}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {!isSubRecipe && (
              <div className="space-y-2">
                <span className="text-sm font-normal text-gray-500">Prato</span>

                {/*
                  Só a edição bloqueia o campo. Em criação com prato
                  pré-escolhido ele fica habilitado de propósito: campo
                  desabilitado não é submetido pelo react-hook-form, e o prato
                  chegaria vazio na API.
                */}
                <Select disabled={mode !== 'create'} {...register('productId')}>
                  <option value="">Selecione o prato</option>

                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Select>

                {mode !== 'create' && (
                  <span className="block text-xs text-gray-400">
                    O prato de uma ficha não muda: mover a ficha reinterpretaria
                    o custo já calculado com ela.
                  </span>
                )}
              </div>
            )}

            <div className="space-y-2">
              <span className="text-sm font-normal text-gray-500">
                {isSubRecipe ? 'Nome da sub-receita' : 'Apelido da versão (opcional)'}
              </span>

              <Input
                type="text"
                placeholder={isSubRecipe ? 'Ex: Molho de tomate' : 'Ex: receita de verão'}
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <span className="text-sm font-normal text-gray-500">
                Rendimento {isSubRecipe ? '' : '(quantas porções uma execução rende)'}
              </span>

              <QuantityInput
                quantity={yieldQuantity}
                onQuantityChange={value => setValue('yieldQuantity', value)}
                unitId={yieldUnitId}
                onUnitChange={value => setValue('yieldUnitId', value)}
                allowPackaging={false}
                unitPlaceholder={isSubRecipe ? 'Un.' : 'Opcional'}
              />

              <span className="block text-xs text-gray-400">
                {isSubRecipe
                  ? 'Obrigatório: é como as outras fichas medem quanto usam desta. Ex.: 2.000 ML de molho.'
                  : 'Padrão 1 porção. O custo por porção é o custo direto dividido por este número.'}
              </span>
            </div>

            {/*
              O campo que decide os dois modos de uma sub-receita. Sem ele, a
              ficha é composição de custo e se desdobra na venda; com ele, o
              subproduto ganha saldo próprio e passa a depender de produção.
            */}
            {isSubRecipe && (
              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-normal text-gray-500">
                  Insumo de saída (opcional)
                </span>

                <Controller
                  control={control}
                  name="outputSupplyId"
                  render={({ field: { value, onChange } }) => (
                    <div className="space-y-2">
                      <SupplySelect
                        value={value}
                        onChange={onChange}
                        placeholder="Sem insumo de saída"
                      />

                      {value && (
                        <button
                          type="button"
                          onClick={() => onChange('')}
                          className="text-xs font-bold text-red-600"
                        >
                          Remover insumo de saída
                        </button>
                      )}
                    </div>
                  )}
                />

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-xs">
                    <thead>
                      <tr className="text-left text-gray-400">
                        <th className="py-1 pr-3 font-normal"> </th>
                        <th className="py-1 pr-3 font-normal">Sem insumo de saída</th>
                        <th className="py-1 font-normal">Com insumo de saída</th>
                      </tr>
                    </thead>

                    <tbody className="text-gray-500">
                      <tr className="border-t border-gray-600/40">
                        <td className="py-1 pr-3 text-gray-400">O que é</td>
                        <td className="py-1 pr-3">composição de custo</td>
                        <td className="py-1 font-medium">subproduto estocado</td>
                      </tr>

                      <tr className="border-t border-gray-600/40">
                        <td className="py-1 pr-3 text-gray-400">Na venda</td>
                        <td className="py-1 pr-3">desdobra até tomate e cebola</td>
                        <td className="py-1 font-medium">consome o molho</td>
                      </tr>

                      <tr className="border-t border-gray-600/40">
                        <td className="py-1 pr-3 text-gray-400">Quem repõe</td>
                        <td className="py-1 pr-3">a compra dos ingredientes</td>
                        <td className="py-1 font-medium">a ordem de produção</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {outputSupplyId ? (
                  <p className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
                    <InfoCircledIcon className="mt-0.5 shrink-0" />

                    <span>
                      Ao salvar, esta sub-receita passa a ter{' '}
                      <strong>saldo próprio e precisará ser produzida</strong>: as
                      fichas que a usam vão consumir esse saldo em vez de
                      desdobrar até os ingredientes, e quem repõe o saldo é a{' '}
                      <Link to="/production/new" className="font-bold underline">
                        ordem de produção
                      </Link>
                      . A unidade base do insumo precisa ser da mesma grandeza do
                      rendimento — massa com massa, volume com volume.
                    </span>
                  </p>
                ) : (
                  <span className="block text-xs text-gray-400">
                    Em branco, esta sub-receita é só composição de custo: ela não
                    tem saldo e se desdobra nos ingredientes a cada venda.
                  </span>
                )}
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <span className="text-sm font-normal text-gray-500">Observações (opcional)</span>

              <Input
                type="text"
                placeholder="Ex: modo de preparo, ponto da massa"
                error={errors.notes?.message}
                {...register('notes')}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-500">Itens</h3>

          {fields.map((field, index) => (
            <RecipeItemFields
              key={field.id}
              index={index}
              control={control}
              register={register}
              setValue={setValue}
              errors={errors}
              item={items?.[index]}
              supplies={supplies}
              subRecipes={subRecipes}
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
            onClick={() => append(emptyRecipeItem)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 py-3 text-sm font-medium text-gray-500"
          >
            <PlusIcon />
            Adicionar item
          </button>
        </div>

        {!isSubRecipe && (
          <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
            <label className="flex items-start gap-3" role="button">
              <input
                type="checkbox"
                className="mt-1 size-5 shrink-0 rounded text-red-500 focus:ring-0"
                {...register('defineSizeFactors')}
              />

              <span>
                <span className="block font-medium text-gray-500">
                  Definir fatores de tamanho
                </span>

                <span className="mt-1 block text-xs text-gray-400">
                  A ficha descreve uma unidade do prato e o tamanho a escala: uma
                  pizza broto não usa a mesma massa que uma gigante. Tamanho sem
                  fator cadastrado vale 1.
                </span>
              </span>
            </label>

            {defineSizeFactors && (
              <>
                <p className="mt-4 flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
                  <InfoCircledIcon className="mt-0.5 shrink-0" />

                  <span>
                    A leitura da ficha na API não devolve os fatores já salvos,
                    então esta tabela começa vazia. Ao salvar com a opção
                    marcada, <strong>ela substitui a tabela inteira</strong> —
                    preencha todos os tamanhos que quiser manter. Deixando a
                    opção desmarcada, os fatores atuais são preservados.
                  </span>
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {sizeTypes.map((size, index) => (
                    <div key={size} className="space-y-1">
                      <span className="text-xs text-gray-400">{sizeTypeLabels[size]}</span>

                      <Controller
                        control={control}
                        name={`sizeFactors.${index}.factor`}
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
                            placeholder="1"
                            className="h-11 w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
                          />
                        )}
                      />

                    </div>
                  ))}
                </div>

                <span className="mt-2 block text-xs text-gray-400">
                  {sizeFactors.filter(entry => entry.factor && Number(entry.factor) > 0).length}{' '}
                  tamanho(s) com fator definido. Em branco = fator 1.
                </span>
              </>
            )}
          </div>
        )}

        {mode === 'create' && (
          <label className="flex items-start gap-3 rounded-lg border border-gray-600 bg-white p-4" role="button">
            <input
              type="checkbox"
              className="mt-1 size-5 shrink-0 rounded text-red-500 focus:ring-0"
              {...register('activate')}
            />

            <span>
              <span className="block font-medium text-gray-500">
                Ativar esta ficha ao criar
              </span>

              <span className="mt-1 block text-xs text-gray-400">
                A primeira versão de um prato é ativada automaticamente. As
                seguintes nascem inativas, para que criar uma versão nova não
                troque em silêncio a ficha que está valendo nas vendas.
              </span>
            </span>
          </label>
        )}

        {mode === 'new-version' && (
          <p className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-900">
            A versão nova nasce <strong>inativa</strong> e a atual continua
            valendo. Depois de conferir, ative-a na tela da ficha.
          </p>
        )}

        <footer className="flex flex-col-reverse items-stretch gap-3 pb-4 sm:flex-row sm:items-center sm:justify-end">
          <Link to={backTo} className="py-3 text-center font-bold text-red-800">
            Cancelar
          </Link>

          <Button isLoading={isPending} className="w-full sm:w-auto">
            {mode === 'new-version' ? 'Criar Versão' : 'Salvar Ficha'}
          </Button>
        </footer>
      </form>
    </>
  );
}
