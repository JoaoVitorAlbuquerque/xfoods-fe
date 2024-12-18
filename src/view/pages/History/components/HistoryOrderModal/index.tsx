import { Order } from "../../../../../types/Order";
import { calculateTotalProducts } from "../../../../../app/utils/calculateTotalProducts";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { Modal } from "../../../../components/Modal";
import { formatDate } from "../../../../../app/utils/formatDate";
import { useHistoryOrderModalController } from "./useHistoryOrderModalController";
import { Spinner } from "../../../../components/Spinner";

interface HistoryOrderModalProps {
  visible: boolean;
  order: Order | null;
  onClose(): void;
  selectedOrder: Order | null;
}

export function HistoryOrderModal({ visible, order, onClose, selectedOrder }: HistoryOrderModalProps) {
  const {
    handleDeleteOrder,
    isPending,
  } = useHistoryOrderModalController(selectedOrder, onClose);

  if (!visible || !order) {
    return null;
  }

  const total = calculateTotalProducts(order);

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-[99]">
      <Modal
        visible={visible}
        title={`Mesa ${order.table}`}
        onClose={onClose}
      >
        <div key={order.id}>
          <div className="flex items-center">
            <div className="w-1/2">
              <small className="text-sm text-gray-500/80">Data do pedido</small>

              <div className="flex items-center gap-2 mt-2">
                <strong className="font-semibold">
                  {formatDate(new Date((order.createdAt)))}
                </strong>
              </div>
            </div>

            <div className="w-1/2">
              <p className="text-sm text-gray-500/80">Status Pagamento</p>

              <div className="flex items-center gap-2 mt-2">
                <span>
                  {order.paid && <div className="size-2 rounded bg-green-600" />}
                  {!order.paid && <div className="size-2 rounded bg-red-700" />}
                </span>

                <strong className="font-semibold">
                {order.paid && 'Pago'}
                {!order.paid && 'Pendente'}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <strong className="font-medium text-gray-500/80 text-sm">
              Itens
            </strong>

            <div className="mt-4 overflow-y-auto max-h-[250px]">
              {order.products.map(({ product, quantity, size }) => (
                <div className="flex mt-4" key={Math.random() * 1.5}>
                  <img
                    src={`http://localhost:3000/uploads/${product.imagePath}`}
                    alt={product.name}
                    className="w-14 h-[28.51px] rounded-md"
                  />

                  <span className="text-gray-400 block min-w-5 ml-3">
                    {quantity}x
                  </span>

                  <div className="ml-1">
                    <div className="flex items-center mb-1">
                      <strong className="block mr-4">{product.name}</strong>

                      {product.category.name !== 'Bebidas' && (
                        <div className="p-0.5 rounded-md bg-red-700">
                          <span className="font-semibold text-white">
                            {size === 'METER' && 'Metro'}
                            {size === 'LARGE' && 'Grande'}
                            {size === 'MEAN' && 'Média'}
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="text-sm text-gray-400">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>
              ))}
              </div>

              <div className="mt-4 space-y-2">
                <span className="text-sm text-gray-500/80">Detalhes do pedido</span>

                <div className="p-1 rounded-md border border-gray-400">
                  <p className="font-medium text-gray-500/80">
                    {(order.description === null || order.description === '' || order.description === undefined)? 'Pedido tradicional' : order.description}
                  </p>
                </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <span className="font-medium text-sm opacity-80">Total</span>
            <strong className="text-gray-500">{formatCurrency(total)}</strong>
          </div>
        </div>

        <footer className="flex items-center mt-8">
          {isPending ? (
            <Spinner className="size-6" />
          ) : (
            <button
              type="button"
              className="py-3 font-bold text-red-800"
              onClick={handleDeleteOrder}
              disabled={isPending}
            >
              Excluir Registro
            </button>
          )}
        </footer>
      </Modal>
    </div>
  );
}
