import { Header } from "../../components/Header";
import { HomeIcon } from "../../components/icons/HomeIcon";
import { Spinner } from "../../components/Spinner";
import { OrdersCard } from "./components/OrdersCard";

import { ResetModal } from "./components/ResetModal";
import { useDashboard } from "./useDashboard";

export function Dashboard() {
  const {
    data: orders,
    isResetModalVisible,
    isFetching,
    handleCloseResetModal,
    handleOpenResetModal,
    handleOrderStatusChange,
  } = useDashboard();

  const waiting = orders.filter((order) => order.status === 'WAITING');
  const inProduction = orders.filter((order) => order.status === 'IN_PRODUCTION');
  const done = orders.filter((order) => order.status === 'DONE');

  return (
    <div className="flex flex-col w-full h-full">
      <ResetModal
        visible={isResetModalVisible}
        onClose={handleCloseResetModal}
      />

      <Header
        icon={<HomeIcon className="w-8 h-8" />}
        description="Acompanhe os pedidos dos clientes"
        isDashboard
        onOpenResetModal={handleOpenResetModal}
      >
        Home
      </Header>

      {isFetching ? (
        <div className="flex items-center justify-center flex-1">
          <Spinner />
        </div>
      ) : (
        <div className="flex w-full gap-8">
          <OrdersCard
            icon="🕑"
            title="Fila de espera"
            orders={waiting}
            onOrderStatusChange={handleOrderStatusChange}
          />

          <OrdersCard
            icon="👩🏼‍🍳"
            title="Em produção"
            orders={inProduction}
            onOrderStatusChange={handleOrderStatusChange}
          />

          <OrdersCard
            icon="✅"
            title="Pronto"
            orders={done}
            onOrderStatusChange={handleOrderStatusChange}
          />
      </div>
      )}
    </div>
  );
}
