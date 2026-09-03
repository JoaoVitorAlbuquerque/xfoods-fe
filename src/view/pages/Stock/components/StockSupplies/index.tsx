import { StockStatus, stockStatusLabels } from "../../../../../types/Supply";
import { useSupplyCategories } from "../../../../../app/hooks/useStockQueries";
import { ContentHeader } from "../../../../components/ContentHeader";
import { Input } from "../../../../components/Input";
import { ListFeedback } from "../../../../components/ListFeedback";
import { Select } from "../../../../components/Select";
import { StockOperationModal } from "../StockOperationModal";
import { SuppliesList } from "./components/SuppliesList";
import { NewSupplyModal } from "./components/NewSupplyModal";
import { EditSupplyModal } from "./components/EditSupplyModal";
import { DeactivateSupplyModal } from "./components/DeactivateSupplyModal";
import { useStockSuppliesController } from "./useStockSuppliesController";

const statusOptions: StockStatus[] = ['NEGATIVE', 'ZERO', 'LOW', 'OVER', 'OK'];

export function StockSupplies() {
  const {
    supplies,
    isFetching,
    isError,
    refetch,
    search,
    setSearch,
    supplyCategoryId,
    setSupplyCategoryId,
    active,
    setActive,
    stockStatus,
    setStockStatus,
    isNewSupplyModalVisible,
    setIsNewSupplyModalVisible,
    supplyBeingEdited,
    setSupplyBeingEdited,
    supplyBeingDeactivated,
    setSupplyBeingDeactivated,
    operation,
    operationSupplyId,
    handleCloseOperation,
    isTogglingActive,
    handleReactivateSupply,
  } = useStockSuppliesController();

  const { activeCategories } = useSupplyCategories();

  return (
    <>
      <NewSupplyModal
        visible={isNewSupplyModalVisible}
        onClose={() => setIsNewSupplyModalVisible(false)}
      />

      {supplyBeingEdited && (
        <EditSupplyModal
          visible
          supply={supplyBeingEdited}
          onClose={() => setSupplyBeingEdited(null)}
        />
      )}

      {supplyBeingDeactivated && (
        <DeactivateSupplyModal
          visible
          supply={supplyBeingDeactivated}
          onClose={() => setSupplyBeingDeactivated(null)}
        />
      )}

      {operation && (
        <StockOperationModal
          visible
          operation={operation}
          supplyId={operationSupplyId}
          onClose={handleCloseOperation}
        />
      )}

      <ContentHeader title="Insumos" quantity={supplies.length}>
        <button
          type="button"
          onClick={() => setIsNewSupplyModalVisible(true)}
          className="pt-1 text-sm font-bold text-red-600"
        >
          Novo Insumo
        </button>
      </ContentHeader>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          type="text"
          name="search"
          placeholder="Buscar insumo"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />

        <Select
          value={supplyCategoryId}
          onChange={event => setSupplyCategoryId(event.target.value)}
        >
          <option value="">Todas as categorias</option>

          {activeCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <Select
          value={stockStatus}
          onChange={event => setStockStatus(event.target.value as StockStatus | '')}
        >
          <option value="">Todas as situações</option>

          {statusOptions.map(status => (
            <option key={status} value={status}>
              {stockStatusLabels[status]}
            </option>
          ))}
        </Select>

        <Select
          value={active}
          onChange={event => setActive(event.target.value as 'true' | 'false' | '')}
        >
          <option value="true">Somente ativos</option>
          <option value="false">Somente inativos</option>
          <option value="">Ativos e inativos</option>
        </Select>
      </div>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={supplies.length === 0}
        emptyMessage="Nenhum insumo encontrado com esses filtros."
        errorMessage="Não foi possível carregar os insumos."
        onRetry={refetch}
      >
        <SuppliesList
          supplies={supplies}
          isTogglingActive={isTogglingActive}
          onEdit={setSupplyBeingEdited}
          onDeactivate={setSupplyBeingDeactivated}
          onReactivate={handleReactivateSupply}
        />
      </ListFeedback>
    </>
  );
}
