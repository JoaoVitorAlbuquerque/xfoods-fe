import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { expensesService } from "../../../../../app/services/expensesService";
import { expensesQueryKey, useInvalidateExpenses } from "../../../../../app/hooks/useExpenseQueries";
import { useDebouncedValue } from "../../../../../app/hooks/useDebouncedValue";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { Expense, ExpenseRecurrence, ExpenseType } from "../../../../../types/Expense";

export function useExpensesListController() {
  const [search, setSearch] = useState('');
  const [expenseCategoryId, setExpenseCategoryId] = useState('');
  const [type, setType] = useState<ExpenseType | ''>('');
  const [recurrence, setRecurrence] = useState<ExpenseRecurrence | ''>('');
  const [active, setActive] = useState<'true' | 'false' | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [expenseBeingEdited, setExpenseBeingEdited] = useState<Expense | null>(null);
  const [expenseBeingRemoved, setExpenseBeingRemoved] = useState<Expense | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  const filters = useMemo(() => ({
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    ...(expenseCategoryId ? { expenseCategoryId } : {}),
    ...(type ? { type } : {}),
    ...(recurrence ? { recurrence } : {}),
    ...(active ? { active } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }), [debouncedSearch, expenseCategoryId, type, recurrence, active, from, to]);

  const { data = [], isFetching, isError, refetch } = useQuery({
    queryKey: [...expensesQueryKey, 'list', filters],
    queryFn: () => expensesService.getAll(filters),
  });

  const invalidateExpenses = useInvalidateExpenses();

  const { isPending: isTogglingActive, mutateAsync } = useMutation({
    mutationFn: async ({ id, active: nextActive }: { id: string; active: boolean }) => (
      nextActive ? expensesService.activate(id) : expensesService.deactivate(id)
    ),
  });

  const handleToggleActive = useCallback(async (expense: Expense) => {
    try {
      await mutateAsync({ id: expense.id, active: !expense.active });

      invalidateExpenses();
      toast.success(
        expense.active
          ? `${expense.description} parou de repetir. As competências passadas continuam valendo.`
          : `${expense.description} voltou a valer a partir de agora.`,
      );
    } catch (error) {
      toastApiError(error, 'Erro ao alterar a despesa!');
    }
  }, [mutateAsync, invalidateExpenses]);

  return {
    expenses: data,
    isFetching,
    isError,
    refetch,
    search,
    setSearch,
    expenseCategoryId,
    setExpenseCategoryId,
    type,
    setType,
    recurrence,
    setRecurrence,
    active,
    setActive,
    from,
    setFrom,
    to,
    setTo,
    isCreating,
    setIsCreating,
    expenseBeingEdited,
    setExpenseBeingEdited,
    expenseBeingRemoved,
    setExpenseBeingRemoved,
    isTogglingActive,
    handleToggleActive,
  };
}
