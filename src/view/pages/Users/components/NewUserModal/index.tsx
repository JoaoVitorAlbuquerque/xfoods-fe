import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { Modal } from "../../../../components/Modal";

import { useNewUserModalController } from "./useNewUserModalController";

interface NewUserModalProps {
  visible: boolean;
  onClose(): void;
}

export function NewUserModal({ visible, onClose }: NewUserModalProps) {
  const {
    errors,
    isPending,
    handleSubmit,
    register,
  } = useNewUserModalController(onClose);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10">
      <Modal
        title="Novo Usuário"
        visible={visible}
        onClose={onClose}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Nome"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Telefone"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Endereço"
                error={errors.address?.message}
                {...register('address')}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="email"
                placeholder="E-mail"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
          </div>

          <footer className="flex items-center justify-end mt-8">
            <Button isLoading={isPending}>
              Cadastrar Lead
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
