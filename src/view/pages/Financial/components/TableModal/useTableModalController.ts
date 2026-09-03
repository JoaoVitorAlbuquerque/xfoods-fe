import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "../../../../../app/services/ordersService";
import { useCallback, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UpdateOrdersParams } from "../../../../../app/services/ordersService/updatePaid";

import { Order } from "../../../../../types/Order";
import { PaidResult } from "../../../../../types/OrderStock";
import { leadsService } from "../../../../../app/services/leadsService";
import { associateOrdersWithLead } from "../../../../../app/services/ordersService/associateOrdersWithLead";
import { useInvalidateStock } from "../../../../../app/hooks/useStockQueries";
import { getApiErrorMessage } from "../../../../../app/utils/getApiErrorMessage";
import { toastApiError } from "../../../../../app/utils/toastApiError";

// export function useTableModalController(selectedTable: Order[] | null, orderIds: Order[] | null, onClose: () => void) {
export function useTableModalController(selectedTable: Order[] | null, onClose: () => void) {
  const [leadSelected, setLeadSelected] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  /** Retorno do pagamento quando ele traz avisos (prato sem ficha, custo faltando). */
  const [paidResult, setPaidResult] = useState<PaidResult | null>(null);
  /** 409: faltou insumo e a conta NÃO foi fechada. */
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

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

  const invalidateStock = useInvalidateStock();

  const handleUpdatePaidOrders = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setConflictMessage(null);

    const payload = {
      table: selectedTable?.[0]?.table,
      paid: true,
      orderIds: selectedTable,
    };

    try {
      const result = await mutateAsync(payload);

      await handleAssociateLead(selectedTable?.map((order) => order.id));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // O pagamento deu baixa no estoque: saldo, extrato e painel mudaram.
      invalidateStock();

      // Com avisos, a tela precisa mostrá-los antes de sumir — são eles que
      // dizem que o custo desta venda não é confiável.
      if (result.alerts.length > 0) {
        setPaidResult(result);
        return;
      }

      toast.success(
        `Pedidos pagos com sucesso! ${result.stockMovements} movimentação(ões) de estoque geradas.`,
      );
      onClose();
    } catch (error) {
      // 409 é falta de insumo: a transação inteira voltou atrás e o pagamento
      // não foi confirmado. Não pode virar um toast vermelho genérico.
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setConflictMessage(getApiErrorMessage(error, 'Estoque insuficiente para fechar a conta.'));
        return;
      }

      toastApiError(error, 'Erro ao pagar o pedido!');
    }
  }, [mutateAsync, onClose, selectedTable, handleAssociateLead, queryClient, invalidateStock]);

  /** Fecha o aviso e, quando a conta foi de fato fechada, encerra o modal. */
  const handleCloseSaleResult = useCallback(() => {
    const wasPaid = Boolean(paidResult);

    setPaidResult(null);
    setConflictMessage(null);

    if (wasPaid) {
      onClose();
    }
  }, [paidResult, onClose]);

  return {
    isPending,
    handleUpdatePaidOrders,
    paidResult,
    conflictMessage,
    handleCloseSaleResult,
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
