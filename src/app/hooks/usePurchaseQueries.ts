import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { suppliersService } from "../services/suppliersService";
import { GetAllSuppliersParams } from "../services/suppliersService/getAll";
import { useInvalidateStock } from "./useStockQueries";

export const suppliersQueryKey = ['suppliers'];
export const purchasesQueryKey = ['purchases'];
export const supplyCostsQueryKey = ['supply-costs'];

export function useSuppliers(filters: GetAllSuppliersParams = {}) {
  const { data = [], isFetching, isError, refetch } = useQuery({
    queryKey: [...suppliersQueryKey, filters],
    queryFn: () => suppliersService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  });

  return {
    suppliers: data,
    /** A listagem devolve os inativos também; compra nova só oferece os ativos. */
    activeSuppliers: data.filter(supplier => supplier.active),
    isFetching,
    isError,
    refetch,
  };
}

/**
 * Confirmar uma compra move estoque, reescreve o custo atual do insumo e
 * acrescenta uma linha ao histórico. Invalidar as três frentes juntas evita
 * a tela mostrar um custo e o relatório de variação outro.
 */
export function useInvalidatePurchases() {
  const queryClient = useQueryClient();
  const invalidateStock = useInvalidateStock();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: purchasesQueryKey });
    queryClient.invalidateQueries({ queryKey: supplyCostsQueryKey });
    invalidateStock();
  }, [queryClient, invalidateStock]);
}
