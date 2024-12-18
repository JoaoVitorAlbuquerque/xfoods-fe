import { z } from "zod";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { leadsService } from "../../../../../app/services/leadsService";

import { CreateLeadParams } from "../../../../../app/services/leadsService/create";

const schema = z.object({
  name: z.string().min(1, 'Nome do Lead é obrigatório!'),
  phone: z.string().min(1, 'Telefone é obrigatório!'),
  address: z.string().min(1, 'Endereço é obrigatório!'),
  email: z.string().email('E-mail inválido!'),
});

type FormData = z.infer<typeof schema>;

export function useNewUserModalController(onClose: () => void) {

  const {
    control,
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (data: CreateLeadParams) => {
      // console.log('mutationFn', { data });
      return leadsService.create(data);
    },
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      // console.log({ data });
      await mutateAsync(data);

      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead criado com sucesso!');
      onClose();
      reset();
    } catch {
      toast.error('Erro ao criar o lead!');
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
