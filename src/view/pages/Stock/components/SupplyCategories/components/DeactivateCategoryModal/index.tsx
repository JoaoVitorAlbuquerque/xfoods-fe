import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { SupplyCategory } from "../../../../../../../types/Supply";
import { supplyCategoriesService } from "../../../../../../../app/services/supplyCategoriesService";
import { supplyCategoriesQueryKey } from "../../../../../../../app/hooks/useStockQueries";
import { toastApiError } from "../../../../../../../app/utils/toastApiError";
import { Button } from "../../../../../../components/Button";
import { Modal } from "../../../../../../components/Modal";

interface DeactivateCategoryModalProps {
  visible: boolean;
  onClose(): void;
  category: SupplyCategory;
}

export function DeactivateCategoryModal({
  visible,
  onClose,
  category,
}: DeactivateCategoryModalProps) {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: supplyCategoriesService.remove,
  });

  const handleDeactivate = useCallback(async () => {
    try {
      await mutateAsync(category.id);

      queryClient.invalidateQueries({ queryKey: supplyCategoriesQueryKey });
      toast.success(`Categoria ${category.name} desativada!`);
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao desativar a categoria!');
    }
  }, [category, mutateAsync, queryClient, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal visible={visible} onClose={onClose} title="Desativar Categoria">
        <div className="flex flex-col items-center gap-6 sm:max-w-[420px]">
          <span className="text-center font-medium text-gray-400">
            Tem certeza que deseja desativar esta categoria?
          </span>

          <strong className="text-sm text-gray-500">{category.name}</strong>

          <span className="text-center text-xs text-gray-400">
            A categoria não é apagada: ela deixa de aparecer no cadastro de
            insumos novos, mas os {category._count.supplies} insumo(s) já
            classificados nela continuam como estão.
          </span>
        </div>

        <footer className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={onClose}
            type="button"
            className="py-3 font-bold text-red-800"
            disabled={isPending}
          >
            Manter Categoria
          </button>

          <Button onClick={handleDeactivate} isLoading={isPending} className="w-full sm:w-auto">
            Desativar Categoria
          </Button>
        </footer>
      </Modal>
    </div>
  );
}
