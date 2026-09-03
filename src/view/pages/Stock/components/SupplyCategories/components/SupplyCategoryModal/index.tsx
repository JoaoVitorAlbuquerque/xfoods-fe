import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";

import { SupplyCategory } from "../../../../../../../types/Supply";
import { supplyCategoriesService } from "../../../../../../../app/services/supplyCategoriesService";
import { supplyCategoriesQueryKey } from "../../../../../../../app/hooks/useStockQueries";
import { toastApiError } from "../../../../../../../app/utils/toastApiError";
import { Button } from "../../../../../../components/Button";
import { Input } from "../../../../../../components/Input";
import { Modal } from "../../../../../../components/Modal";

const schema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(80, 'Nome deve ter no máximo 80 caracteres'),
});

type FormData = z.infer<typeof schema>;

interface SupplyCategoryModalProps {
  visible: boolean;
  onClose(): void;
  /** Ausente cria; presente edita. */
  category?: SupplyCategory | null;
}

export function SupplyCategoryModal({ visible, onClose, category }: SupplyCategoryModalProps) {
  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: category?.name ?? '' },
  });

  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (data: FormData) => (
      category
        ? supplyCategoriesService.update({ id: category.id, name: data.name })
        : supplyCategoriesService.create({ name: data.name })
    ),
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      await mutateAsync(data);

      queryClient.invalidateQueries({ queryKey: supplyCategoriesQueryKey });
      toast.success(category ? 'Categoria atualizada!' : 'Categoria criada!');
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao salvar a categoria!');
    }
  });

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal
        visible={visible}
        onClose={onClose}
        title={category ? 'Editar Categoria' : 'Nova Categoria de Insumo'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 sm:w-[400px]">
          <div className="space-y-2">
            <span className="text-gray-500 font-normal text-sm">Nome</span>

            <Input
              type="text"
              placeholder="Ex: Laticínios"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <footer className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="py-3 font-bold text-red-800"
            >
              Cancelar
            </button>

            <Button isLoading={isPending} className="w-full sm:w-auto">
              Salvar
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
