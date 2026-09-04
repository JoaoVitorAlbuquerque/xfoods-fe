import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { recipesQueryKey, useSubRecipes } from "./useRecipeQueries";
import { suppliesQueryKey, stockOverviewQueryKey, stockMovementsQueryKey } from "./useStockQueries";

export const productionQueryKey = ['production-orders'];

/**
 * Só as sub-receitas que podem virar lote: as que têm insumo de saída.
 *
 * Sem `outputSupplyId` a sub-receita é composição de custo — ela se desdobra
 * até tomate e cebola na venda e não tem saldo próprio para repor. A API
 * recusa produzi-la com 400, e escondê-la do seletor evita oferecer um caminho
 * que termina em erro.
 */
export function useProducibleRecipes() {
  const { subRecipes, isFetching } = useSubRecipes();

  return {
    recipes: subRecipes.filter(recipe => recipe.outputSupplyId !== null),
    /** As demais entram na explicação dos dois modos, não no seletor. */
    compositionOnly: subRecipes.filter(recipe => recipe.outputSupplyId === null),
    isFetching,
  };
}

/**
 * Confirmar um lote move estoque nas duas pontas e grava custo do subproduto:
 * o saldo dos ingredientes, o saldo do subproduto, o extrato e o custo das
 * fichas que usam esse subproduto mudam de uma vez.
 */
export function useInvalidateProduction() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: productionQueryKey });
    queryClient.invalidateQueries({ queryKey: suppliesQueryKey });
    queryClient.invalidateQueries({ queryKey: stockOverviewQueryKey });
    queryClient.invalidateQueries({ queryKey: stockMovementsQueryKey });
    queryClient.invalidateQueries({ queryKey: recipesQueryKey });
  }, [queryClient]);
}
