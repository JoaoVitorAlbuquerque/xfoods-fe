import { useCallback, useEffect, useRef, useState } from "react";
import { Order } from "../../../../../types/Order";
import { useQuery } from "@tanstack/react-query";
import { historyService } from "../../../../../app/services/historyService";

export function useHistoryOrderTableController() {
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [isSticky, setIsSticky] = useState(false);
  const stickyRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (stickyRef.current) {
        // Verifica se o topo do elemento atingiu a posição sticky
        setIsSticky(window.scrollY >= stickyRef.current.offsetTop);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // const [filters, setFilters] = useState<HistoryFilters>({
  //   month: new Date().getMonth(),
  //   year: new Date().getFullYear(),
  // });

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: orders = [], isFetching, refetch: refetchHistory } = useQuery({
    queryKey: ['history'],
    queryFn: () => historyService.getAll({ month: selectedMonth, year: selectedYear }),
  });

  // const calculateMonthlyTotal = (orders: Order[], selectedMonth: number, selectedYear: number): number => {
  //   // Filtrar os pedidos do mês e ano selecionados
  //   const filteredOrders = orders.filter(order => {
  //     const orderDate = new Date(order.createdAt);
  //     return (
  //       orderDate.getMonth() + 1 === selectedMonth && // getMonth retorna 0-11, então adicionamos +1
  //       orderDate.getFullYear() === selectedYear
  //     );
  //   });

  //   // Somar os valores de cada pedido
  //   const total = filteredOrders.reduce((acc, order) => {
  //     const orderTotal = order.products.reduce((acc, { quantity, product, size }) => {
  //       const productTotal = (product.price * quantity);
  //       const meter = size === 'METER' ? productTotal * (0.12) : 0;
  //       const extraLarge = size === 'EXTRA_LARGE' ? productTotal * (0.09) : 0;
  //       const large = size === 'LARGE' ? productTotal * (0.07) : 0;
  //       const mean = size === 'MEAN' ? productTotal * 0 : 0;
  //       const small = size === 'SMALL' ? productTotal * (-0.03) : 0;
  //       const tiny = size === 'TINY' ? productTotal * (-0.05) : 0;
  //       // return productAcc + quantity * product.price;
  //       return acc + productTotal + (meter || large || small || mean || tiny || extraLarge)
  //     }, 0);
  //     return acc + orderTotal;
  //   }, 0);

  //   return total;
  // };

  function handleChangeMonth(step: number) {
    setSelectedMonth(prevState => prevState + step);
  }

  function handleChangeYear(step: number) {
    setSelectedYear(prevState => prevState + step);
  }

  const handleApplyFilters = useCallback(({ month, year }: { month: number; year: number }) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    console.log({ month, year });
  }, []);

  useEffect(() => {
    refetchHistory();
  }, [selectedMonth, selectedYear, refetchHistory]); // Está fazendo três requests para api quando é clicado na rota de history

  // function separator(products: string[]) {
  //   return products.slice(0, -1).join(', ') + (products.length > 1 ? ' & ': '') + products.slice(-1);
  // }
  function separator(products: string[]) {
    return products.length > 3 ? products.slice(0, 3).join(', ') + '...' : products.join(', ');
  }

  function handleOpenHistoryModal(order: Order) {
    setIsHistoryModalVisible(true);
    setSelectedOrder(order);
  }

  function handleCloseHistoryModal() {
    setIsHistoryModalVisible(false);
    setSelectedOrder(null);
  }

  function handleOpenFilterModal() {
    setIsFilterModalVisible(true);
  }

  function handleCloseFilterModal() {
    setIsFilterModalVisible(false);
  }

  return {
    isHistoryModalVisible,
    selectedOrder,
    selectedDate,
    setSelectedDate,
    separator,
    handleOpenHistoryModal,
    handleCloseHistoryModal,
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
  };
}
