import {
  Expense,
  ExpenseRecurrence,
  ExpenseType,
  UpdatedExpense,
} from "../../../types/Expense";
import { httpClient } from "../httpClient";

export interface CreateExpenseParams {
  description: string;
  expenseCategoryId?: string;
  type?: ExpenseType;
  recurrence?: ExpenseRecurrence;
  /** Valor de UMA ocorrência, não o total do período. */
  amount: string;
  /** Competência: a partir de quando a despesa pesa no custo. */
  startDate: string;
  endDate?: string;
  includeInAllocation?: boolean;
  notes?: string;
}

export interface UpdateExpenseParams
  extends Partial<Omit<CreateExpenseParams, 'expenseCategoryId' | 'endDate'>> {
  id: string;
  /** `null` desvincula a categoria; string vazia seria recusada pelo IsUUID. */
  expenseCategoryId?: string | null;
  /** `null` remove a data final e a despesa volta a valer indefinidamente. */
  endDate?: string | null;
}

export async function create(params: CreateExpenseParams) {
  const { data } = await httpClient.post<Expense>('/expenses', params);

  return data;
}

/**
 * Alterar o valor reescreve o custo de todas as competências passadas — a
 * resposta traz `warnings[]` quando isso acontece.
 */
export async function update({ id, ...params }: UpdateExpenseParams) {
  const { data } = await httpClient.put<UpdatedExpense>(`/expenses/${id}`, params);

  return data;
}

/** Volta a valer a partir de agora. */
export async function activate(expenseId: string) {
  const { data } = await httpClient.patch<Expense>(`/expenses/${expenseId}/activate`);

  return data;
}

/** Para de repetir daqui pra frente; as competências passadas continuam. */
export async function deactivate(expenseId: string) {
  const { data } = await httpClient.patch<Expense>(`/expenses/${expenseId}/deactivate`);

  return data;
}

/** Exclusão lógica: os relatórios de competência antiga continuam corretos. */
export async function remove(expenseId: string) {
  const { data } = await httpClient.delete(`/expenses/${expenseId}`);

  return data;
}
