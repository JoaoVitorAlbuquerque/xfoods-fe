import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { productionService } from "../../../../../app/services/productionService";
import {
  productionQueryKey,
  useProducibleRecipes,
} from "../../../../../app/hooks/useProductionQueries";
import { ProductionStatus } from "../../../../../types/Production";

export function useProductionOrdersListController() {
  const [status, setStatus] = useState<ProductionStatus | ''>('');
  const [recipeId, setRecipeId] = useState('');
  const [outputSupplyId, setOutputSupplyId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { recipes, compositionOnly } = useProducibleRecipes();

  const filters = {
    ...(status ? { status } : {}),
    ...(recipeId ? { recipeId } : {}),
    ...(outputSupplyId ? { outputSupplyId } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };

  const { data = [], isFetching, isError, refetch } = useQuery({
    queryKey: [...productionQueryKey, 'list', filters],
    queryFn: () => productionService.getAll(filters),
  });

  /** Os subprodutos que já apareceram em algum lote, para o filtro de insumo. */
  const outputSupplies = [...new Map(
    data.map(order => [order.outputSupply.id, order.outputSupply]),
  ).values()];

  return {
    orders: data,
    isFetching,
    isError,
    refetch,
    recipes,
    compositionOnly,
    outputSupplies,
    status,
    setStatus,
    recipeId,
    setRecipeId,
    outputSupplyId,
    setOutputSupplyId,
    from,
    setFrom,
    to,
    setTo,
  };
}
