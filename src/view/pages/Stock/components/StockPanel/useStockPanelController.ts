import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { stockService } from "../../../../../app/services/stockService";
import { stockOverviewQueryKey } from "../../../../../app/hooks/useStockQueries";
import { StockOperation } from "../StockOperationModal/useStockOperationModalController";

export function useStockPanelController() {
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [operation, setOperation] = useState<StockOperation | null>(null);
  const [operationSupplyId, setOperationSupplyId] = useState<string | undefined>();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...stockOverviewQueryKey, { onlyAlerts }],
    queryFn: () => (onlyAlerts ? stockService.getAlerts() : stockService.getOverview()),
  });

  const handleOpenOperation = useCallback((nextOperation: StockOperation, supplyId?: string) => {
    setOperation(nextOperation);
    setOperationSupplyId(supplyId);
  }, []);

  const handleCloseOperation = useCallback(() => {
    setOperation(null);
    setOperationSupplyId(undefined);
  }, []);

  return {
    items: data?.items ?? [],
    summary: data?.summary,
    isFetching,
    isError,
    refetch,
    onlyAlerts,
    setOnlyAlerts,
    operation,
    operationSupplyId,
    handleOpenOperation,
    handleCloseOperation,
  };
}
