import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";

import { Supplier } from "../../../../../../../types/Supplier";
import { suppliersService } from "../../../../../../../app/services/suppliersService";
import { suppliersQueryKey } from "../../../../../../../app/hooks/usePurchaseQueries";
import { toastApiError } from "../../../../../../../app/utils/toastApiError";
import { Button } from "../../../../../../components/Button";
import { Input } from "../../../../../../components/Input";
import { Modal } from "../../../../../../components/Modal";

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(120, 'Nome deve ter no máximo 120 caracteres'),
  document: z.string().max(30, 'Documento deve ter no máximo 30 caracteres').optional(),
  phone: z.string().max(30, 'Telefone deve ter no máximo 30 caracteres').optional(),
  email: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  notes: z.string().max(500, 'Observação deve ter no máximo 500 caracteres').optional(),
});

type FormData = z.infer<typeof schema>;

interface SupplierModalProps {
  visible: boolean;
  onClose(): void;
  /** Ausente cria; presente edita. */
  supplier?: Supplier | null;
}

export function SupplierModal({ visible, onClose, supplier }: SupplierModalProps) {
  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: supplier?.name ?? '',
      document: supplier?.document ?? '',
      phone: supplier?.phone ?? '',
      email: supplier?.email ?? '',
      notes: supplier?.notes ?? '',
    },
  });

  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (data: FormData) => {
      // Campo vazio vira ausência: um e-mail em branco seria recusado pelo
      // IsEmail, e um documento em branco só sujaria o cadastro.
      const payload = {
        name: data.name,
        ...(data.document?.trim() ? { document: data.document.trim() } : {}),
        ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
        ...(data.email?.trim() ? { email: data.email.trim() } : {}),
        ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
      };

      return supplier
        ? suppliersService.update({ id: supplier.id, ...payload })
        : suppliersService.create(payload);
    },
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      await mutateAsync(data);

      queryClient.invalidateQueries({ queryKey: suppliersQueryKey });
      toast.success(supplier ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado!');
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao salvar o fornecedor!');
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
        title={supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
      >
        <form onSubmit={handleSubmit} className="space-y-5 sm:w-[440px]">
          <div className="space-y-2">
            <span className="text-sm font-normal text-gray-500">Nome</span>

            <Input
              type="text"
              placeholder="Ex: Distribuidora Central"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-normal text-gray-500">CNPJ / CPF (opcional)</span>

              <Input
                type="text"
                placeholder="Ex: 12.345.678/0001-90"
                error={errors.document?.message}
                {...register('document')}
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-normal text-gray-500">Telefone (opcional)</span>

              <Input
                type="text"
                placeholder="Ex: (11) 99999-0000"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-normal text-gray-500">E-mail (opcional)</span>

            <Input
              type="email"
              placeholder="Ex: vendas@fornecedor.com.br"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-normal text-gray-500">Observação (opcional)</span>

            <Input
              type="text"
              placeholder="Ex: entrega às terças"
              error={errors.notes?.message}
              {...register('notes')}
            />
          </div>

          <footer className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
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
