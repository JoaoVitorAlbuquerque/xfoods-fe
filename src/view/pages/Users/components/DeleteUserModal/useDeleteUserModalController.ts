import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";

import { Lead } from "../../../../../types/Lead";

import { leadsService } from "../../../../../app/services/leadsService";

export function useDeleteUserModalController(onCloseDeleteUserModal: () => void, selectedLead: Lead | null) {
  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (leadId: string) => {
      return leadsService.remove(leadId);
    },
  });

  const handleDeleteUser = useCallback(async () => {
    try {
      await mutateAsync(selectedLead!.id);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deletado com sucesso!');
      onCloseDeleteUserModal();
    } catch {
      toast.error('Erro ao deletar o lead!');
    }
  }, [selectedLead, mutateAsync, onCloseDeleteUserModal, queryClient]);

  return {
    isPending,
    handleDeleteUser,
  };
}
