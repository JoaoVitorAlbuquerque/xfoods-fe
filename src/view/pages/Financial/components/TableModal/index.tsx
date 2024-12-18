import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { Order } from "../../../../../types/Order";
import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { Modal } from "../../../../components/Modal";
import { RadixSelect } from "../../../../components/RadixSelect";
import { useTableModalController } from "./useTableModalController";

// import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';

interface TableModalProps {
  visible: boolean;
  onClose(): void;
  selectedTable: Order[] | null;
  // orderIds: Record<number, { orders: Order[] }>;
  // orderIds: Order[] | null;
}

// export function TableModal({ visible, onClose, selectedTable, orderIds }: TableModalProps) {
export function TableModal({ visible, onClose, selectedTable }: TableModalProps) {
  const {
    isPending,
    handleUpdatePaidOrders,
    // data: leads,
    error,
    onChangeLead,
    leadSelected,
    filteredLeads,
    searchTerm,
    setSearchTerm,
    // setLeadSelected,
  } = useTableModalController(selectedTable, onClose);
  // } = useTableModalController(selectedTable, orderIds, onClose);

  if (!visible || !selectedTable) {
    return null;
  }

  const groupOrdersByTable = (orders: Order[]) => {
    return orders.reduce((acc, order) => {
      if (order.paid) return acc;

      const { table, products } = order;

      if (!acc[table]) {
        acc[table] = { orders: [], products: [], total: 0 };
      }

      // Adiciona todos os produtos deste pedido aos produtos da mesa
      acc[table].products.push(...products);

      // Atualiza o total da mesa somando o valor total dos produtos do pedido
      const orderTotal = products.reduce((sum, item) => {
        return sum + item.quantity * item.product.price;
      }, 0);

      acc[table].total += orderTotal;
      acc[table].orders.push(order);

      return acc;
    }, {} as Record<number, { orders: Order[]; products: Order['products']; total: number }>);
  };

  const groupedOrders = groupOrdersByTable(selectedTable) || {};

  return (
    <div
      className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10"
    >
      {Object.entries(groupedOrders).map(([table, { products, total }]) => (
        <Modal
          visible={visible}
          title={`Payment(Nome do cliente) - mesa ${table}`}
          onClose={onClose}
          key={table}
        >
          <form onSubmit={handleUpdatePaidOrders}>
            <div className="max-h-[330px] overflow-auto">
              {products.map(({ product, quantity, size }) => (
                <div key={Math.random() * 1.4} className="border border-gray-500 p-1 rounded-md mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={`http://localhost:3000/uploads/${product.imagePath}`}
                      alt={product.name}
                      className="w-12 h-[28.51px] rounded-md"
                    />

                    <div>
                      <div className="space-x-4 font-medium">
                        <span className="text-gray-400">{product.name}</span>
                        <span className="text-gray-500">{formatCurrency(product.price)}</span>
                      </div>

                      <div className="space-x-4 font-medium">
                        <span>QTD: {quantity}</span>
                        <span>Tamanho: {size}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 mt-5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-normal text-sm">Clientes</span>

                <Input
                  name="leads"
                  placeholder="Pesquise por um cliente..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
                <RadixSelect
                  placeholder="Selecione um cliente a compra"
                  onChange={onChangeLead}
                  value={leadSelected}
                  error={error?.message}
                  options={filteredLeads.map((lead) => ({
                    value: lead.id,
                    label: lead.name + ' ' + lead.phone,
                  }))}
                /> {/* Fazer um dropdown menu que vai listar os leads paginados, e serão filtrados por um input */}

                {/* <Combobox value={leadSelected} onChange={setLeadSelected}>
                  <ComboboxInput
                    aria-label="Assignee"
                    className="border p-2 w-full"
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Pesquisar pelos clientes..."
                  />
                  <ComboboxOptions className="border empty:invisible">
                    {filteredLeads.map((lead) => (
                      <ComboboxOption key={lead._id} value={lead} className="group flex gap-2 bg-white data-[focus]:bg-blue-100">
                        <CheckIcon className="invisible size-5 group-data-[selected]:visible" />
                        {`${lead.name}${lead.number}`}
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                </Combobox> */}
            </div>

            <footer className="mt-10 flex items-center justify-between">
              <span className="text-lg font-medium">Total: <strong>{formatCurrency(total)}</strong></span>

              <Button
                isLoading={isPending}
                disabled={isPending}
                type="submit"
              >
                Pagar
              </Button>
            </footer>
          </form>
        </Modal>
      ))}
    </div>
  );
}
