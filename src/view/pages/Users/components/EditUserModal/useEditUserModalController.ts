import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { UpdateLeadsParams } from "../../../../../app/services/leadsService/update";

import { Lead } from "../../../../../types/Lead";

import { leadsService } from "../../../../../app/services/leadsService";

const schema = z.object({
  name: z.string().min(1, 'Nome do lead é obrigatório!'),
  number: z.string().min(1, 'Telefone é obrigatório!'),
  address: z.string().min(1, 'Endereço do lead é obrigatório!'),
  email: z.string().email('E-mail inválido!').min(1, 'E-mail é obrigatório!'),
});

type FormData = z.infer<typeof schema>;

export function useEditUserModalController(onClose: () => void, selectedLead: Lead | null) {

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: selectedLead?.name,
      number: selectedLead?.phone,
      address: selectedLead?.address,
      email: selectedLead?.email,
    },
  });

  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (data: UpdateLeadsParams) => {
      return leadsService.update(data);
    },
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      await mutateAsync({
        ...data,
        id: selectedLead!.id,
      });

      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Categoria editada com sucesso!');
      onClose();
    } catch {
      toast.error('Erro ao salvar as alterações!');
    }
  });

  return {
    control,
    errors,
    isPending,
    register,
    handleSubmit,
  };
}
