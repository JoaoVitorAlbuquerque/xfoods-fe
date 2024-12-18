// import { useEffect, useState } from "react";
// import { Order } from "../../../types/Order";
// import { httpClient } from "../../../app/services/httpClient";

// export function useFinancialController() {
//   const [orders, setOrders] = useState<Order[]>([]);

//   useEffect(() => {
//     httpClient.get('/orders/dashboard')
//       .then(({ data }) => {
//         setOrders(data);
//       });
//   }, []);

//   const groupOrdersByTable = (orders: Order[]) => {
//     return orders.reduce((acc, order) => {
//       if (order.paid) return acc;

//       const { table, products } = order;

//       if (!acc[table]) {
//         acc[table] = { orders: [], products: [], total: 0 };
//       }

//       // Adiciona todos os produtos deste pedido aos produtos da mesa
//       acc[table].products.push(...products);

//       // Atualiza o total da mesa somando o valor total dos produtos do pedido
//       const orderTotal = products.reduce((sum, item) => {
//         return sum + item.quantity * item.product.price;
//       }, 0);

//       acc[table].total += orderTotal;
//       acc[table].orders.push(order);

//       return acc;
//     }, {} as Record<number, { orders: Order[]; products: Order['products']; total: number }>);
//   };

//   const groupedOrders = groupOrdersByTable(orders) || {};

//   return {
//     groupedOrders
//   };
// }
