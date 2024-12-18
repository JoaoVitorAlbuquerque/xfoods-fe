import { ContentHeader } from "../../components/ContentHeader";
import { Header } from "../../components/Header";
import { UserIcon } from "../../components/icons/UserIcon";
import { UsersTable } from "./components/UsersTable";
import { NewUserModal } from "./components/NewUserModal";
import { EditUserModal } from "./components/EditUserModal";
import { DeleteUserModal } from "./components/DeleteUserModal";

import { useUsersController } from "./useUsersController";
import { Spinner } from "../../components/Spinner";
import { LeadOrdersModal } from "./components/LeadOrdersModal";

export function Users() {
  const {
    selectedLead,
    isNewLeadModalVisible,
    isEditLeadModalVisible,
    isDeleteLeadModalVisible,
    handleCloseDeleteLeadModal,
    handleCloseEditLeadModal,
    handleCloseNewLeadModal,
    handleOpenDeleteLeadModal,
    handleOpenEditLeadModal,
    handleOpenNewLeadModal,
    data: leads,
    isFetching,
    isOrderLeadModalVisible,
    handleCloseOrderLeadModal,
    handleOpenOrderLeadModal,
  } = useUsersController();

  return (
    <>
      <NewUserModal
        visible={isNewLeadModalVisible}
        onClose={handleCloseNewLeadModal}
      />

      {selectedLead && (
        <EditUserModal
          visible={isEditLeadModalVisible}
          onClose={handleCloseEditLeadModal}
          lead={selectedLead}
          selectedLead={selectedLead}
        />
      )}

      <DeleteUserModal
        visible={isDeleteLeadModalVisible}
        onCloseDeleteUserModal={handleCloseDeleteLeadModal}
        lead={selectedLead}
        selectedLead={selectedLead}
      />

      <LeadOrdersModal
        visible={isOrderLeadModalVisible}
        selectedLead={selectedLead}
        onCloseLeadOrderModal={handleCloseOrderLeadModal}
      />

      <Header
        icon={<UserIcon className="w-8 h-8" />}
        description="Cadastre e gerencie seus Leads"
      >
        Leads
      </Header>

      <ContentHeader
        title="Leads"
        quantity={leads.length}
      >
        <button
          type="button"
          onClick={handleOpenNewLeadModal}
          className="text-red-600 font-bold text-sm pt-1"
        >
          Novo Lead
        </button>
      </ContentHeader>

      {isFetching ? (
        <div className="flex items-center justify-center flex-1">
          <Spinner />
        </div>
      ) : (
        <UsersTable
          leads={leads}
          onOpenEditUserModal={handleOpenEditLeadModal}
          onOpenDeleteUserModal={handleOpenDeleteLeadModal}
          onOpenOrderLeadModal={handleOpenOrderLeadModal}
        />
      )}
    </>
  );
}
