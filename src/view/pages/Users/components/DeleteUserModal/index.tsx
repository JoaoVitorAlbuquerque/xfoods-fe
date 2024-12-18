import { Lead } from "../../../../../types/Lead";

import { Button } from "../../../../components/Button";
import { Input } from "../../../../components/Input";
import { Modal } from "../../../../components/Modal";

import { useDeleteUserModalController } from "./useDeleteUserModalController";

interface DeleteUserModalProps {
  visible: boolean;
  onCloseDeleteUserModal(): void;
  lead: Lead | null;
  selectedLead: Lead | null;
}

export function DeleteUserModal({ visible, onCloseDeleteUserModal, lead, selectedLead }: DeleteUserModalProps) {
  const {
    isPending,
    handleDeleteUser,
  } = useDeleteUserModalController(onCloseDeleteUserModal, selectedLead);

  if (!visible || !lead) {
    return null;
  }

  // const role = user.role === 'ADMIN' ? 'Admin' : 'Garçom';

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10">
      <Modal
        visible={visible}
        onClose={onCloseDeleteUserModal}
        title="Excluir Lead"
      >
        <div className="space-y-8">

          <span
            className="flex items-center justify-center text-gray-500 font-medium"
          >
            Tem certeza que deseja excluir o lead?
          </span>

          <div className="space-y-2">
            <Input
              name="name"
              placeholder="Nome do usuário"
              onChange={() => ('')}
              value={lead.name}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Input
              name="number"
              placeholder="Telefone do lead"
              onChange={() => ('')}
              value={lead.phone}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Input
              name="address"
              placeholder="Endereço do lead"
              onChange={() => ('')}
              value={lead.address}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Input
              name="email"
              placeholder="E-mail do usuário"
              onChange={() => ('')}
              value={lead.email}
              disabled
            />
          </div>

          {/* <div className="space-y-2">
            <Input
              name="role"
              placeholder="Cargo do usuário"
              onChange={() => ('')}
              value={lead}
              disabled
            />
          </div> */}
        </div>

        <footer className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={onCloseDeleteUserModal}
            className="py-3 font-bold text-red-800"
          >
            Manter Lead
          </button>

          <Button
            onClick={handleDeleteUser}
            isLoading={isPending}
          >
            Excluir Lead
          </Button>
        </footer>
      </Modal>
    </div>
  );
}
