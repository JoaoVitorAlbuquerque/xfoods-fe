import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { SupplyCategory } from "../../../../../types/Supply";
import { supplyCategoriesService } from "../../../../../app/services/supplyCategoriesService";
import { supplyCategoriesQueryKey, useSupplyCategories } from "../../../../../app/hooks/useStockQueries";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { cn } from "../../../../../app/utils/cn";
import { ActionButton } from "../../../../components/ActionButton";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { TableComponents } from "../../../../components/TableElements";
import { SupplyCategoryModal } from "./components/SupplyCategoryModal";
import { DeactivateCategoryModal } from "./components/DeactivateCategoryModal";

import editIcon from '../../../../components/icons/edit-icon.svg';
import trashIcon from '../../../../components/icons/trash-icon.svg';

export function SupplyCategories() {
  const [isCreating, setIsCreating] = useState(false);
  const [categoryBeingEdited, setCategoryBeingEdited] = useState<SupplyCategory | null>(null);
  const [categoryBeingDeactivated, setCategoryBeingDeactivated] = useState<SupplyCategory | null>(null);

  const { categories, isFetching, isError, refetch } = useSupplyCategories();

  const queryClient = useQueryClient();
  const { isPending: isReactivating, mutateAsync } = useMutation({
    mutationFn: supplyCategoriesService.update,
  });

  const handleReactivate = useCallback(async (category: SupplyCategory) => {
    try {
      await mutateAsync({ id: category.id, active: true });

      queryClient.invalidateQueries({ queryKey: supplyCategoriesQueryKey });
      toast.success(`Categoria ${category.name} reativada!`);
    } catch (error) {
      toastApiError(error, 'Erro ao reativar a categoria!');
    }
  }, [mutateAsync, queryClient]);

  return (
    <>
      <SupplyCategoryModal visible={isCreating} onClose={() => setIsCreating(false)} />

      {categoryBeingEdited && (
        <SupplyCategoryModal
          visible
          category={categoryBeingEdited}
          onClose={() => setCategoryBeingEdited(null)}
        />
      )}

      {categoryBeingDeactivated && (
        <DeactivateCategoryModal
          visible
          category={categoryBeingDeactivated}
          onClose={() => setCategoryBeingDeactivated(null)}
        />
      )}

      <ContentHeader title="Categorias de insumo" quantity={categories.length}>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="pt-1 text-sm font-bold text-red-600"
        >
          Nova Categoria
        </button>
      </ContentHeader>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={categories.length === 0}
        emptyMessage="Nenhuma categoria de insumo cadastrada."
        errorMessage="Não foi possível carregar as categorias."
        onRetry={refetch}
      >
        <div className="overflow-x-auto">
          <TableComponents.Table>
            <thead>
              <tr className="bg-gray-600/20">
                <TableComponents.TableHeader>Nome</TableComponents.TableHeader>
                <TableComponents.TableHeader>Insumos</TableComponents.TableHeader>
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
                    {category._count.supplies}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {category.active ? (
                      <div className="flex items-center">
                        <ActionButton
                          title="Editar categoria"
                          onClick={() => setCategoryBeingEdited(category)}
                        >
                          <img src={editIcon} alt="Editar" />
                        </ActionButton>

                        <ActionButton
                          title="Desativar categoria"
                          onClick={() => setCategoryBeingDeactivated(category)}
                        >
                          <img src={trashIcon} alt="Desativar" />
                        </ActionButton>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isReactivating}
                        onClick={() => handleReactivate(category)}
                        className={cn(
                          'text-sm font-bold text-red-600',
                          isReactivating && 'text-gray-400',
                        )}
                      >
                        Reativar
                      </button>
                    )}
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
