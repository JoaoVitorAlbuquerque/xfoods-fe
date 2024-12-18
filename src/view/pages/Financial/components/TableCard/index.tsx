import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { Input } from "../../../../components/Input";
import { TableModal } from "../TableModal";
import { useTableCardController } from "./useTableCardController";

export function TableCard() {
  const {
    isModalVisible,
    handleOpenTableModal,
    handleCloseTableModal,
    groupedOrders,
    selectedTable,
    searchTerm,
    setSearchTerm,
  } = useTableCardController();

  return (
    <>
      <TableModal
        visible={isModalVisible}
        onClose={handleCloseTableModal}
        selectedTable={selectedTable}
        // orderIds={Object.entries(groupedOrders).map(([, { orders }]) => orders.map(order => order)).flat()}
        // orderIds={selectedTable}
      />

      <header className="mb-6 p-3">
        <Input
          type="text"
          name="search"
          placeholder="Busque a mesa do cliente"
          value={String(searchTerm)}
          onChange={(e) => setSearchTerm(String(e.target.value))}
        />
      </header>

      {Object.entries(groupedOrders).map(([table, { orders, products, total }]) => {
        return (
          <button
            className="p-4 border border-gray-600/40 bg-white rounded-2xl flex flex-col items-center flex-1"
            onClick={() => handleOpenTableModal(orders)}
            key={table}
            >
            <div>
              <header className="p-2 text-lg flex w-full items-center gap-2">
                <span className="w-full rounded-md bg-gray-600/30">Mesa: <strong>{table}</strong></span>
              </header>

              <div className="flex flex-col w-full mt-6 gap-6">
                <div className="py-1 px-2 rounded text-gray-500 flex flex-col gap-2">
                  <span><strong>{orders.length}</strong> Pedidos</span>
                  <span className=""><strong>{products.length}</strong> items</span>
                </div>

                <strong>Total: {formatCurrency(total)}</strong>
              </div>
            </div>
          </button>
        );
      })}
    </>
  );
}
