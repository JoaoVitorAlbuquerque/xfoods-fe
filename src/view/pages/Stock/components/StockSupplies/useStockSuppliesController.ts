import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Supply, StockStatus } from "../../../../../types/Supply";
import { suppliesService } from "../../../../../app/services/suppliesService";
import { useDebouncedValue } from "../../../../../app/hooks/useDebouncedValue";
import { useInvalidateStock, useSupplies } from "../../../../../app/hooks/useStockQueries";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { StockOperation } from "../StockOperationModal/useStockOperationModalController";

export function useStockSuppliesController() {
  const [search, setSearch] = useState('');
  const [supplyCategoryId, setSupplyCategoryId] = useState('');
  const [active, setActive] = useState<'true' | 'false' | ''>('true');
  const [stockStatus, setStockStatus] = useState<StockStatus | ''>('');

  const [isNewSupplyModalVisible, setIsNewSupplyModalVisible] = useState(false);
  const [supplyBeingEdited, setSupplyBeingEdited] = useState<Supply | null>(null);
  const [supplyBeingDeactivated, setSupplyBeingDeactivated] = useState<Supply | null>(null);
  const [operation, setOperation] = useState<StockOperation | null>(null);
  const [operationSupplyId, setOperationSupplyId] = useState<string | undefined>();

  const debouncedSearch = useDebouncedValue(search);

  const { supplies, isFetching, isError, refetch } = useSupplies({
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    ...(supplyCategoryId ? { supplyCategoryId } : {}),
    ...(active ? { active } : {}),
    ...(stockStatus ? { stockStatus } : {}),
  });

  const handleOpenOperation = useCallback((nextOperation: StockOperation, supplyId?: string) => {
    setOperation(nextOperation);
    setOperationSupplyId(supplyId);
  }, []);

  const handleCloseOperation = useCallback(() => {
    setOperation(null);
    setOperationSupplyId(undefined);
  }, []);

  const invalidateStock = useInvalidateStock();

  const { isPending: isTogglingActive, mutateAsync } = useMutation({
    mutationFn: suppliesService.setActive,
  });

  // Reativar não muda saldo nem histórico, então vai direto; desativar passa
  // pelo modal de confirmação.
  const handleReactivateSupply = useCallback(async (supply: Supply) => {
    try {
      await mutateAsync({ id: supply.id, active: true });

      invalidateStock();
      toast.success(`${supply.name} reativado!`);
    } catch (error) {
      toastApiError(error, 'Erro ao reativar o insumo!');
    }
  }, [mutateAsync, invalidateStock]);

  return {
    supplies,
    isFetching,
    isError,
    refetch,
    search,
    setSearch,
    supplyCategoryId,
    setSupplyCategoryId,
    active,
    setActive,
    stockStatus,
    setStockStatus,
    isNewSupplyModalVisible,
    setIsNewSupplyModalVisible,
    supplyBeingEdited,
    setSupplyBeingEdited,
    supplyBeingDeactivated,
    setSupplyBeingDeactivated,
    operation,
    operationSupplyId,
    handleOpenOperation,
    handleCloseOperation,
    isTogglingActive,
    handleReactivateSupply,
  };
}
