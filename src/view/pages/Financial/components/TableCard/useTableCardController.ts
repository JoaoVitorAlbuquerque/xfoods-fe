import { useCallback, useEffect, useState } from "react";

import { Order } from "../../../../../types/Order";

import { httpClient } from "../../../../../app/services/httpClient";

export function useTableCardController() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Order[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string | null>('');

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

  useEffect(() => {
    httpClient.get('/orders/dashboard')
      .then(({ data }) => {
        setOrders(data);
      });
  }, []);

  const resetTable = (tableNumber: number) => {
    setOrders((prevOrders) => prevOrders.filter(order => order.table !== tableNumber));
  };

  const filteredGroupedOrders = orders.filter(order =>
    order.table.toString().toLocaleLowerCase().includes(String(searchTerm)),
  );

  const groupedOrders = groupOrdersByTable(filteredGroupedOrders) || {};

  const handleOpenTableModal= useCallback((order: Order[]) => {
    setIsModalVisible(true);
    setSelectedTable(order);
  }, []);

  const handleCloseTableModal = useCallback(() => {
    setIsModalVisible(false);
    setSelectedTable(null);
  }, []);

  return {
    isModalVisible,
    handleOpenTableModal,
    handleCloseTableModal,
    resetTable,
    groupedOrders,
    selectedTable,
    searchTerm,
    setSearchTerm,
  };
}
