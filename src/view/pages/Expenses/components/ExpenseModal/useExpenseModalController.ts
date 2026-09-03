import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { expensesService } from '../../../../../app/services/expensesService';
import { useExpenseCategories, useInvalidateExpenses } from '../../../../../app/hooks/useExpenseQueries';
import { toastApiError } from '../../../../../app/utils/toastApiError';
import { toCompetenceInputValue } from '../../../../../app/utils/formatCompetenceDate';
import { Expense, ExpenseRecurrence, ExpenseType } from '../../../../../types/Expense';

const schema = z.object({
  description: z
    .string()
    .min(2, 'Descrição precisa de pelo menos 2 caracteres')
    .max(160, 'Descrição deve ter no máximo 160 caracteres'),
  expenseCategoryId: z.string().optional(),
  type: z.enum(['FIXED', 'VARIABLE']),
  recurrence: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  amount: z.string().min(1, 'Informe o valor'),
  startDate: z.string().min(1, 'Informe a data inicial da competência'),
  endDate: z.string().optional(),
  includeInAllocation: z.boolean(),
  notes: z.string().max(1000, 'Observação deve ter no máximo 1000 caracteres').optional(),
}).superRefine((data, ctx) => {
  if (Number(data.amount) <= 0) {
    ctx.addIssue({
      path: ['amount'],
      code: z.ZodIssueCode.custom,
      message: 'Valor deve ser maior que zero',
    });
  }

  if (data.endDate && data.endDate < data.startDate) {
    ctx.addIssue({
      path: ['endDate'],
      code: z.ZodIssueCode.custom,
      message: 'A data final não pode ser anterior à inicial',
    });
  }
});

type FormData = z.infer<typeof schema>;

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function useExpenseModalController(expense: Expense | undefined, onClose: () => void) {
  /** Avisos do PUT quando o valor alterado reescreveu meses já fechados. */
  const [warnings, setWarnings] = useState<string[] | null>(null);

  const {
    control,
    register,
    watch,
    handleSubmit: hookFormSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: expense?.description ?? '',
      expenseCategoryId: expense?.expenseCategoryId ?? '',
      type: (expense?.type ?? 'FIXED') as ExpenseType,
      recurrence: (expense?.recurrence ?? 'MONTHLY') as ExpenseRecurrence,
      amount: expense ? String(expense.amount) : '',
      startDate: toCompetenceInputValue(expense?.startDate) || today(),
      endDate: toCompetenceInputValue(expense?.endDate),
      includeInAllocation: expense?.includeInAllocation ?? true,
      notes: expense?.notes ?? '',
    },
  });

  const { activeCategories } = useExpenseCategories();
  const invalidateExpenses = useInvalidateExpenses();

  const type = watch('type');
  const amount = watch('amount');
  const hasAmountChanged = Boolean(expense) && String(expense?.amount) !== amount;

  const { isPending, mutateAsync } = useMutation({
    // Só a edição devolve `warnings`; normalizar o retorno evita destrinchar
    // uma união de tipos só para ler um campo.
    mutationFn: async (data: FormData): Promise<{ warnings: string[] }> => {
      const payload = {
        description: data.description.trim(),
        type: data.type,
        recurrence: data.recurrence,
        amount: data.amount,
        startDate: data.startDate,
        includeInAllocation: data.includeInAllocation,
        ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
      };

      if (expense) {
        const updated = await expensesService.update({
          id: expense.id,
          ...payload,
          // `null` desvincula; string vazia seria recusada pelo IsUUID.
          expenseCategoryId: data.expenseCategoryId || null,
          endDate: data.endDate || null,
        });

        return { warnings: updated.warnings ?? [] };
      }

      await expensesService.create({
        ...payload,
        ...(data.expenseCategoryId ? { expenseCategoryId: data.expenseCategoryId } : {}),
        ...(data.endDate ? { endDate: data.endDate } : {}),
      });

      return { warnings: [] };
    },
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      const saved = await mutateAsync(data);

      invalidateExpenses();

      // O aviso de reescrita do passado precisa aparecer antes de o modal
      // sumir — é ele que explica por que o custo de janeiro mudou.
      if (saved.warnings.length > 0) {
        setWarnings(saved.warnings);
        return;
      }

      toast.success(expense ? 'Despesa atualizada!' : 'Despesa cadastrada!');
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao salvar a despesa!');
    }
  });

  function handleCloseWarnings() {
    setWarnings(null);
    onClose();
  }

  return {
    control,
    register,
    errors,
    handleSubmit,
    isPending,
    categories: activeCategories,
    type,
    hasAmountChanged,
    warnings,
    handleCloseWarnings,
  };
}
