import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Supplier } from "../../../../../../../types/Supplier";
import { suppliersService } from "../../../../../../../app/services/suppliersService";
import { suppliersQueryKey } from "../../../../../../../app/hooks/usePurchaseQueries";
import { toastApiError } from "../../../../../../../app/utils/toastApiError";
import { Button } from "../../../../../../components/Button";
import { Modal } from "../../../../../../components/Modal";

interface DeactivateSupplierModalProps {
  visible: boolean;
  onClose(): void;
  supplier: Supplier;
}

export function DeactivateSupplierModal({
  visible,
  onClose,
  supplier,
}: DeactivateSupplierModalProps) {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: suppliersService.remove,
  });

  const handleDeactivate = useCallback(async () => {
    try {
      await mutateAsync(supplier.id);

      queryClient.invalidateQueries({ queryKey: suppliersQueryKey });
      toast.success(`${supplier.name} desativado!`);
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao desativar o fornecedor!');
    }
  }, [supplier, mutateAsync, queryClient, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal visible={visible} onClose={onClose} title="Desativar Fornecedor">
        <div className="flex flex-col items-center gap-6 sm:max-w-[420px]">
          <span className="text-center font-medium text-gray-400">
            Tem certeza que deseja desativar este fornecedor?
          </span>

          <strong className="text-sm text-gray-500">{supplier.name}</strong>

          <span className="text-center text-xs text-gray-400">
            O fornecedor não é apagado: ele sai da lista de escolha em compras
            novas, mas as {supplier._count.purchases} compra(s) já lançadas e o
            histórico de custo continuam dizendo de quem veio cada preço.
          </span>
        </div>

        <footer className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={onClose}
            type="button"
            className="py-3 font-bold text-red-800"
            disabled={isPending}
          >
            Manter Fornecedor
          </button>

          <Button onClick={handleDeactivate} isLoading={isPending} className="w-full sm:w-auto">
            Desativar Fornecedor
          </Button>
        </footer>
      </Modal>
    </div>
  );
}
