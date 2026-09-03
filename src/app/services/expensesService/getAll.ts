import {
  CostNature,
  Expense,
  ExpenseRecurrence,
  ExpenseType,
} from "../../../types/Expense";
import { httpClient } from "../httpClient";

export interface GetAllExpensesParams {
  search?: string;
  expenseCategoryId?: string;
  type?: ExpenseType;
  recurrence?: ExpenseRecurrence;
  nature?: CostNature;
  active?: 'true' | 'false';
  /**
   * Filtro por COMPETÊNCIA, não por cadastro: traz quem vigorava na janela.
   * Uma despesa iniciada em janeiro e sem fim aparece num filtro de março.
   */
  from?: string;
  to?: string;
}

type ExpensesResponse = Array<Expense>;

export async function getAll(params?: GetAllExpensesParams) {
  const { data } = await httpClient.get<ExpensesResponse>('/expenses', { params });

  return data;
}
