import {
  CostNature,
  ExpenseCategory,
  SeedExpenseCategoriesResult,
} from "../../../types/Expense";
import { httpClient } from "../httpClient";

export interface CreateExpenseCategoryParams {
  name: string;
  nature?: CostNature;
}

export interface UpdateExpenseCategoryParams {
  id: string;
  name?: string;
  nature?: CostNature;
  active?: boolean;
}

async function getAll() {
  const { data } = await httpClient.get<ExpenseCategory[]>('/expense-categories');

  return data;
}

async function create(params: CreateExpenseCategoryParams) {
  const { data } = await httpClient.post<ExpenseCategory>('/expense-categories', params);

  return data;
}

async function update({ id, ...params }: UpdateExpenseCategoryParams) {
  const { data } = await httpClient.put<ExpenseCategory>(
    `/expense-categories/${id}`,
    params,
  );

  return data;
}

/** Cria as 12 categorias sugeridas que faltarem. Idempotente e aditivo. */
async function seed() {
  const { data } = await httpClient.post<SeedExpenseCategoriesResult>(
    '/expense-categories/seed',
  );

  return data;
}

export const expenseCategoriesService = {
  getAll,
  create,
  update,
  seed,
};
