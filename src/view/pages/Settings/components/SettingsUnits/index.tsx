import { ContentHeader } from "../../../../components/ContentHeader";
import { Spinner } from "../../../../components/Spinner";
import { UnitsTable } from "./components/UnitsTable";
import { NewUnitModal } from "./components/NewUnitModal";
import { EditUnitModal } from "./components/EditUnitModal";
import { DeleteUnitModal } from "./components/DeleteUnitModal";
import { useSettingsUnitsController } from "./useSettingsUnitsController";

export function SettingsUnits() {
  const {
    units,
    isFetching,
    isError,
    refetch,
    showInactive,
    setShowInactive,
    baseUnitCodeByKind,
    selectedUnit,
    isNewUnitModalVisible,
    isEditUnitModalVisible,
    isDeleteUnitModalVisible,
    isReactivating,
    handleOpenNewUnitModal,
    handleCloseNewUnitModal,
    handleOpenEditUnitModal,
    handleCloseEditUnitModal,
    handleOpenDeleteUnitModal,
    handleCloseDeleteUnitModal,
    handleReactivateUnit,
  } = useSettingsUnitsController();

  return (
    <>
      <NewUnitModal
        visible={isNewUnitModalVisible}
        onClose={handleCloseNewUnitModal}
      />

      {selectedUnit && (
        <EditUnitModal
          visible={isEditUnitModalVisible}
          onClose={handleCloseEditUnitModal}
          unit={selectedUnit}
        />
      )}

      {selectedUnit && (
        <DeleteUnitModal
          visible={isDeleteUnitModalVisible}
          onClose={handleCloseDeleteUnitModal}
          unit={selectedUnit}
        />
      )}

      <ContentHeader
        title="Unidades de medida"
        quantity={units.length}
      >
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-400" role="button">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={event => setShowInactive(event.target.checked)}
              className="form-checkbox rounded text-red-500 focus:ring-0"
            />

            Mostrar inativas
          </label>

          <button
            type="button"
            onClick={handleOpenNewUnitModal}
            className="text-red-600 font-bold text-sm pt-1"
          >
            Nova Unidade
          </button>
        </div>
      </ContentHeader>

      <p className="mb-6 text-sm text-gray-400">
        KG, G, L, ML e UN são unidades de sistema: seus fatores são constantes
        físicas, compartilhadas por todos os estabelecimentos, e por isso não são
        editáveis nem removíveis. Cadastre aqui só as unidades próprias do seu
        estabelecimento.
      </p>

      {isFetching && (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      )}

      {!isFetching && isError && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-600 bg-white p-10">
          <span className="text-gray-400">Não foi possível carregar as unidades.</span>

          <button
            type="button"
            onClick={() => refetch()}
            className="text-red-600 font-bold text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isFetching && !isError && units.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-gray-600 bg-white p-10">
          <span className="text-gray-400">Nenhuma unidade encontrada.</span>
        </div>
      )}

      {!isFetching && !isError && units.length > 0 && (
        <UnitsTable
          units={units}
          baseUnitCodeByKind={baseUnitCodeByKind}
          isReactivating={isReactivating}
          onOpenEditUnitModal={handleOpenEditUnitModal}
          onOpenDeleteUnitModal={handleOpenDeleteUnitModal}
          onReactivateUnit={handleReactivateUnit}
        />
      )}
    </>
  );
}
