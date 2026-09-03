import {
  ExpenseRecurrence,
  ExpenseType,
  expenseRecurrenceLabels,
  expenseRecurrences,
  expenseTypeLabels,
  expenseTypes,
} from "../../../../../types/Expense";
import { useExpenseCategories } from "../../../../../app/hooks/useExpenseQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatCompetenceDate } from "../../../../../app/utils/formatCompetenceDate";
import { ActionButton } from "../../../../components/ActionButton";
import { ContentHeader } from "../../../../components/ContentHeader";
import { Input } from "../../../../components/Input";
import { ListFeedback } from "../../../../components/ListFeedback";
import { PeriodFilter } from "../../../../components/PeriodFilter";
import { Select } from "../../../../components/Select";
import { TableComponents } from "../../../../components/TableElements";
import { ExpenseModal } from "../ExpenseModal";
import { RemoveExpenseModal } from "./components/RemoveExpenseModal";
import { useExpensesListController } from "./useExpensesListController";

import editIcon from '../../../../components/icons/edit-icon.svg';
import trashIcon from '../../../../components/icons/trash-icon.svg';

export function ExpensesList() {
  const {
    expenses,
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
  } = useExpensesListController();

  const { activeCategories } = useExpenseCategories();

  return (
    <>
      <ExpenseModal visible={isCreating} onClose={() => setIsCreating(false)} />

      {expenseBeingEdited && (
        <ExpenseModal
          visible
          expense={expenseBeingEdited}
          onClose={() => setExpenseBeingEdited(null)}
        />
      )}

      {expenseBeingRemoved && (
        <RemoveExpenseModal
          visible
          expense={expenseBeingRemoved}
          onClose={() => setExpenseBeingRemoved(null)}
        />
      )}

      <ContentHeader title="Despesas" quantity={expenses.length}>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="pt-1 text-sm font-bold text-red-600"
        >
          Nova Despesa
        </button>
      </ContentHeader>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          type="text"
          name="search"
          placeholder="Buscar despesa"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />

        <Select
          value={expenseCategoryId}
          onChange={event => setExpenseCategoryId(event.target.value)}
        >
          <option value="">Todas as categorias</option>

          {activeCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <Select value={type} onChange={event => setType(event.target.value as ExpenseType | '')}>
          <option value="">Fixas e variáveis</option>

          {expenseTypes.map(option => (
            <option key={option} value={option}>
              {expenseTypeLabels[option]}
            </option>
          ))}
        </Select>

        <Select
          value={recurrence}
          onChange={event => setRecurrence(event.target.value as ExpenseRecurrence | '')}
        >
          <option value="">Todas as periodicidades</option>

          {expenseRecurrences.map(option => (
            <option key={option} value={option}>
              {expenseRecurrenceLabels[option]}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PeriodFilter
          from={from}
          to={to}
          onChangeFrom={setFrom}
          onChangeTo={setTo}
          hint="Filtra por vigência: traz quem vigorava na janela, não quem foi cadastrado nela."
        />

        <div className="sm:w-56">
          <Select
            value={active}
            onChange={event => setActive(event.target.value as 'true' | 'false' | '')}
          >
            <option value="">Ativas e encerradas</option>
            <option value="true">Somente ativas</option>
            <option value="false">Somente encerradas</option>
          </Select>
        </div>
      </div>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={expenses.length === 0}
        emptyMessage="Nenhuma despesa encontrada com esses filtros."
        errorMessage="Não foi possível carregar as despesas."
        onRetry={refetch}
      >
        <div className="space-y-3 md:hidden">
          {expenses.map(expense => (
            <div key={expense.id} className="rounded-lg border border-gray-600 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-gray-500">
                    {expense.description}
                  </strong>

                  <span className="text-xs text-gray-400">
                    {expense.category?.name ?? 'Sem categoria'} ·{' '}
                    {expenseTypeLabels[expense.type]} ·{' '}
                    {expenseRecurrenceLabels[expense.recurrence]}
                  </span>
                </div>

                <strong className="whitespace-nowrap text-gray-500">
                  {formatCurrency(expense.amount)}
                </strong>
              </div>

              <span className="mt-2 block text-xs text-gray-400">
                Competência: {formatCompetenceDate(expense.startDate)}
                {expense.endDate ? ` até ${formatCompetenceDate(expense.endDate)}` : ' em diante'}
                {!expense.active && ' · não repete mais'}
                {!expense.includeInAllocation && ' · fora do rateio'}
              </span>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isTogglingActive}
                  onClick={() => handleToggleActive(expense)}
                  className={cn(
                    'rounded-full border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-500',
                    isTogglingActive && 'text-gray-300',
                  )}
                >
                  {expense.active ? 'Parar de repetir' : 'Voltar a valer'}
                </button>

                <ActionButton title="Editar despesa" onClick={() => setExpenseBeingEdited(expense)}>
                  <img src={editIcon} alt="Editar" />
                </ActionButton>

                <ActionButton title="Excluir despesa" onClick={() => setExpenseBeingRemoved(expense)}>
                  <img src={trashIcon} alt="Excluir" />
                </ActionButton>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <TableComponents.Table>
            <thead>
              <tr className="bg-gray-600/20">
                <TableComponents.TableHeader>Descrição</TableComponents.TableHeader>
                <TableComponents.TableHeader>Categoria</TableComponents.TableHeader>
                <TableComponents.TableHeader>Tipo</TableComponents.TableHeader>
                <TableComponents.TableHeader>Periodicidade</TableComponents.TableHeader>
                <TableComponents.TableHeader>Valor</TableComponents.TableHeader>
                <TableComponents.TableHeader>Vigência</TableComponents.TableHeader>
                <TableComponents.TableHeader>Ações</TableComponents.TableHeader>
              </tr>
            </thead>

            <tbody>
              {expenses.map(expense => (
                <TableComponents.TableRow key={expense.id}>
                  <TableComponents.TableCell>
                    {expense.description}

                    {!expense.includeInAllocation && (
                      <span
                        className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-400"
                        title="Esta despesa não entra no custo de cada prato."
                      >
                        fora do rateio
                      </span>
                    )}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {expense.category?.name ?? '—'}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {expenseTypeLabels[expense.type]}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {expenseRecurrenceLabels[expense.recurrence]}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap font-medium">
                    {formatCurrency(expense.amount)}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatCompetenceDate(expense.startDate)}
                    {expense.endDate ? ` a ${formatCompetenceDate(expense.endDate)}` : ' em diante'}

                    {!expense.active && (
                      <span className="block text-xs text-gray-400">não repete mais</span>
                    )}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isTogglingActive}
                        onClick={() => handleToggleActive(expense)}
                        className={cn(
                          'whitespace-nowrap rounded-full border border-gray-600 px-3 py-1 text-xs',
                          isTogglingActive && 'text-gray-300',
                        )}
                      >
                        {expense.active ? 'Parar de repetir' : 'Voltar a valer'}
                      </button>

                      <ActionButton
                        title="Editar despesa"
                        onClick={() => setExpenseBeingEdited(expense)}
                      >
                        <img src={editIcon} alt="Editar" />
                      </ActionButton>

                      <ActionButton
                        title="Excluir despesa"
                        onClick={() => setExpenseBeingRemoved(expense)}
                      >
                        <img src={trashIcon} alt="Excluir" />
                      </ActionButton>
                    </div>
                  </TableComponents.TableCell>
                </TableComponents.TableRow>
              ))}
            </tbody>
          </TableComponents.Table>
        </div>
      </ListFeedback>
    </>
  );
}
