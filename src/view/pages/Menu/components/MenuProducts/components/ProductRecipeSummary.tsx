import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { recipesService } from "../../../../../../app/services/recipesService";
import { recipesQueryKey } from "../../../../../../app/hooks/useRecipeQueries";
import { formatCurrency } from "../../../../../../app/utils/formatCurrency";
import { Spinner } from "../../../../../components/Spinner";

interface ProductRecipeSummaryProps {
  productId: string;
}

/**
 * Resumo da ficha ativa dentro do formulário de produto. A edição da ficha
 * mora em tela própria: ela é versionada, tem custo calculado e uma tabela de
 * itens que não caberia neste modal — principalmente no celular.
 */
export function ProductRecipeSummary({ productId }: ProductRecipeSummaryProps) {
  const { data: recipe, isFetching, error } = useQuery({
    queryKey: [...recipesQueryKey, 'active', productId],
    queryFn: () => recipesService.getActiveByProduct(productId),
    enabled: Boolean(productId),
  });

  // 404 aqui não é falha: é o prato ainda não ter ficha ativa.
  const hasNoRecipe = axios.isAxiosError(error) && error.response?.status === 404;

  return (
    <div className="mt-8 rounded-lg border border-gray-600 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong className="text-sm font-bold text-gray-500">Ficha técnica</strong>

        {isFetching && <Spinner className="size-5" />}
      </div>

      {!isFetching && recipe && (
        <>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-gray-400">
              Versão {recipe.version} · {recipe.items.length} item(ns)
            </span>

            <strong className="text-gray-500">
              Custo direto: {formatCurrency(recipe.directCost)}
            </strong>
          </div>

          {recipe.hasMissingCost && (
            <p className="mt-2 flex items-start gap-2 text-xs text-yellow-900">
              <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

              A ficha usa insumo nunca comprado: este custo está subestimado.
            </p>
          )}

          <Link
            to={`/menu/recipes/${recipe.id}`}
            className="mt-3 inline-block text-sm font-bold text-red-600"
          >
            Abrir ficha técnica
          </Link>
        </>
      )}

      {!isFetching && hasNoRecipe && (
        <>
          <p className="mt-2 text-xs text-gray-400">
            Este prato não tem ficha ativa: ele vende sem baixar insumo nenhum, e
            o custo dele não entra em nenhum relatório.
          </p>

          <Link
            to={`/menu/recipes/new?productId=${productId}`}
            className="mt-3 inline-block text-sm font-bold text-red-600"
          >
            Criar ficha técnica
          </Link>
        </>
      )}

      {!isFetching && error && !hasNoRecipe && (
        <p className="mt-2 text-xs text-gray-400">
          Não foi possível carregar a ficha técnica deste prato.
        </p>
      )}
    </div>
  );
}
