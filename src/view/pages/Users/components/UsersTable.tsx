import { Lead } from "../../../../types/Lead";

import { ActionButton } from "../../../components/ActionButton";
import { TableComponents } from "../../../components/TableElements";

import editIcon from '../../../components/icons/edit-icon.svg';
import trashIcon from '../../../components/icons/trash-icon.svg';
import eyeIcon from '../../../components/icons/eye-icon.svg';

interface UsersTableProps {
  leads: Lead[];
  onOpenEditUserModal(user: Lead): void;
  onOpenDeleteUserModal(user: Lead): void;
  onOpenOrderLeadModal(lead: Lead): void;
}

export function UsersTable({ onOpenEditUserModal, onOpenDeleteUserModal, onOpenOrderLeadModal, leads }: UsersTableProps) {
  return (
    <div className="flex-1">
      <TableComponents.Table>
        <thead>
          <tr className="bg-gray-600/20">
            <TableComponents.TableHeader>Nome</TableComponents.TableHeader>
            <TableComponents.TableHeader>Telefone</TableComponents.TableHeader>
            <TableComponents.TableHeader>Endereço</TableComponents.TableHeader>
            <TableComponents.TableHeader>E-mail</TableComponents.TableHeader>
            <TableComponents.TableHeader>Ações</TableComponents.TableHeader>
          </tr>
        </thead>

        <tbody>
          {leads.map(lead => {
            return (
              <TableComponents.TableRow key={lead.id}>
                <TableComponents.TableCell>{lead.name}</TableComponents.TableCell>
                <TableComponents.TableCell>{lead.phone}</TableComponents.TableCell>
                <TableComponents.TableCell>{lead.address}</TableComponents.TableCell>
                <TableComponents.TableCell>{lead.email}</TableComponents.TableCell>
                <TableComponents.TableCell className="flex items-center gap-4">
                    <ActionButton onClick={() => onOpenEditUserModal(lead)}>
                      <img src={editIcon} />
                    </ActionButton>

                    <ActionButton onClick={() => onOpenDeleteUserModal(lead)}>
                      <img src={trashIcon} />
                    </ActionButton>

                    <ActionButton onClick={() => onOpenOrderLeadModal(lead)}>
                      <img src={eyeIcon} />
                    </ActionButton>
                  </TableComponents.TableCell>
              </TableComponents.TableRow>
            );
          })}
        </tbody>
      </TableComponents.Table>
    </div>
  );
}
