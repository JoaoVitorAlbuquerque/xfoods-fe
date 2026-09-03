import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { suppliesService } from "../services/suppliesService";
import { GetAllSuppliesParams } from "../services/suppliesService/getAll";
import { supplyCategoriesService } from "../services/supplyCategoriesService";
import { stockService } from "../services/stockService";

export const suppliesQueryKey = ['supplies'];
export const supplyCategoriesQueryKey = ['supply-categories'];
export const stockOverviewQueryKey = ['stock-overview'];
export const stockMovementsQueryKey = ['stock-movements'];
export const stockCountsQueryKey = ['stock-counts'];
export const stockSettingsQueryKey = ['stock-settings'];

export function useSupplies(filters: GetAllSuppliesParams = {}) {
  const { data = [], isFetching, isError, refetch } = useQuery({
    queryKey: [...suppliesQueryKey, filters],
    queryFn: () => suppliesService.getAll(filters),
  });

  return { supplies: data, isFetching, isError, refetch };
}

export function useSupplyCategories() {
  const { data = [], isFetching, isError, refetch } = useQuery({
    queryKey: supplyCategoriesQueryKey,
    queryFn: supplyCategoriesService.getAll,
    staleTime: 1000 * 60 * 5,
  });

  return {
    categories: data,
    /** Só as que ainda classificam insumo novo — a listagem devolve as inativas também. */
    activeCategories: data.filter(category => category.active),
    isFetching,
    isError,
    refetch,
  };
}

export function useStockSettings() {
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: stockSettingsQueryKey,
    queryFn: stockService.getSettings,
    staleTime: 1000 * 60 * 5,
  });

  return { settings: data, isFetching, isError, refetch };
}

/**
 * Toda alteração de saldo gera movimentação e muda, ao mesmo tempo, a posição
 * de estoque, a lista de insumos e o extrato. Invalidar os três juntos evita
 * a tela mostrar um saldo e o extrato outro.
 */
export function useInvalidateStock() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: suppliesQueryKey });
    queryClient.invalidateQueries({ queryKey: stockOverviewQueryKey });
    queryClient.invalidateQueries({ queryKey: stockMovementsQueryKey });
    queryClient.invalidateQueries({ queryKey: stockCountsQueryKey });
  }, [queryClient]);
}
