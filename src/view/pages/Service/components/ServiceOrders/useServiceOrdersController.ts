import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { ordersService } from "../../../../../app/services/ordersService";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { Order } from "../../../../../types/Order";

export function useServiceOrdersController() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [orderToDeliver, setOrderToDeliver] = useState<Order | null>(null);

  const {
    data: orders = [],
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersService.getAllDashboard,
  });

  const { mutateAsync: markAsRead, isPending: isMarkingAsRead } = useMutation({
    mutationFn: ordersService.markAsRead,
  });

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim();

    if (!term) {
      return orders;
    }

    return orders.filter(order => String(order.table).includes(term));
  }, [orders, searchTerm]);

  function handleOpenDeliverModal(order: Order) {
    setOrderToDeliver(order);
  }

  function handleCloseDeliverModal() {
    setOrderToDeliver(null);
  }

  async function handleConfirmDelivery() {
    if (!orderToDeliver) {
      return;
    }

    try {
      await markAsRead(orderToDeliver.id);
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      toast.success(`Pedido da mesa ${orderToDeliver.table} marcado como entregue.`);
      handleCloseDeliverModal();
    } catch (error) {
      toastApiError(error, 'Não foi possível marcar o pedido como entregue.');
    }
  }

  return {
    orders: filteredOrders,
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
  };
}
