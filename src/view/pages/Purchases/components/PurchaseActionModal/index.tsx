import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";

import { Purchase } from "../../../../../types/Purchase";
import { purchasesService } from "../../../../../app/services/purchasesService";
import { useInvalidatePurchases } from "../../../../../app/hooks/usePurchaseQueries";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";

export type PurchaseAction = 'confirm' | 'cancel';

interface PurchaseActionModalProps {
  visible: boolean;
  action: PurchaseAction;
  purchase: Purchase;
  onClose(): void;
  onDone?(): void;
}

export function PurchaseActionModal({
  visible,
  action,
  purchase,
  onClose,
  onDone,
}: PurchaseActionModalProps) {
  const invalidatePurchases = useInvalidatePurchases();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async () => (
      action === 'confirm'
        ? purchasesService.confirm(purchase.id)
        : purchasesService.cancel(purchase.id)
    ),
  });

  const handleConfirm = useCallback(async () => {
    try {
      await mutateAsync();

      invalidatePurchases();
      toast.success(
        action === 'confirm'
          ? 'Compra confirmada: o estoque entrou e o custo dos insumos foi atualizado.'
          : 'Rascunho cancelado.',
      );
      onDone?.();
      onClose();
    } catch (error) {
      toastApiError(error, 'Não foi possível concluir a operação!');
    }
  }, [action, mutateAsync, invalidatePurchases, onDone, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal
        visible={visible}
        onClose={onClose}
        title={action === 'confirm' ? 'Confirmar Compra' : 'Cancelar Rascunho'}
      >
        <div className="space-y-4 sm:max-w-[440px]">
          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
            <strong className="block">
              {purchase.documentNumber ? `Nota ${purchase.documentNumber}` : 'Compra sem número de nota'}
            </strong>

            <span>
              {purchase.supplier?.name ?? 'Sem fornecedor'} ·{' '}
              {purchase.items.length} item(ns) · {formatCurrency(purchase.totalAmount)}
            </span>
          </div>

          {action === 'confirm' ? (
            <p className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
              <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

              <span>
                Confirmar dá entrada de cada item no estoque, atualiza o custo
                atual dos insumos e acrescenta uma linha ao histórico de custo —
                tudo de uma vez. <strong>A ação é irreversível:</strong> depois de
                confirmada, esta compra não pode mais ser cancelada.
              </span>
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              O rascunho ainda não encostou no estoque, então cancelar não desfaz
              nada — apenas marca esta compra como cancelada.
            </p>
          )}
        </div>

        <footer className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="py-3 font-bold text-red-800"
          >
            Voltar
          </button>

          <Button onClick={handleConfirm} isLoading={isPending} className="w-full sm:w-auto">
            {action === 'confirm' ? 'Confirmar Compra' : 'Cancelar Rascunho'}
          </Button>
        </footer>
      </Modal>
    </div>
  );
}
