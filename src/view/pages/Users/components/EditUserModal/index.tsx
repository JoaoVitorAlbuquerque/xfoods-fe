import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { Modal } from "../../../../components/Modal";

import { useEditUserModalController } from "./useEditUserModalController";
import { useDeleteUserModalController } from "../DeleteUserModal/useDeleteUserModalController";

import { Lead } from "../../../../../types/Lead";

interface EditUserModalProps {
  visible: boolean;
  onClose(): void;
  lead: Lead | null;
  selectedLead: Lead | null;
}

export function EditUserModal({ visible, onClose, lead, selectedLead }: EditUserModalProps) {
  const {
    isPending,
    errors,
    handleSubmit,
    register,
  } = useEditUserModalController(onClose, selectedLead);

  const {
    isPending: isPendingDelete,
    handleDeleteUser,
  } = useDeleteUserModalController(onClose, selectedLead);

  if (!visible || !lead) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10">
      <Modal
        title="Editar Lead"
        visible={visible}
        onClose={onClose}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-8" key={lead.id}>
            <div className="space-y-2">
              <span className="text-gray-500 font-normal text-sm">Nome</span>
              <Input
                type="text"
                placeholder="Nome do usuário"
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div className="space-y-2">
              <span className="text-gray-500 font-normal text-sm">Senha</span>
              <Input
                type="text"
                placeholder="Telefone do cliente"
                {...register('number')}
                error={errors.number?.message}
              />
            </div>

            <div className="space-y-2">
              <span className="text-gray-500 font-normal text-sm">E-mail</span>
              <Input
                type="email"
                placeholder="E-mail do usuário"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div className="space-y-2">
              <span className="text-gray-500 font-normal text-sm">Endereço</span>
              <Input
                type="text"
                placeholder="Endereço do cliente"
                {...register('address')}
                error={errors.address?.message}
              />
            </div>

            {/* <div className="space-y-2">
              <span className="text-gray-500 font-normal text-sm">Cargo</span>
              <Controller
                control={control}
                name="role"
                defaultValue=""
                render={({ field: { value, onChange } }) => (
                  <RadixSelect
                    placeholder="Selecione uma categoria"
                    onChange={onChange}
                    value={value}
                    // disabled={isLoadingCategories}
                    error={errors.role?.message}
                    options={roleList.map((role) => ({
                      value: role.value,
                      label: role.label,
                    }))}
                  />
                )}
              />
            </div> */}
          </div>

          <footer className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={handleDeleteUser}
              disabled={isPending || isPendingDelete}
              className="py-3 font-bold text-red-800"
            >
              Excluir Lead
            </button>

            <Button
              isLoading={isPending}
              disabled={isPending || isPendingDelete}
            >
              Salvar Alterações
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
