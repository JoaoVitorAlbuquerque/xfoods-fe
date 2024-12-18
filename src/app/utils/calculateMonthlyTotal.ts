import { Order } from "../../types/Order";

export const calculateMonthlyTotal = (orders: Order[], selectedMonth: number, selectedYear: number): number => {
  // Filtrar os pedidos do mês e ano selecionados
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return (
      orderDate.getMonth() + 1 === selectedMonth && // getMonth retorna 0-11, então adicionamos +1
      orderDate.getFullYear() === selectedYear
    );
  });

  // Somar os valores de cada pedido
  const total = filteredOrders.reduce((acc, order) => {
    const orderTotal = order.products.reduce((acc, { quantity, product, size }) => {
      const productTotal = (product.price * quantity);
      const meter = size === 'METER' ? productTotal * (0.12) : 0;
      const extraLarge = size === 'EXTRA_LARGE' ? productTotal * (0.09) : 0;
      const large = size === 'LARGE' ? productTotal * (0.07) : 0;
      const mean = size === 'MEAN' ? productTotal * 0 : 0;
      const small = size === 'SMALL' ? productTotal * (-0.03) : 0;
      const tiny = size === 'TINY' ? productTotal * (-0.05) : 0;
      // return productAcc + quantity * product.price;
      return acc + productTotal + (meter || large || small || mean || tiny || extraLarge)
    }, 0);
    return acc + orderTotal;
  }, 0);

  return total;
};
