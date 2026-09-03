import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { recipesService } from "../services/recipesService";
import { GetAllRecipesParams } from "../services/recipesService/getAll";
import { productsService } from "../services/productsService";

export const recipesQueryKey = ['recipes'];
export const productOptionsQueryKey = ['product-options'];

export function useRecipes(filters: GetAllRecipesParams = {}) {
  const { data = [], isFetching, isError, refetch } = useQuery({
    queryKey: [...recipesQueryKey, filters],
    queryFn: () => recipesService.getAll(filters),
  });

  return { recipes: data, isFetching, isError, refetch };
}

/** Sub-receitas ativas, para o seletor de item da ficha. */
export function useSubRecipes() {
  const { data = [], isFetching } = useQuery({
    queryKey: [...recipesQueryKey, { type: 'SUB', active: 'true' }],
    queryFn: () => recipesService.getAll({ type: 'SUB', active: 'true' }),
    staleTime: 1000 * 60 * 5,
  });

  return { subRecipes: data, isFetching };
}

export function useProductOptions() {
  const { data = [], isFetching } = useQuery({
    queryKey: productOptionsQueryKey,
    queryFn: productsService.getAllOptions,
    staleTime: 1000 * 60 * 5,
  });

  return { products: data, isFetching };
}

/**
 * Ativar ou editar uma ficha muda o custo direto do prato e a cobertura de
 * fichas ao mesmo tempo. Invalidar tudo junto evita a lista dizer que o prato
 * tem ficha enquanto a cobertura ainda o mostra sem.
 */
export function useInvalidateRecipes() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: recipesQueryKey });
  }, [queryClient]);
}
