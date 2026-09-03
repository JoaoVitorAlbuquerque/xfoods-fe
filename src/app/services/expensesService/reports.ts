import {
  ExpenseDetail,
  ExpenseOccurrencesResponse,
  ExpensesSummary,
} from "../../../types/Expense";
import { httpClient } from "../httpClient";

/** Ausentes, `from` e `to` fazem a API usar o mês corrente. */
export interface ExpensePeriodParams {
  from?: string;
  to?: string;
}

export async function getById(expenseId: string) {
  const { data } = await httpClient.get<ExpenseDetail>(`/expenses/${expenseId}`);

  return data;
}

/**
 * Extrato de competências: cada repetição da regra vira uma linha datada. É o
 * que prova que o aluguel de março está sendo contado sem ninguém lançar nada.
 */
export async function getOccurrences(params?: ExpensePeriodParams) {
  const { data } = await httpClient.get<ExpenseOccurrencesResponse>(
    '/expenses/occurrences',
    { params },
  );

  return data;
}

export async function getSummary(params?: ExpensePeriodParams) {
  const { data } = await httpClient.get<ExpensesSummary>('/expenses/summary', {
    params,
  });

  return data;
}
