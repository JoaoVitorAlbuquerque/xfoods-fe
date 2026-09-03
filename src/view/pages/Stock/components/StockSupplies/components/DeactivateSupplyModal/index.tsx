import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Supply } from "../../../../../../../types/Supply";
import { suppliesService } from "../../../../../../../app/services/suppliesService";
import { useInvalidateStock } from "../../../../../../../app/hooks/useStockQueries";
import { toastApiError } from "../../../../../../../app/utils/toastApiError";
import { formatQuantity } from "../../../../../../../app/utils/formatQuantity";
import { Button } from "../../../../../../components/Button";
import { Modal } from "../../../../../../components/Modal";

interface DeactivateSupplyModalProps {
  visible: boolean;
  onClose(): void;
  supply: Supply;
}

export function DeactivateSupplyModal({ visible, onClose, supply }: DeactivateSupplyModalProps) {
  const invalidateStock = useInvalidateStock();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: suppliesService.setActive,
  });

  const handleDeactivate = useCallback(async () => {
    try {
      await mutateAsync({ id: supply.id, active: false });

      invalidateStock();
      toast.success(`${supply.name} desativado!`);
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao desativar o insumo!');
    }
  }, [supply, mutateAsync, invalidateStock, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal visible={visible} onClose={onClose} title="Desativar Insumo">
        <div className="flex flex-col items-center gap-6 sm:max-w-[420px]">
          <span className="text-center font-medium text-gray-400">
            Tem certeza que deseja desativar este insumo?
          </span>

          <div className="text-center text-sm text-gray-500">
            <strong className="block">{supply.name}</strong>

            <span>
              Saldo atual: {formatQuantity(supply.currentStock)} {supply.baseUnit.code}
            </span>
          </div>

          <span className="text-center text-xs text-gray-400">
            O insumo não é apagado: ele sai das listas e dos seletores, mas o
            histórico de movimentações continua fazendo sentido e a ficha técnica
            que o usa continua explicável. Dá para reativar depois.
          </span>
        </div>

        <footer className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={onClose}
            type="button"
            className="py-3 font-bold text-red-800"
            disabled={isPending}
          >
            Manter Insumo
          </button>

          <Button onClick={handleDeactivate} isLoading={isPending} className="w-full sm:w-auto">
            Desativar Insumo
          </Button>
        </footer>
      </Modal>
    </div>
  );
}
