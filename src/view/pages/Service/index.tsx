import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Header } from "../../components/Header";
import { ServiceIcon } from "../../components/icons/ServiceIcon";
import { SectionTabs } from "../../components/SectionTabs";
import { ordersService } from "../../../app/services/ordersService";

export function Service() {
  // O mesmo `queryKey: ['orders']` do Dashboard: as duas telas leem
  // `GET /orders/dashboard`, então compartilham cache e se atualizam juntas.
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersService.getAllDashboard,
  });

  // A contagem que o sininho do aplicativo mostrava: pedidos ainda não
  // entregues na mesa.
  const pendingDelivery = orders.filter(order => (
    !order.read && order.status !== 'CANCELED'
  )).length;

  const tabs = [
    { to: '/service', label: 'Novo pedido', end: true },
    { to: '/service/orders', label: 'Pedidos', badge: pendingDelivery },
  ];

  return (
    <>
      <Header
        icon={<ServiceIcon className="w-8 h-8" />}
        description="Monte a comanda da mesa e acompanhe o que já saiu da cozinha"
      >
        Atendimento
      </Header>

      <div className="flex-1">
        <SectionTabs tabs={tabs} />

        <Outlet />
      </div>
    </>
  );
}
