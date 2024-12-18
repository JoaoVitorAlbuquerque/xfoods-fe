import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "../../../../../app/services/ordersService";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { UpdateOrdersParams } from "../../../../../app/services/ordersService/updatePaid";

import { Order } from "../../../../../types/Order";
import { leadsService } from "../../../../../app/services/leadsService";
import { associateOrdersWithLead } from "../../../../../app/services/ordersService/associateOrdersWithLead";

// export function useTableModalController(selectedTable: Order[] | null, orderIds: Order[] | null, onClose: () => void) {
export function useTableModalController(selectedTable: Order[] | null, onClose: () => void) {
  const [leadSelected, setLeadSelected] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  console.log({ selectedTable });

  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (data: UpdateOrdersParams) => {
      return ordersService.updatePaid(data);
    },
  });

  const { data = [], isFetching, error } = useQuery({
    queryKey: ['leads'],
    queryFn: leadsService.getAll,
  });

  // Filtrando os itens de acordo com o termo de busca
  const filteredLeads = data?.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.phone.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // const filteredLeads = searchTerm === ''
  //   ? data
  //   : data?.filter(lead =>
  //   lead.name.toLowerCase().includes(searchTerm.toLowerCase()),
  // );

  function onChangeLead(value: string) {
    setLeadSelected(value);
  }

  const handleAssociateLead = useCallback(async (orderIds: string[] | undefined) => {
    try {
      await associateOrdersWithLead(orderIds, leadSelected);
    }
    catch (error) {
      console.log(error);
    }
  }, [leadSelected]);

  // const orderIds = Object.entries(orderIds).map(([, { orders }]) => orders.map(order => order.id)).flat();
  // console.log({ orderIds });

  const handleUpdatePaidOrders = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      table: selectedTable?.[0]?.table,
      paid: true,
      orderIds: selectedTable,
    };

    console.log('Payload enviado:', payload);

    try {
      await mutateAsync(payload);
      await handleAssociateLead(selectedTable?.map((order) => order.id));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pedidos pagos com sucesso!');
      onClose();
    } catch {
      toast.error('Erro ao pagar o pedido!');
    }
  }, [mutateAsync, onClose, selectedTable, handleAssociateLead, queryClient]);

  return {
    isPending,
    handleUpdatePaidOrders,
    data,
    isFetching,
    error,
    onChangeLead,
    leadSelected,
    handleAssociateLead,
    filteredLeads,
    searchTerm,
    setSearchTerm,
    setLeadSelected,
  };
}
