import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatDate } from "../../../../../app/utils/formatDate";
import { Lead } from "../../../../../types/Lead";

import { Modal } from "../../../../components/Modal";
// import { useLeadOrdersModalController } from "./useLeadOrdersModalController";

interface DeleteUserModalProps {
  visible: boolean;
  onCloseLeadOrderModal(): void;
  selectedLead: Lead | null;
}

export function LeadOrdersModal({ visible, onCloseLeadOrderModal, selectedLead }: DeleteUserModalProps) {
  // const { data } = useLeadOrdersModalController(selectedLead);

  if (!visible) {
    return null;
  }

  // const lead = data.map(({ orders }) => orders);

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10">
      <Modal
        visible={visible}
        onClose={onCloseLeadOrderModal}
        // title={`Pedidos feitos por ${data.map(({ name }) => name)}`}
        title={`Pedidos feitos por ${selectedLead?.name}`}
      >
        <div className="overflow-y-auto max-h-80">
          {/* {lead?.orders.length === 0 && (
            <span>
              Nenhum pedido associado ao cliente!
            </span>
          )} */}
          {selectedLead?.orders.length === 0 && (
            <span>
              Nenhum pedido associado ao cliente!
            </span>
          )}

          {/* {data.map(({ orders }) => orders.length === 0) && lead?.orders.map(({ id, products, createdAt, paid }) => ( */}
          {selectedLead?.orders.length !== 0 && selectedLead?.orders.map(({ id, createdAt, paid, products }) => (
            <div
              key={id}
              className="border border-gray-800 p-2 rounded-md mb-2"
            >
              {products.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-2 mb-2"
                >
                  <img
                    src={`http://localhost:3000/uploads/${product.imagePath}`}
                    alt={product.name}
                    className="w-14 h-[28.51px] rounded-md"
                  />
                  <span>{product.name}</span>
                  <strong>{formatCurrency(Number(product.price))}</strong>
                  <span>QTD: {quantity}</span>
                  {/* <span>{size}</span> */}
                </div>
              ))}

              <div className=" flex mt-4 items-center justify-between">
                <strong>Data: {formatDate(new Date(createdAt))}</strong>
                <div className="flex items-center gap-1">
                  {paid ? <div className="size-2 rounded bg-green-600" /> : <div className="size-2 rounded bg-red-700" />}
                  <span>{paid ? 'Pago' : 'Pendente'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
