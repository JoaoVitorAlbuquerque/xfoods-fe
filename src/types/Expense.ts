export type ExpenseType = 'FIXED' | 'VARIABLE';

export type ExpenseRecurrence = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

/** Só INDIRECT entra no rateio: somar um custo direto o contaria duas vezes. */
export type CostNature = 'DIRECT' | 'INDIRECT';

export const expenseTypes: ExpenseType[] = ['FIXED', 'VARIABLE'];

export const expenseTypeLabels: Record<ExpenseType, string> = {
  FIXED: 'Fixa',
  VARIABLE: 'Variável',
};

export const expenseTypeHints: Record<ExpenseType, string> = {
  FIXED: 'Não varia com o volume vendido: aluguel, contador, internet.',
  VARIABLE: 'Acompanha o movimento: comissão, taxa de cartão, embalagem.',
};

export const expenseRecurrences: ExpenseRecurrence[] = [
  'ONCE',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY',
];

export const expenseRecurrenceLabels: Record<ExpenseRecurrence, string> = {
  ONCE: 'Uma vez',
  DAILY: 'Diária',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
};

export const costNatureLabels: Record<CostNature, string> = {
  DIRECT: 'Direto',
  INDIRECT: 'Indireto',
};

export interface ExpenseCategory {
  id: string;
  userId: string;
  name: string;
  nature: CostNature;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { expenses: number };
}

export interface Expense {
  id: string;
  userId: string;
  expenseCategoryId: string | null;
  description: string;
  type: ExpenseType;
  recurrence: ExpenseRecurrence;
  /** Valor de UMA ocorrência, não o total do ano. */
  amount: number;
  /** Competência, não cadastro: data pura em UTC. */
  startDate: string;
  endDate: string | null;
  active: boolean;
  deactivatedAt: string | null;
  includeInAllocation: boolean;
  notes: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string; nature: CostNature } | null;
}

export interface ExpenseOccurrence {
  competenceDate: string;
  amount: number;
}

export interface ExpenseDetail extends Expense {
  currentPeriod: {
    from: string;
    to: string;
    occurrences: ExpenseOccurrence[];
  };
}

/** `PUT /expenses/:id` avisa quando o valor alterado reescreveu meses passados. */
export interface UpdatedExpense extends Expense {
  warnings: string[];
}

export interface ExpenseOccurrenceItem {
  expenseId: string;
  description: string;
  category: { id: string; name: string; nature: CostNature } | null;
  type: ExpenseType;
  recurrence: ExpenseRecurrence;
  competenceDate: string;
  amount: number;
}

export interface ExpenseOccurrencesResponse {
  period: { from: string; to: string };
  items: ExpenseOccurrenceItem[];
  summary: {
    occurrences: number;
    expenses: number;
    total: number;
  };
}

export interface ExpensesSummary {
  period: { from: string; to: string };
  total: number;
  byCategory: {
    categoryId: string | null;
    name: string;
    nature: CostNature;
    total: number;
  }[];
  byType: Partial<Record<ExpenseType, number>>;
  byRecurrence: Partial<Record<ExpenseRecurrence, number>>;
  expenses: number;
}

export interface SeedExpenseCategoriesResult {
  created: number;
  skipped: number;
  items: ExpenseCategory[];
}
