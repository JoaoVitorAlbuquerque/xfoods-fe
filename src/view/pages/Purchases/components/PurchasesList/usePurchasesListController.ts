import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { purchasesService } from "../../../../../app/services/purchasesService";
import { purchasesQueryKey } from "../../../../../app/hooks/usePurchaseQueries";
import { Purchase, PurchaseStatus } from "../../../../../types/Purchase";
import { PurchaseAction } from "../PurchaseActionModal";

const PAGE_SIZE = 20;

export function usePurchasesListController() {
  const [status, setStatus] = useState<PurchaseStatus | ''>('');
  const [supplierId, setSupplierId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);

  const [purchaseInAction, setPurchaseInAction] = useState<Purchase | null>(null);
  const [action, setAction] = useState<PurchaseAction>('confirm');

  const filters = useMemo(() => ({
    ...(status ? { status } : {}),
    ...(supplierId ? { supplierId } : {}),
    ...(from ? { from: `${from}T00:00:00.000Z` } : {}),
    ...(to ? { to: `${to}T23:59:59.999Z` } : {}),
  }), [status, supplierId, from, to]);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...purchasesQueryKey, filters],
    queryFn: () => purchasesService.getAll(filters),
  });

  useEffect(() => {
    setPage(0);
  }, [filters]);

  const items = data?.items ?? [];
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  function handleOpenAction(purchase: Purchase, nextAction: PurchaseAction) {
    setPurchaseInAction(purchase);
    setAction(nextAction);
  }

  return {
    items,
    pageItems,
    page,
    pageCount,
    setPage,
    total: data?.total ?? 0,
    isFetching,
    isError,
    refetch,
    status,
    setStatus,
    supplierId,
    setSupplierId,
    from,
    setFrom,
    to,
    setTo,
    purchaseInAction,
    action,
    handleOpenAction,
    handleCloseAction: () => setPurchaseInAction(null),
  };
}
