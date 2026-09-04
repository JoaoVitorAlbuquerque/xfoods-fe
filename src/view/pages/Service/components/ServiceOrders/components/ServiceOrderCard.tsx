import { cn } from "../../../../../../app/utils/cn";
import { calculateTotalProducts } from "../../../../../../app/utils/calculateTotalProducts";
import { formatCurrency } from "../../../../../../app/utils/formatCurrency";
import { Order } from "../../../../../../types/Order";
import { SizeType, sizeTypeLabels } from "../../../../../../types/Recipe";

const statusLabels: Record<Order['status'], { icon: string; label: string; dot: string }> = {
  WAITING: { icon: '🕑', label: 'Fila de espera', dot: 'bg-red-700' },
  IN_PRODUCTION: { icon: '👩‍🍳', label: 'Em produção', dot: 'bg-gray-800' },
  DONE: { icon: '✅', label: 'Pronto', dot: 'bg-green-600' },
  CANCELED: { icon: '🚫', label: 'Cancelado', dot: 'bg-gray-400' },
};

interface ServiceOrderCardProps {
  order: Order;
  onDeliver(order: Order): void;
}

export function ServiceOrderCard({ order, onDeliver }: ServiceOrderCardProps) {
  const status = statusLabels[order.status];
  const isCanceled = order.status === 'CANCELED';

  return (
    <li
      className={cn(
        'rounded-2xl border border-gray-600/40 bg-white p-4',
        order.read && 'opacity-60',
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <strong className="font-semibold text-gray-800">Mesa {order.table}</strong>

        <div className="flex items-center gap-2">
          {order.read && (
            <span className="rounded-full bg-gray-500/20 px-2 py-1 text-xs text-gray-500">
              Entregue
            </span>
          )}

          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            <span className={cn('size-2 rounded-full', status.dot)} />

            {status.icon} {status.label}
          </span>
        </div>
      </header>

      <ul className="mt-3 space-y-1">
        {order.products.map(({ id, quantity, size, product }) => (
          <li key={id} className="flex items-start justify-between gap-3 text-sm">
            <span className="min-w-0 text-gray-800">
              <span className="text-gray-400">{quantity}x </span>

              {product.name}

              {product.category?.name !== 'Bebidas' && (
                <span className="text-gray-400">
                  {' '}· {sizeTypeLabels[size as SizeType] ?? size}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {order.description && (
        <p className="mt-3 rounded-lg border border-gray-600/40 p-2 text-sm text-gray-500">
          {order.description}
        </p>
      )}

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-600/40 pt-3">
        <div>
          <span className="block text-xs text-gray-400">Total</span>

          <strong className="font-semibold text-gray-800">
            {formatCurrency(calculateTotalProducts(order))}
          </strong>
        </div>

        {/* Cancelado não se entrega; já entregue não tem volta, então o botão
            simplesmente sai de cena depois de usado. */}
        {!order.read && !isCanceled && (
          <button
            type="button"
            onClick={() => onDeliver(order)}
            className="rounded-[44px] border border-red-800 px-4 py-2 text-sm font-semibold text-red-800 transition-colors hover:bg-red-800 hover:text-white"
          >
            Marcar como entregue
          </button>
        )}
      </footer>
    </li>
  );
}
