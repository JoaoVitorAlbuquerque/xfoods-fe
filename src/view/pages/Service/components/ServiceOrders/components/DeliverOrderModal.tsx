import { Order } from "../../../../../../types/Order";
import { Button } from "../../../../../components/Button";
import { Modal } from "../../../../../components/Modal";
import { ModalOverlay } from "../../../../../components/ModalOverlay";

interface DeliverOrderModalProps {
  order: Order | null;
  isLoading: boolean;
  onClose(): void;
  onConfirm(): void;
}

export function DeliverOrderModal({
  order,
  isLoading,
  onClose,
  onConfirm,
}: DeliverOrderModalProps) {
  if (!order) {
    return null;
  }

  return (
    <ModalOverlay>
      <Modal visible title={`Mesa ${order.table}`} onClose={onClose}>
        <div className="space-y-6">
          <p className="text-gray-500">
            Confirmar que o pedido da mesa {order.table} foi entregue?
          </p>

          {/*
            `PATCH /orders/:id/read` só grava `true` — a API não tem rota para
            desmarcar. Por isso a confirmação existe: um clique errado não se
            desfaz pela tela.
          */}
          <p className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
            Esta marcação <strong>não pode ser desfeita</strong> pelo sistema.
          </p>

          <footer className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="py-3 font-semibold text-gray-500 disabled:text-gray-400"
            >
              Voltar
            </button>

            <Button type="button" onClick={onConfirm} isLoading={isLoading}>
              Confirmar entrega
            </Button>
          </footer>
        </div>
      </Modal>
    </ModalOverlay>
  );
}
