import { useCallback, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { stockCountsService } from '../../../../../../../app/services/stockCountsService';
import { useInvalidateStock, useSupplies } from '../../../../../../../app/hooks/useStockQueries';
import { useDebouncedValue } from '../../../../../../../app/hooks/useDebouncedValue';
import { toastApiError } from '../../../../../../../app/utils/toastApiError';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function useNewStockCountModalController(onClose: () => void) {
  const [search, setSearch] = useState('');
  const [note, setNote] = useState('');
  const [countedAt, setCountedAt] = useState(today);
  const [countedBySupply, setCountedBySupply] = useState<Record<string, string>>({});

  const debouncedSearch = useDebouncedValue(search);

  const { supplies, isFetching, isError, refetch } = useSupplies({
    active: 'true',
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  });

  const countedItems = useMemo(
    () => Object.entries(countedBySupply).filter(([, quantity]) => quantity !== ''),
    [countedBySupply],
  );

  const handleCountedChange = useCallback((supplyId: string, quantity: string) => {
    setCountedBySupply(previous => ({ ...previous, [supplyId]: quantity }));
  }, []);

  const invalidateStock = useInvalidateStock();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: stockCountsService.create,
  });

  const handleSubmit = useCallback(async () => {
    if (countedItems.length === 0) {
      toast.error('Informe a contagem de pelo menos um insumo.');
      return;
    }

    try {
      await mutateAsync({
        ...(note.trim() ? { note: note.trim() } : {}),
        ...(countedAt ? { countedAt } : {}),
        // A quantidade vai na unidade base do insumo: é a unidade mostrada ao
        // lado de cada campo, então `unit` não precisa ser enviado.
        items: countedItems.map(([supplyId, countedQuantity]) => ({
          supplyId,
          countedQuantity,
        })),
      });

      invalidateStock();
      toast.success('Contagem registrada. Nada mudou no estoque até ser aplicada.');
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao registrar a contagem!');
    }
  }, [countedItems, note, countedAt, mutateAsync, invalidateStock, onClose]);

  return {
    supplies,
    isFetching,
    isError,
    refetch,
    search,
    setSearch,
    note,
    setNote,
    countedAt,
    setCountedAt,
    countedBySupply,
    handleCountedChange,
    countedCount: countedItems.length,
    handleSubmit,
    isPending,
  };
}
