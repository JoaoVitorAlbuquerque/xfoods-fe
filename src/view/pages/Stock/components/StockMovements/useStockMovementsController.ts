import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { stockService } from "../../../../../app/services/stockService";
import { stockMovementsQueryKey } from "../../../../../app/hooks/useStockQueries";
import { StockMovementType } from "../../../../../types/StockMovement";

const PAGE_SIZE = 20;

export function useStockMovementsController() {
  const [supplyId, setSupplyId] = useState('');
  const [type, setType] = useState<StockMovementType | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);

  const filters = useMemo(() => ({
    ...(supplyId ? { supplyId } : {}),
    ...(type ? { type } : {}),
    // O input devolve só a data; o intervalo cobre o dia inteiro para que
    // escolher "hoje" não devolva uma lista vazia por causa da meia-noite.
    ...(from ? { from: `${from}T00:00:00.000Z` } : {}),
    ...(to ? { to: `${to}T23:59:59.999Z` } : {}),
  }), [supplyId, type, from, to]);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...stockMovementsQueryKey, filters],
    queryFn: () => stockService.getMovements(filters),
  });

  useEffect(() => {
    setPage(0);
  }, [filters]);

  const items = data?.items ?? [];
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return {
    items,
    pageItems,
    page,
    pageCount,
    setPage,
    /** Total no banco; a API devolve no máximo os 50 mais recentes por consulta. */
    total: data?.total ?? 0,
    isFetching,
    isError,
    refetch,
    supplyId,
    setSupplyId,
    type,
    setType,
    from,
    setFrom,
    to,
    setTo,
  };
}
