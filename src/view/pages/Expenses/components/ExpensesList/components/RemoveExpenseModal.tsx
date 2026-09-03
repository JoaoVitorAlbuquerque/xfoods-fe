import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Expense } from "../../../../../../types/Expense";
import { expensesService } from "../../../../../../app/services/expensesService";
import { useInvalidateExpenses } from "../../../../../../app/hooks/useExpenseQueries";
import { formatCurrency } from "../../../../../../app/utils/formatCurrency";
import { formatCompetenceDate } from "../../../../../../app/utils/formatCompetenceDate";
import { toastApiError } from "../../../../../../app/utils/toastApiError";
import { Button } from "../../../../../components/Button";
import { Modal } from "../../../../../components/Modal";

interface RemoveExpenseModalProps {
  visible: boolean;
  onClose(): void;
  expense: Expense;
}

export function RemoveExpenseModal({ visible, onClose, expense }: RemoveExpenseModalProps) {
  const invalidateExpenses = useInvalidateExpenses();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: expensesService.remove,
  });

  const handleRemove = useCallback(async () => {
    try {
      await mutateAsync(expense.id);

      invalidateExpenses();
      toast.success(`${expense.description} foi excluída.`);
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao excluir a despesa!');
    }
  }, [expense, mutateAsync, invalidateExpenses, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal visible onClose={onClose} title="Excluir Despesa">
        <div className="flex flex-col items-center gap-6 sm:max-w-[420px]">
          <span className="text-center font-medium text-gray-400">
            Tem certeza que deseja excluir esta despesa?
          </span>

          <div className="text-center text-sm text-gray-500">
            <strong className="block">{expense.description}</strong>

            <span>
              {formatCurrency(expense.amount)} · desde{' '}
              {formatCompetenceDate(expense.startDate)}
            </span>
          </div>

          <span className="text-center text-xs text-gray-400">
            A exclusão é lógica: a despesa some das telas, mas os relatórios das
            competências em que ela valeu continuam reproduzíveis. Se a intenção
            é só parar de repetir daqui pra frente, use "parar de repetir" — o
            passado continua contando de qualquer forma.
          </span>
        </div>

        <footer className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="py-3 font-bold text-red-800"
          >
            Manter Despesa
          </button>

          <Button onClick={handleRemove} isLoading={isPending} className="w-full sm:w-auto">
            Excluir Despesa
          </Button>
        </footer>
      </Modal>
    </div>
  );
}
