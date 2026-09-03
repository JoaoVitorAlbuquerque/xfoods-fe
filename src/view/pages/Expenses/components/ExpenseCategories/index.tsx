import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";

import { expenseCategoriesService } from "../../../../../app/services/expenseCategoriesService";
import {
  expenseCategoriesQueryKey,
  useExpenseCategories,
  useInvalidateExpenses,
} from "../../../../../app/hooks/useExpenseQueries";
import { cn } from "../../../../../app/utils/cn";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import {
  CostNature,
  ExpenseCategory,
  costNatureLabels,
} from "../../../../../types/Expense";
import { ActionButton } from "../../../../components/ActionButton";
import { Button } from "../../../../components/Button";
import { ContentHeader } from "../../../../components/ContentHeader";
import { Input } from "../../../../components/Input";
import { ListFeedback } from "../../../../components/ListFeedback";
import { Modal } from "../../../../components/Modal";
import { Select } from "../../../../components/Select";
import { TableComponents } from "../../../../components/TableElements";

import editIcon from '../../../../components/icons/edit-icon.svg';

const schema = z.object({
  name: z
    .string()
    .min(2, 'Nome precisa de pelo menos 2 caracteres')
    .max(80, 'Nome deve ter no máximo 80 caracteres'),
  nature: z.enum(['DIRECT', 'INDIRECT']),
});

type FormData = z.infer<typeof schema>;

function CategoryModal({
  visible,
  onClose,
  category,
}: {
  visible: boolean;
  onClose(): void;
  category?: ExpenseCategory;
}) {
  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? '',
      nature: (category?.nature ?? 'INDIRECT') as CostNature,
    },
  });

  const queryClient = useQueryClient();
  const invalidateExpenses = useInvalidateExpenses();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (data: FormData) => (
      category
        ? expenseCategoriesService.update({ id: category.id, ...data })
        : expenseCategoriesService.create(data)
    ),
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      await mutateAsync(data);

      queryClient.invalidateQueries({ queryKey: expenseCategoriesQueryKey });
      invalidateExpenses();
      toast.success(category ? 'Categoria atualizada!' : 'Categoria criada!');
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao salvar a categoria!');
    }
  });

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal
        visible
        onClose={onClose}
        title={category ? 'Editar Categoria' : 'Nova Categoria de Despesa'}
      >
        <form onSubmit={handleSubmit} className="space-y-5 sm:w-[400px]">
          <div className="space-y-2">
            <span className="text-sm font-normal text-gray-500">Nome</span>

            <Input
              type="text"
              placeholder="Ex: Energia"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-normal text-gray-500">Natureza do custo</span>

            <Select {...register('nature')}>
              <option value="INDIRECT">Indireto (entra no rateio)</option>
              <option value="DIRECT">Direto (fica fora do rateio)</option>
            </Select>

            <span className="block text-xs text-gray-400">
              Só o custo indireto é rateado entre os pratos. Marcar como direto
              tira a categoria do rateio — é para custos que já pertencem ao
              prato sem passar pela ficha técnica, e que seriam contados duas
              vezes se entrassem aqui.
            </span>
          </div>

          <footer className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="py-3 font-bold text-red-800"
            >
              Cancelar
            </button>

            <Button isLoading={isPending} className="w-full sm:w-auto">
              Salvar
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}

export function ExpenseCategories() {
  const [isCreating, setIsCreating] = useState(false);
  const [categoryBeingEdited, setCategoryBeingEdited] = useState<ExpenseCategory | null>(null);

  const { categories, isFetching, isError, refetch } = useExpenseCategories();

  const queryClient = useQueryClient();

  const { isPending: isSeeding, mutateAsync: seed } = useMutation({
    mutationFn: expenseCategoriesService.seed,
  });

  const { isPending: isTogglingActive, mutateAsync: updateCategory } = useMutation({
    mutationFn: expenseCategoriesService.update,
  });

  const handleSeed = useCallback(async () => {
    try {
      const result = await seed();

      queryClient.invalidateQueries({ queryKey: expenseCategoriesQueryKey });
      toast.success(
        result.created > 0
          ? `${result.created} categoria(s) criada(s). ${result.skipped} já existiam.`
          : 'Todas as categorias sugeridas já existem.',
      );
    } catch (error) {
      toastApiError(error, 'Erro ao criar as categorias sugeridas!');
    }
  }, [seed, queryClient]);

  const handleToggleActive = useCallback(async (category: ExpenseCategory) => {
    try {
      await updateCategory({ id: category.id, active: !category.active });

      queryClient.invalidateQueries({ queryKey: expenseCategoriesQueryKey });
      toast.success(
        category.active
          ? `${category.name} desativada.`
          : `${category.name} reativada.`,
      );
    } catch (error) {
      toastApiError(error, 'Erro ao alterar a categoria!');
    }
  }, [updateCategory, queryClient]);

  return (
    <>
      <CategoryModal visible={isCreating} onClose={() => setIsCreating(false)} />

      {categoryBeingEdited && (
        <CategoryModal
          visible
          category={categoryBeingEdited}
          onClose={() => setCategoryBeingEdited(null)}
        />
      )}

      <ContentHeader title="Categorias de despesa" quantity={categories.length}>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleSeed}
            disabled={isSeeding}
            className={cn('text-sm font-bold text-gray-500', isSeeding && 'text-gray-300')}
          >
            Criar as 12 sugeridas
          </button>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="pt-1 text-sm font-bold text-red-600"
          >
            Nova Categoria
          </button>
        </div>
      </ContentHeader>

      <p className="mb-6 text-sm text-gray-400">
        "Criar as 12 sugeridas" acrescenta só o que faltar — não renomeia nem
        apaga nada, então rodar duas vezes é inofensivo.
      </p>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={categories.length === 0}
        emptyMessage="Nenhuma categoria de despesa cadastrada. Comece pelas 12 sugeridas."
        errorMessage="Não foi possível carregar as categorias."
        onRetry={refetch}
      >
        <div className="overflow-x-auto">
          <TableComponents.Table>
            <thead>
              <tr className="bg-gray-600/20">
                <TableComponents.TableHeader>Nome</TableComponents.TableHeader>
                <TableComponents.TableHeader>Natureza</TableComponents.TableHeader>
                <TableComponents.TableHeader>Despesas</TableComponents.TableHeader>
                <TableComponents.TableHeader>Ações</TableComponents.TableHeader>
              </tr>
            </thead>

            <tbody>
              {categories.map(category => (
                <TableComponents.TableRow key={category.id}>
                  <TableComponents.TableCell>
                    {category.name}

                    {!category.active && (
                      <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-400">
                        Inativa
                      </span>
                    )}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {costNatureLabels[category.nature]}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {category._count.expenses}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isTogglingActive}
                        onClick={() => handleToggleActive(category)}
                        className={cn(
                          'whitespace-nowrap rounded-full border border-gray-600 px-3 py-1 text-xs',
                          isTogglingActive && 'text-gray-300',
                        )}
                      >
                        {category.active ? 'Desativar' : 'Reativar'}
                      </button>

                      <ActionButton
                        title="Editar categoria"
                        onClick={() => setCategoryBeingEdited(category)}
                      >
                        <img src={editIcon} alt="Editar" />
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
