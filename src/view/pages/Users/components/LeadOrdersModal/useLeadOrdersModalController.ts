import { useQuery } from "@tanstack/react-query";

import { Lead } from "../../../../../types/Lead";
// import { ordersService } from "../../../../../app/services/ordersService";
import { leadsService } from "../../../../../app/services/leadsService";

export function useLeadOrdersModalController(selectedLead: Lead | null) {
  console.log('useLeadOrdersModalController', selectedLead?.id);

  // const { data: orders = [], isFetching: isFetchingOrders } = useQuery({
  //   queryKey: ['orders'],
  //   queryFn: () => ordersService.getOrdersByLead(selectedLead!.id),
  // });

  const { data = [], isFetching } = useQuery({
      queryKey: ['leads-orders'],
      queryFn: () => leadsService.getAllOrdersByLead(selectedLead!.id),
  });
  console.log('data: ', {  });

  return {
    data,
    isFetching,
  };
}
