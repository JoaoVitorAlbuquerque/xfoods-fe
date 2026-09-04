import { ContentHeader } from "../../../../components/ContentHeader";
import { Input } from "../../../../components/Input";
import { ListFeedback } from "../../../../components/ListFeedback";
import { DeliverOrderModal } from "./components/DeliverOrderModal";
import { ServiceOrderCard } from "./components/ServiceOrderCard";
import { useServiceOrdersController } from "./useServiceOrdersController";

export function ServiceOrders() {
  const {
    orders,
    isFetching,
    isError,
    refetch,
    searchTerm,
    setSearchTerm,
    orderToDeliver,
    handleOpenDeliverModal,
    handleCloseDeliverModal,
    handleConfirmDelivery,
    isMarkingAsRead,
  } = useServiceOrdersController();

  return (
    <>
      <DeliverOrderModal
        order={orderToDeliver}
        isLoading={isMarkingAsRead}
        onClose={handleCloseDeliverModal}
        onConfirm={handleConfirmDelivery}
      />

      <ContentHeader title="Em andamento" quantity={orders.length} />

      <div className="space-y-4">
        <Input
          name="table"
          placeholder="Filtre pelo número da mesa"
          inputMode="numeric"
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
        />

        <ListFeedback
          isLoading={isFetching}
          isError={isError}
          isEmpty={orders.length === 0}
          emptyMessage={
            searchTerm
              ? 'Nenhum pedido nessa mesa.'
              : 'Nenhum pedido em andamento no momento.'
          }
          errorMessage="Não foi possível carregar os pedidos."
          onRetry={refetch}
        >
          {/* Uma coluna no celular; a partir de `md` os cards ficam lado a lado. */}
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orders.map(order => (
              <ServiceOrderCard
                key={order.id}
                order={order}
                onDeliver={handleOpenDeliverModal}
              />
            ))}
          </ul>
        </ListFeedback>
      </div>
    </>
  );
}
