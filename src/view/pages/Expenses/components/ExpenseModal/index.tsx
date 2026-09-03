import { Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import {
  Expense,
  expenseRecurrenceLabels,
  expenseRecurrences,
  expenseTypeHints,
  expenseTypeLabels,
  expenseTypes,
} from "../../../../../types/Expense";
import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { Modal } from "../../../../components/Modal";
import { NotesPanel } from "../../../../components/NotesPanel";
import { Select } from "../../../../components/Select";
import { useExpenseModalController } from "./useExpenseModalController";

interface ExpenseModalProps {
  visible: boolean;
  onClose(): void;
  /** Ausente cadastra; presente edita. */
  expense?: Expense;
}

export function ExpenseModal({ visible, onClose, expense }: ExpenseModalProps) {
  const {
    control,
    register,
    errors,
    handleSubmit,
    isPending,
    categories,
    type,
    hasAmountChanged,
    warnings,
    handleCloseWarnings,
  } = useExpenseModalController(expense, onClose);

  if (!visible) {
    return null;
  }

  if (warnings) {
    return (
      <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
        <Modal visible onClose={handleCloseWarnings} title="Despesa salva com avisos">
          <div className="space-y-4 sm:w-[440px]">
            <NotesPanel title="O que mudou além do esperado" notes={warnings} />

            <p className="text-xs text-gray-400">
              O caminho para um reajuste sem reescrever o passado é encerrar esta
              despesa com uma data final e cadastrar outra a partir da nova
              vigência — do mesmo jeito que o preço fica congelado no item de
              venda.
            </p>
          </div>

          <footer className="mt-8 flex justify-end">
            <Button onClick={handleCloseWarnings} className="w-full sm:w-auto">
              Entendi
            </Button>
          </footer>
        </Modal>
      </div>
    );
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal
        visible={visible}
        onClose={onClose}
        title={expense ? 'Editar Despesa' : 'Nova Despesa'}
      >
        <form onSubmit={handleSubmit} className="space-y-5 sm:w-[440px]">
          <div className="space-y-2">
            <span className="text-sm font-normal text-gray-500">Descrição</span>

            <Input
              type="text"
              placeholder="Ex: Aluguel do salão"
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-normal text-gray-500">Categoria (opcional)</span>

            <Select {...register('expenseCategoryId')}>
              <option value="">Sem categoria</option>

              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-normal text-gray-500">Tipo</span>

              <Select {...register('type')}>
                {expenseTypes.map(option => (
                  <option key={option} value={option}>
                    {expenseTypeLabels[option]}
                  </option>
                ))}
              </Select>

              <span className="block text-xs text-gray-400">
                {expenseTypeHints[type]}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-normal text-gray-500">Periodicidade</span>

              <Select {...register('recurrence')}>
                {expenseRecurrences.map(option => (
                  <option key={option} value={option}>
                    {expenseRecurrenceLabels[option]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-normal text-gray-500">
              Valor de uma ocorrência
            </span>

            <Controller
              control={control}
              name="amount"
              render={({ field: { value, onChange } }) => (
                <NumericFormat
                  value={value ?? ''}
                  onValueChange={(values, sourceInfo) => {
                    if (sourceInfo.source === 'event') {
                      onChange(values.value);
                    }
                  }}
                  valueIsNumericString
                  thousandSeparator="."
                  decimalSeparator=","
                  allowNegative={false}
                  decimalScale={2}
                  prefix="R$ "
                  placeholder="R$ 0,00"
                  className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
                />
              )}
            />

            {errors.amount?.message && (
              <span className="block text-xs text-red-900">{errors.amount.message}</span>
            )}

            <span className="block text-xs text-gray-400">
              É o valor de <strong>cada</strong> ocorrência, não o total do ano:
              um aluguel mensal de R$ 5.000 é R$ 5.000 aqui.
            </span>

            {hasAmountChanged && (
              <p className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
                <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                <span>
                  Alterar o valor <strong>reescreve o custo de todas as
                  competências passadas</strong> desta despesa. Para um reajuste,
                  encerre esta com data final e cadastre outra a partir da nova
                  vigência.
                </span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-normal text-gray-500">
                Início da competência
              </span>

              <input
                type="date"
                {...register('startDate')}
                className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
              />

              {errors.startDate?.message && (
                <span className="block text-xs text-red-900">
                  {errors.startDate.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-sm font-normal text-gray-500">
                Fim da competência (opcional)
              </span>

              <input
                type="date"
                {...register('endDate')}
                className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
              />

              {errors.endDate?.message && (
                <span className="block text-xs text-red-900">
                  {errors.endDate.message}
                </span>
              )}
            </div>
          </div>

          <p className="flex items-start gap-2 text-xs text-gray-400">
            <InfoCircledIcon className="mt-0.5 shrink-0" />

            <span>
              A data inicial é <strong>competência, não cadastro</strong>: uma
              despesa lançada hoje pode valer desde janeiro, e as ocorrências de
              cada mês são derivadas daí sem ninguém precisar lançar todo mês.
              Sem data final, a despesa segue valendo.
            </span>
          </p>

          <label className="flex items-start gap-3 rounded-lg border border-gray-600 p-4" role="button">
            <input
              type="checkbox"
              className="mt-1 size-5 shrink-0 rounded text-red-500 focus:ring-0"
              {...register('includeInAllocation')}
            />

            <span>
              <span className="block text-sm font-medium text-gray-500">
                Incluir no rateio de custo indireto
              </span>

              <span className="mt-1 block text-xs text-gray-400">
                Desmarque para tirar esta despesa do custo de cada prato sem
                desativá-la — obra, equipamento, um gasto pontual.
              </span>
            </span>
          </label>

          <div className="space-y-2">
            <span className="text-sm font-normal text-gray-500">Observação (opcional)</span>

            <Input
              type="text"
              placeholder="Ex: contrato reajusta em julho"
              error={errors.notes?.message}
              {...register('notes')}
            />
          </div>

          <footer className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="py-3 font-bold text-red-800"
            >
              Cancelar
            </button>

            <Button isLoading={isPending} className="w-full sm:w-auto">
              Salvar Despesa
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
