import { useState } from "react";
import { Link } from "react-router-dom";

import { RecipeType } from "../../../../../types/Recipe";
import { useRecipes } from "../../../../../app/hooks/useRecipeQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { Select } from "../../../../components/Select";
import { TableComponents } from "../../../../components/TableElements";

interface RecipesListProps {
  type: RecipeType;
}

export function RecipesList({ type }: RecipesListProps) {
  const [active, setActive] = useState<'true' | 'false' | ''>('');

  const { recipes, isFetching, isError, refetch } = useRecipes({
    type,
    ...(active ? { active } : {}),
  });

  const isSub = type === 'SUB';

  return (
    <>
      <ContentHeader
        title={isSub ? 'Sub-receitas' : 'Fichas técnicas'}
        quantity={recipes.length}
      >
        <Link
          to={isSub ? '/menu/recipes/new?type=SUB' : '/menu/recipes/new'}
          className="pt-1 text-sm font-bold text-red-600"
        >
          {isSub ? 'Nova Sub-receita' : 'Nova Ficha'}
        </Link>
      </ContentHeader>

      <p className="mb-6 text-sm text-gray-400">
        {isSub
          ? 'Sub-receitas são preparos usados dentro de outras fichas — um molho, uma massa base. Elas não são vendidas sozinhas.'
          : 'Só uma versão fica ativa por prato: é ela que dá baixa no estoque a cada venda. Criar uma versão nova não troca a que está valendo.'}
      </p>

      <div className="mb-6 sm:max-w-xs">
        <Select
          value={active}
          onChange={event => setActive(event.target.value as 'true' | 'false' | '')}
        >
          <option value="">Todas as versões</option>
          <option value="true">Somente ativas</option>
          <option value="false">Somente inativas</option>
        </Select>
      </div>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={recipes.length === 0}
        emptyMessage={
          isSub
            ? 'Nenhuma sub-receita cadastrada ainda.'
            : 'Nenhuma ficha técnica cadastrada ainda.'
        }
        errorMessage="Não foi possível carregar as fichas."
        onRetry={refetch}
      >
        <div className="space-y-3 md:hidden">
          {recipes.map(recipe => (
            <Link
              key={recipe.id}
              to={`/menu/recipes/${recipe.id}`}
              className="block rounded-lg border border-gray-600 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-gray-500">
                    {recipe.product?.name ?? recipe.name}
                  </strong>

                  <span className="text-xs text-gray-400">
                    Versão {recipe.version} · {recipe._count.items} item(ns)
                  </span>
                </div>

                <span className={cn(
                  'whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium',
                  recipe.active ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-400',
                )}>
                  {recipe.active ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              {isSub && recipe.yieldUnit && (
                <span className="mt-2 block text-xs text-gray-400">
                  Rende {formatQuantity(recipe.yieldQuantity)} {recipe.yieldUnit.code}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <TableComponents.Table>
            <thead>
              <tr className="bg-gray-600/20">
                <TableComponents.TableHeader>
                  {isSub ? 'Sub-receita' : 'Prato'}
                </TableComponents.TableHeader>
                <TableComponents.TableHeader>Versão</TableComponents.TableHeader>
                <TableComponents.TableHeader>Itens</TableComponents.TableHeader>
                <TableComponents.TableHeader>Rendimento</TableComponents.TableHeader>
                <TableComponents.TableHeader>Situação</TableComponents.TableHeader>
                <TableComponents.TableHeader>Ações</TableComponents.TableHeader>
              </tr>
            </thead>

            <tbody>
              {recipes.map(recipe => (
                <TableComponents.TableRow key={recipe.id}>
                  <TableComponents.TableCell>
                    <Link
                      to={`/menu/recipes/${recipe.id}`}
                      className="font-medium hover:underline"
                    >
                      {recipe.product?.name ?? recipe.name}
                    </Link>

                    {recipe.product && recipe.name && (
                      <span className="block text-xs text-gray-400">{recipe.name}</span>
                    )}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>{recipe.version}</TableComponents.TableCell>

                  <TableComponents.TableCell>{recipe._count.items}</TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatQuantity(recipe.yieldQuantity)}{' '}
                    {recipe.yieldUnit?.code ?? 'porção(ões)'}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    <span className={cn(
                      'whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium',
                      recipe.active ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-400',
                    )}>
                      {recipe.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    <Link
                      to={`/menu/recipes/${recipe.id}`}
                      className="text-sm font-bold text-red-600"
                    >
                      Abrir
                    </Link>
                  </TableComponents.TableCell>
                </TableComponents.TableRow>
              ))}
            </tbody>
          </TableComponents.Table>
        </div>
      </ListFeedback>
    </>
  );
}

export function ProductRecipes() {
  return <RecipesList type="PRODUCT" />;
}

export function SubRecipes() {
  return <RecipesList type="SUB" />;
}
