import { formatCurrency } from "../../../../../../app/utils/formatCurrency";
import { applySizePrice } from "../../../../../../app/utils/sizePrice";
import { CartItem } from "../../../../../../types/CartItem";
import { sizeTypeLabels } from "../../../../../../types/Recipe";
import { Button } from "../../../../../components/Button";
import { Modal } from "../../../../../components/Modal";
import { hasSizeChoice } from "../useNewOrderController";
import { ModalOverlay } from "../../../../../components/ModalOverlay";

interface ConfirmOrderModalProps {
  visible: boolean;
  table: string;
  cartItems: CartItem[];
  total: number;
  description: string;
  isLoading: boolean;
  onChangeDescription(description: string): void;
  onClose(): void;
  onConfirm(): void;
}

export function ConfirmOrderModal({
  visible,
  table,
  cartItems,
  total,
  description,
  isLoading,
  onChangeDescription,
  onClose,
  onConfirm,
}: ConfirmOrderModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <ModalOverlay>
      <Modal visible title={`Enviar pedido · Mesa ${table}`} onClose={onClose}>
        <div className="space-y-6">
          <ul className="space-y-2">
            {cartItems.map(({ product, quantity, size }) => (
              <li key={product.id} className="flex items-start justify-between gap-4 text-sm">
                <span className="min-w-0 text-gray-800">
                  <span className="text-gray-400">{quantity}x </span>

                  {product.name}

                  {hasSizeChoice(product) && (
                    <span className="text-gray-400"> · {sizeTypeLabels[size]}</span>
                  )}
                </span>

                <span className="shrink-0 text-gray-500">
                  {formatCurrency(applySizePrice(product.price * quantity, size))}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-gray-600/40 pt-3">
            <span className="text-sm text-gray-400">Total</span>

            <strong className="text-lg font-semibold text-gray-800">
              {formatCurrency(total)}
            </strong>
          </div>

          <div>
            <label
              htmlFor="order-description"
              className="mb-2 block text-sm font-semibold text-gray-500"
            >
              Observações (opcional)
            </label>

            <textarea
              id="order-description"
              rows={3}
              value={description}
              onChange={event => onChangeDescription(event.target.value)}
              placeholder="Sem cebola, ponto da carne, alergias..."
              className="w-full resize-none rounded-lg border border-gray-600 bg-white p-3 text-gray-800 outline-none transition-all focus:border-gray-800"
            />
          </div>

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
              Enviar para a cozinha
            </Button>
          </footer>
        </div>
      </Modal>
    </ModalOverlay>
  );
}
