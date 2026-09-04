import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";

import { productionService } from "../../../../../app/services/productionService";
import { useInvalidateProduction } from "../../../../../app/hooks/useProductionQueries";
import { getApiErrorMessage } from "../../../../../app/utils/getApiErrorMessage";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { ProductionOrder } from "../../../../../types/Production";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";

interface CancelProductionModalProps {
  visible: boolean;
  onClose(): void;
  order: ProductionOrder;
}

export function CancelProductionModal({
  visible,
  onClose,
  order,
}: CancelProductionModalProps) {
  /** 409: o lote já foi confirmado e as movimentações são históricas. */
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  const invalidateProduction = useInvalidateProduction();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: productionService.cancel,
  });

  const handleCancel = useCallback(async () => {
    try {
      setConflictMessage(null);

      await mutateAsync(order.id);

      invalidateProduction();
      toast.success('Lote cancelado. Nada foi movimentado no estoque.');
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setConflictMessage(
          getApiErrorMessage(error, 'Este lote não pode mais ser cancelado.'),
        );
        return;
      }

      toastApiError(error, 'Erro ao cancelar o lote!');
    }
  }, [order.id, mutateAsync, invalidateProduction, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal visible onClose={onClose} title="Cancelar lote">
        <div className="space-y-6 sm:max-w-[460px]">
          {conflictMessage ? (
            <>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2 text-red-900">
                  <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                  <div>
                    <strong className="block text-sm">
                      Este lote não pode ser cancelado
                    </strong>

                    <p className="mt-2 whitespace-pre-line text-xs">
                      {conflictMessage}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Um lote confirmado já consumiu os ingredientes e pode ter virado
                prato vendido. Desfazê-lo seria um estorno que não existe. Para
                corrigir o saldo, o caminho é um{' '}
                <strong>ajuste ou uma perda</strong> de estoque.
              </p>

              <div className="space-y-2 text-sm">
                <Link
                  to={`/stock/supplies/${order.outputSupplyId}`}
                  className="block font-bold text-red-600"
                >
                  Ajustar o saldo de {order.outputSupply.name}
                </Link>

                <Link to="/stock/movements" className="block font-bold text-red-600">
                  Ver as movimentações deste lote
                </Link>
              </div>
            </>
          ) : (
            <>
              <span className="block text-center font-medium text-gray-400">
                Tem certeza que deseja cancelar este lote?
              </span>

              <div className="text-center text-sm text-gray-500">
                <strong className="block">
                  {order.recipe.name ?? 'Sub-receita'} → {order.outputSupply.name}
                </strong>

                <span>
                  {formatQuantity(order.expectedQuantity)}{' '}
                  {order.outputSupply.baseUnit.code} previstos ·{' '}
                  {order.items.length} ingrediente(s)
                </span>
              </div>

              <span className="block text-center text-xs text-gray-400">
                O lote é rascunho e não encostou no estoque: cancelar não
                movimenta nada, só descarta o registro.
              </span>
            </>
          )}
        </div>

        <footer className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="py-3 font-bold text-red-800"
          >
            {conflictMessage ? 'Fechar' : 'Manter Lote'}
          </button>

          {!conflictMessage && (
            <Button
              onClick={handleCancel}
              isLoading={isPending}
              className="w-full sm:w-auto"
            >
              Cancelar Lote
            </Button>
          )}
        </footer>
      </Modal>
    </div>
  );
}
