import { useEffect, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
import socketIo from 'socket.io-client';

// import { ordersService } from "../../../app/services/ordersService";

import { Order } from "../../../types/Order";
// import { httpClient } from "../../../app/services/httpClient";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "../../../app/services/ordersService";

export function useDashboard() {
  // const [orders, setOrders] = useState<Order[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);

  const queryClient = useQueryClient();
  const { data = [], isFetching } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersService.getAllDashboard,
  });

  useEffect(() => {
    const socket = socketIo(import.meta.env.VITE_API_URL, {
      transports: ['websocket'],
    });

    socket.on('orderCreated', (newOrder) => {
      queryClient.setQueryData(['orders'], (oldOrders: Order[] | undefined) => {
        if(!oldOrders) return [newOrder];
        return [...oldOrders, newOrder];
      });
    });

    return () => {
      socket.off('orderCreated');  // Remove o listener
      socket.disconnect();       // Desconecta o socket
    };
  }, [queryClient]);

  function handleOpenResetModal() {
    setIsResetModalVisible(true);
  }

  function handleCloseResetModal() {
    setIsResetModalVisible(false);
  }

  function handleOrderStatusChange(orderId: string, status: Order['status']) {
    queryClient.setQueryData(['orders'], (prevState: Order[]) => prevState.map((order) => (
      order.id === orderId
        ? { ...order, status }
        : order
    )));
  }

  // function handleOrderStatusChange(orderId: string, status: Order['status']) {
  //   setOrders((prevState) => prevState.map((order) => (
  //     order._id === orderId
  //       ? { ...order, status }
  //       : order
  //   )));
  // }

  // useEffect(() => {
  //   const socket = socketIo(import.meta.env.VITE_API_URL, {
  //     transports: ['websocket'],
  //   });

  //   socket.on('order@new', (order) => {
  //     setOrders(prevState => prevState.concat(order));
  //   });

  //   return () => {
  //     socket.off('order@new');  // Remove o listener
  //     socket.disconnect();       // Desconecta o socket
  //   };
  // }, []);

  // useEffect(() => {
  //   httpClient.get('/orders/dashboard')
  //     .then(({ data }) => {
  //       setIsLoading(true);
  //       setOrders(data);
  //     })
  //     .finally(() => {
  //       setIsLoading(false);
  //     });
  // }, []);

  return {
    isResetModalVisible,
    data,
    isFetching,
    handleOpenResetModal,
    handleCloseResetModal,
    handleOrderStatusChange,
  };
}
