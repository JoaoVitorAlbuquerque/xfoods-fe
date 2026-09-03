import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";

import { recipesService } from "../../../../../app/services/recipesService";
import { recipesQueryKey, useInvalidateRecipes, useRecipes } from "../../../../../app/hooks/useRecipeQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { Button } from "../../../../components/Button";
import { ListFeedback } from "../../../../components/ListFeedback";
import { Modal } from "../../../../components/Modal";
import { TableComponents } from "../../../../components/TableElements";

export function RecipeDetail() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [confirmingActivate, setConfirmingActivate] = useState(false);

  const { data: recipe, isFetching, isError, refetch } = useQuery({
    queryKey: [...recipesQueryKey, 'detail', recipeId],
    queryFn: () => recipesService.getById(recipeId!),
    enabled: Boolean(recipeId),
  });

  // Todas as versões do mesmo prato, para a lista de versões e o botão de ativar.
  const { recipes: versions } = useRecipes(
    recipe?.productId ? { productId: recipe.productId } : {},
  );

  const invalidateRecipes = useInvalidateRecipes();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (action: 'activate' | 'deactivate') => (
      action === 'activate'
        ? recipesService.activate(recipeId!)
        : recipesService.deactivate(recipeId!)
    ),
  });

  const handleToggleActive = useCallback(async (action: 'activate' | 'deactivate') => {
    try {
      await mutateAsync(action);

      invalidateRecipes();
      refetch();
      toast.success(
        action === 'activate'
          ? 'Ficha ativada: ela passa a valer para as próximas vendas.'
          : 'Ficha desativada. O prato fica sem ficha ativa até você ativar outra.',
      );
      setConfirmingActivate(false);
    } catch (error) {
      toastApiError(error, 'Não foi possível concluir a operação!');
    }
  }, [mutateAsync, invalidateRecipes, refetch]);

  const isSubRecipe = recipe ? recipe.productId === null : false;
  const backTo = isSubRecipe ? '/menu/sub-recipes' : '/menu/recipes';

  return (
    <>
      {confirmingActivate && recipe && (
        <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
          <Modal visible onClose={() => setConfirmingActivate(false)} title="Ativar Ficha">
            <div className="space-y-4 sm:max-w-[420px]">
              <p className="text-sm text-gray-400">
                A versão <strong>{recipe.version}</strong> passa a ser a ficha
                usada para dar baixa no estoque das próximas vendas de{' '}
                <strong>{recipe.product?.name ?? recipe.name}</strong>.
              </p>

              <p className="text-xs text-gray-400">
                Só uma versão fica ativa por prato: as outras são desativadas na
                mesma operação. Vendas já registradas não mudam — elas guardam a
                ficha que valia no dia.
              </p>
            </div>

            <footer className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setConfirmingActivate(false)}
                disabled={isPending}
                className="py-3 font-bold text-red-800"
              >
                Voltar
              </button>

              <Button
                onClick={() => handleToggleActive('activate')}
                isLoading={isPending}
                className="w-full sm:w-auto"
              >
                Ativar Versão {recipe.version}
              </Button>
            </footer>
          </Modal>
        </div>
      )}

      <Link
        to={backTo}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-400"
      >
        <ChevronLeftIcon />
        Voltar
      </Link>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={!recipe}
        emptyMessage="Ficha não encontrada."
        errorMessage="Não foi possível carregar a ficha técnica."
        onRetry={refetch}
      >
        {recipe && (
          <>
            <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-500">
                    {recipe.product?.name ?? recipe.name}
                  </h2>

                  <span className="text-sm text-gray-400">
                    Versão {recipe.version}
                    {recipe.product && recipe.name && ` · ${recipe.name}`}
                    {isSubRecipe && ' · sub-receita'}
                  </span>

                  {recipe.notes && (
                    <p className="mt-2 text-sm text-gray-400">{recipe.notes}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn(
                    'rounded px-2 py-0.5 text-xs font-medium',
                    recipe.active
                      ? 'bg-green-100 text-green-900'
                      : 'bg-gray-100 text-gray-400',
                  )}>
                    {recipe.active ? 'Ativa' : 'Inativa'}
                  </span>

                  {recipe.hasMissingCost && (
                    <span
                      className="flex items-center gap-1 rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-900"
                      title="A ficha usa insumo nunca comprado, então o custo está subestimado."
                    >
                      <ExclamationTriangleIcon />
                      Custo incompleto
                    </span>
                  )}
                </div>
              </div>

              {recipe.hasMissingCost && (
                <p className="mt-4 flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
                  <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                  <span>
                    Esta ficha usa pelo menos um insumo que nunca foi comprado, e
                    insumo sem custo entra como zero. <strong>O custo direto
                    abaixo está subestimado</strong> — lance a compra do insumo
                    para o número ficar confiável.
                  </span>
                </p>
              )}

              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to={`/menu/recipes/${recipe.id}/edit`}
                  className="rounded-full border border-gray-600 px-4 py-2 text-center text-sm font-medium text-gray-500"
                >
                  Editar ficha
                </Link>

                <Link
                  to={`/menu/recipes/${recipe.id}/edit?mode=new-version`}
                  className="rounded-full border border-gray-600 px-4 py-2 text-center text-sm font-medium text-gray-500"
                >
                  Criar nova versão
                </Link>

                {recipe.active ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleToggleActive('deactivate')}
                    className="rounded-full border border-gray-600 px-4 py-2 text-sm font-medium text-gray-500"
                  >
                    Desativar
                  </button>
                ) : (
                  <Button onClick={() => setConfirmingActivate(true)} className="w-full sm:w-auto">
                    Ativar esta versão
                  </Button>
                )}
              </div>
            </div>

            <h3 className="mt-8 mb-4 text-lg font-semibold text-gray-500">Itens da ficha</h3>

            <div className="space-y-3 md:hidden">
              {recipe.items.map(line => (
                <div key={line.id} className="rounded-lg border border-gray-600 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0 truncate font-semibold text-gray-500">
                      {line.name}
                    </span>

                    <strong className="whitespace-nowrap text-gray-500">
                      {formatCurrency(line.totalCost)}
                    </strong>
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    <span className="block">
                      {formatQuantity(line.quantity)} {line.unit} líquidos
                      {line.wastePercent > 0 && (
                        <> · perda {formatQuantity(line.wastePercent)}% → bruto{' '}
                        {formatQuantity(line.effectiveQuantity)}</>
                      )}
                    </span>

                    <span className="block">
                      Custo unitário: {formatCurrency(line.unitCost)}
                    </span>

                    {line.type !== 'SUPPLY' && (
                      <span className="block">
                        {line.type === 'SUB_RECIPE_STOCKED'
                          ? 'Sub-receita estocada: custa o que custou produzi-la'
                          : 'Sub-receita desdobrada até os insumos'}
                      </span>
                    )}

                    {line.notes && <span className="block">{line.notes}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <TableComponents.Table>
                <thead>
                  <tr className="bg-gray-600/20">
                    <TableComponents.TableHeader>Insumo</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Quantidade</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Unidade</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Perda</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Bruto</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo unitário</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo total</TableComponents.TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {recipe.items.map(line => (
                    <TableComponents.TableRow key={line.id}>
                      <TableComponents.TableCell>
                        {line.name}

                        {line.type !== 'SUPPLY' && (
                          <span className="block text-xs text-gray-400">
                            {line.type === 'SUB_RECIPE_STOCKED'
                              ? 'sub-receita estocada'
                              : 'sub-receita'}
                          </span>
                        )}

                        {line.notes && (
                          <span className="block text-xs text-gray-400">{line.notes}</span>
                        )}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(line.quantity)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>{line.unit}</TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {line.wastePercent > 0 ? `${formatQuantity(line.wastePercent)}%` : '—'}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(line.effectiveQuantity)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatCurrency(line.unitCost)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap font-medium">
                        {formatCurrency(line.totalCost)}
                      </TableComponents.TableCell>
                    </TableComponents.TableRow>
                  ))}
                </tbody>
              </TableComponents.Table>
            </div>

            <div className="mt-4 rounded-lg border border-gray-600 bg-white p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-gray-500">
                  Custo direto estimado {recipe.product ? 'do prato' : 'da sub-receita'}
                </span>

                <strong className="text-2xl font-bold text-gray-500">
                  {formatCurrency(recipe.directCost)}
                </strong>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-400">
                <span>
                  Rendimento: {formatQuantity(recipe.yieldQuantity)}{' '}
                  {recipe.yieldUnit?.code ?? 'porção(ões)'}
                </span>

                <span>
                  Custo por unidade de rendimento:{' '}
                  <strong className="text-gray-500">
                    {formatCurrency(recipe.costPerYieldUnit)}
                  </strong>
                </span>
              </div>

              {recipe.product && (
                <div className="mt-3 border-t border-gray-600/40 pt-3 text-sm text-gray-400">
                  Preço de venda atual: {formatCurrency(recipe.product.price)} — este
                  custo é só o <strong>direto</strong> (insumos). Custo indireto,
                  impostos e taxas entram na formação de preço.
                </div>
              )}
            </div>

            {!isSubRecipe && (
              <p className="mt-4 flex items-start gap-2 text-xs text-gray-400">
                <InfoCircledIcon className="mt-0.5 shrink-0" />

                Os fatores de tamanho desta ficha não aparecem aqui: a leitura da
                API ainda não os devolve. Eles continuam valendo na baixa de
                estoque e podem ser redefinidos na edição da ficha.
              </p>
            )}

            {versions.length > 1 && (
              <>
                <h3 className="mt-8 mb-4 text-lg font-semibold text-gray-500">Versões</h3>

                <div className="space-y-2">
                  {versions.map(version => (
                    <div
                      key={version.id}
                      className={cn(
                        'flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4',
                        version.id === recipe.id ? 'border-red-200' : 'border-gray-600',
                      )}
                    >
                      <div>
                        <strong className="text-sm text-gray-500">
                          Versão {version.version}
                        </strong>

                        <span className="ml-2 text-xs text-gray-400">
                          {version._count.items} item(ns)
                          {version.name && ` · ${version.name}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'rounded px-2 py-0.5 text-xs font-medium',
                          version.active
                            ? 'bg-green-100 text-green-900'
                            : 'bg-gray-100 text-gray-400',
                        )}>
                          {version.active ? 'Ativa' : 'Inativa'}
                        </span>

                        {version.id !== recipe.id && (
                          <Link
                            to={`/menu/recipes/${version.id}`}
                            className="text-sm font-bold text-red-600"
                          >
                            Abrir
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </ListFeedback>
    </>
  );
}
