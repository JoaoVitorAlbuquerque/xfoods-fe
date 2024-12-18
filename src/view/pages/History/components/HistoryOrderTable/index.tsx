// import { Order } from "../../../../../types/Order";
import { ActionButton } from "../../../../components/ActionButton";
import { ContentHeader } from "../../../../components/ContentHeader";
import { TableComponents } from "../../../../components/TableElements";
import { HistoryOrderModal } from "../HistoryOrderModal";

import trashIcon from '../../../../components/icons/trash-icon.svg';
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
// import { DatePickerButton } from "../../../../components/DatePickerButton";
import { formatDate } from "../../../../../app/utils/formatDate";
import { useHistoryOrderTableController } from "./useHistoryOrderTableController";
import { calculateTotalProducts } from "../../../../../app/utils/calculateTotalProducts";
import { Spinner } from "../../../../components/Spinner";
import { FilterModal } from "../FilterModal";
import filterIcon from '../../../../components/icons/filter-icon.svg';
import { months } from "../../../../../app/utils/months";
import { cn } from "../../../../../app/utils/cn";
import { calculateMonthlyTotal } from "../../../../../app/utils/calculateMonthlyTotal";

// interface HistoryOrderTableProps {
//   orders: Order[];
// }

export function HistoryOrderTable() {
  const {
    // selectedDate,
    isHistoryModalVisible,
    selectedOrder,
    handleCloseHistoryModal,
    handleOpenHistoryModal,
    separator,
    // setSelectedDate,
    orders,
    isFetching,
    isFilterModalVisible,
    handleOpenFilterModal,
    handleCloseFilterModal,
    selectedMonth,
    selectedYear,
    handleChangeMonth,
    handleChangeYear,
    handleApplyFilters,
    isSticky,
    stickyRef,
    // calculateMonthlyTotal,
  } = useHistoryOrderTableController();

  // const total = calculateMonthlyTotal(orders, selectedMonth, selectedYear);

  return (
    <div className="flex-1">
      <HistoryOrderModal
        visible={isHistoryModalVisible}
        order={selectedOrder}
        onClose={handleCloseHistoryModal}
        selectedOrder={selectedOrder}
      />

      <FilterModal
        visible={isFilterModalVisible}
        onClose={handleCloseFilterModal}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onChangeMonth={handleChangeMonth}
        onChangeYear={handleChangeYear}
        onApplyFilters={handleApplyFilters}
      />

      <ContentHeader
        title="Pedidos"
        quantity={orders?.length}
      >
        <div>
          <span className="text-sm text-gray-300/90 font-semibold">
            Faturamento do mês de {months(selectedMonth)}:{' '}
          </span>

          <span className="text-sm text-gray-700 font-bold">
            {formatCurrency(calculateMonthlyTotal(orders, selectedMonth + 1, selectedYear))}
          </span>
        </div>

        <span className="text-sm text-gray-300/90 font-semibold">
          Mostrando pedidos do mês de {months(selectedMonth)} de {selectedYear}
        </span>
      </ContentHeader>

      {isFetching && (
        <div className="flex items-center justify-center flex-1">
          <Spinner />
        </div>
      )}

      {!isFetching && (
        <TableComponents.Table>
          <thead className="">
            <tr
              ref={stickyRef}
              className={cn(
                'sticky top-0 p-4',
                isSticky ? 'bg-gray-600 shadow-lg' : 'bg-gray-600/20 z-10'
              )}
            >
              <TableComponents.TableHeader>
                Mesa
              </TableComponents.TableHeader>

              <TableComponents.TableHeader>
                Cliente
              </TableComponents.TableHeader>

              <TableComponents.TableHeader>
                {/* <DatePickerButton
                  selectedDate={selectedDate}
                  setSelectDate={setSelectedDate}
                /> */}
                <button
                  type="button"
                  className="flex items-center gap-2 size-full"
                  onClick={handleOpenFilterModal}
                >
                  <span>Data</span>
                  <img src={filterIcon} />
                </button>
              </TableComponents.TableHeader>

              <TableComponents.TableHeader>
                Nome
              </TableComponents.TableHeader>

              <TableComponents.TableHeader>
                Status
              </TableComponents.TableHeader>

              <TableComponents.TableHeader>
                PayX
              </TableComponents.TableHeader>

              <TableComponents.TableHeader>
                Total
              </TableComponents.TableHeader>

              <TableComponents.TableHeader>
                Ações
              </TableComponents.TableHeader>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => {
              const total = calculateTotalProducts(order);
              return (
                <TableComponents.TableRow key={order.id}>
                  <TableComponents.TableCell>{order.table}</TableComponents.TableCell>
                  <TableComponents.TableCell>{order.lead ? order.lead.name : 'Não cadastrado'}</TableComponents.TableCell>
                  <TableComponents.TableCell>{formatDate(new Date(order.createdAt))}</TableComponents.TableCell>
                  <TableComponents.TableCell className="relative inline-block group">
                  <p className="cursor-default">
                    {separator(order.products.map(p => p.product.name))}
                    {order.products.length > 3 && (
                      <span className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-sm rounded-md px-3 py-1 z-10 whitespace-nowrap hidden group-hover:block">
                        {order.products.map(p => p.product.name).join(', ')}
                      </span>
                    )}
                  </p>
                  </TableComponents.TableCell>
                  <TableComponents.TableCell>
                    <div className="flex items-center gap-1">
                      <span className="mr-1">
                        {order.status === 'WAITING' && <div className="size-2 rounded bg-red-700" />}
                        {order.status === 'IN_PRODUCTION' && <div className="size-2 rounded bg-orange-300" />}
                        {order.status === 'DONE' && <div className="size-2 rounded bg-green-600" />}
                      </span>
                      <span>
                        {order.status === 'WAITING' && 'Fila de espera'}
                        {order.status === 'IN_PRODUCTION' && 'Em produção'}
                        {order.status === 'DONE' && 'Pronto'}
                      </span>
                    </div>
                  </TableComponents.TableCell>
                  <TableComponents.TableCell>
                    <div className="flex items-center gap-1">
                      <span className="mr-1">
                        {order.paid ? <div className="size-2 rounded bg-green-600" /> : <div className="size-2 rounded bg-red-700" />}
                      </span>
                      <span>
                        {order.paid ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                  </TableComponents.TableCell>
                  <TableComponents.TableCell>{formatCurrency(total)}</TableComponents.TableCell>
                  <TableComponents.TableCell className="flex items-center gap-4">
                    <ActionButton onClick={() => handleOpenHistoryModal(order)}>
                      <img src={trashIcon} />
                    </ActionButton>
                  </TableComponents.TableCell>
                </TableComponents.TableRow>
              );
            })}
          </tbody>
        </TableComponents.Table>
      )}
    </div>
  );
}
