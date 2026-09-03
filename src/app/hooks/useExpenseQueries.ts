import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { expenseCategoriesService } from "../services/expenseCategoriesService";

export const expensesQueryKey = ['expenses'];
export const expenseCategoriesQueryKey = ['expense-categories'];
export const costAllocationQueryKey = ['cost-allocation'];

export function useExpenseCategories() {
  const { data = [], isFetching, isError, refetch } = useQuery({
    queryKey: expenseCategoriesQueryKey,
    queryFn: expenseCategoriesService.getAll,
    staleTime: 1000 * 60 * 5,
  });

  return {
    categories: data,
    activeCategories: data.filter(category => category.active),
    isFetching,
    isError,
    refetch,
  };
}

/**
 * Mexer numa despesa muda o extrato de competências e o rateio ao mesmo tempo:
 * o custo por unidade sai da soma das despesas do período.
 */
export function useInvalidateExpenses() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: expensesQueryKey });
    queryClient.invalidateQueries({ queryKey: costAllocationQueryKey });
  }, [queryClient]);
}
