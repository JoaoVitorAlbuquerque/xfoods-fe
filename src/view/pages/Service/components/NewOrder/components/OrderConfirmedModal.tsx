import { CheckCircledIcon } from "@radix-ui/react-icons";

interface OrderConfirmedModalProps {
  visible: boolean;
  table: string;
  onClose(): void;
}

export function OrderConfirmedModal({ visible, table, onClose }: OrderConfirmedModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-red-800 p-6 text-center text-white">
      <CheckCircledIcon className="size-16" />

      <strong className="text-xl font-semibold">Pedido confirmado</strong>

      <p className="text-white/90">
        O pedido da mesa {table} já entrou na fila de produção.
      </p>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 rounded-[44px] bg-white px-8 py-3 font-semibold text-red-800"
      >
        OK
      </button>
    </div>
  );
}
