import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Lead } from "../../../types/Lead";
import { leadsService } from "../../../app/services/leadsService";

export function useUsersController() {
  const [isNewLeadModalVisible, setIsNewLeadModalVisible] = useState(false);
  const [isEditLeadModalVisible, setIsEditLeadModalVisible] = useState(false);
  const [isDeleteLeadModalVisible, setIsDeleteLeadModalVisible] = useState(false);
  const [isOrderLeadModalVisible, setIsOrderLeadModalVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  // const [selectedOrderLead, setSelectedOrderLead] = useState<Lead[] | null>(null);

  function handleOpenNewLeadModal() {
    setIsNewLeadModalVisible(true);
  }

  function handleCloseNewLeadModal() {
    setIsNewLeadModalVisible(false);
  }

  const handleOpenEditLeadModal = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsEditLeadModalVisible(true);
  }, []);

  const handleCloseEditLeadModal = useCallback(() => {
    setSelectedLead(null);
    setIsEditLeadModalVisible(false);
  }, []);

  const handleOpenOrderLeadModal = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsOrderLeadModalVisible(true);
  }, []);

  const handleCloseOrderLeadModal = useCallback(() => {
    setSelectedLead(null);
    setIsOrderLeadModalVisible(false);
  }, []);

  function handleOpenDeleteLeadModal(lead: Lead) {
    setSelectedLead(lead);
    setIsDeleteLeadModalVisible(true);
  }

  function handleCloseDeleteLeadModal() {
    setSelectedLead(null);
    setIsDeleteLeadModalVisible(false);
  }

  const { data = [], isFetching } = useQuery({
    queryKey: ['leads'],
    queryFn: leadsService.getAll,
  });

  // function useOrdersByLead(leadId: string) {
  //   return useQuery<Order[], Error>({
  //     queryKey: ['orders', leadId],
  //     queryFn: () => ordersService.getOrdersByLead(leadId),
  //     enabled: !!leadId,
  //   });
  // }

  return {
    isNewLeadModalVisible,
    isEditLeadModalVisible,
    isDeleteLeadModalVisible,
    selectedLead,
    handleOpenNewLeadModal,
    handleCloseNewLeadModal,
    handleOpenEditLeadModal,
    handleCloseEditLeadModal,
    handleOpenDeleteLeadModal,
    handleCloseDeleteLeadModal,
    data,
    isFetching,
    handleOpenOrderLeadModal,
    handleCloseOrderLeadModal,
    isOrderLeadModalVisible,
  };
}
