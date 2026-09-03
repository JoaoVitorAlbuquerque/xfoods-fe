import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { StockOperationModal } from "../StockOperationModal";
import { StockPanelList } from "./components/StockPanelList";
import { useStockPanelController } from "./useStockPanelController";

const operationButtons = [
  { operation: 'ENTRY', label: 'Entrada' },
  { operation: 'EXIT', label: 'Saída' },
  { operation: 'LOSS', label: 'Perda' },
  { operation: 'ADJUSTMENT', label: 'Ajuste' },
] as const;

export function StockPanel() {
  const {
    items,
    summary,
    isFetching,
    isError,
    refetch,
    onlyAlerts,
    setOnlyAlerts,
    operation,
    operationSupplyId,
    handleOpenOperation,
    handleCloseOperation,
  } = useStockPanelController();

  const counters = [
    { label: 'Negativo', value: summary?.negative ?? 0, className: 'text-red-900' },
    { label: 'Zerado', value: summary?.zero ?? 0, className: 'text-red-800' },
    { label: 'Abaixo do mínimo', value: summary?.low ?? 0, className: 'text-yellow-800' },
    { label: 'Acima do máximo', value: summary?.over ?? 0, className: 'text-blue-800' },
  ];

  return (
    <>
      {operation && (
        <StockOperationModal
          visible
          operation={operation}
          supplyId={operationSupplyId}
          onClose={handleCloseOperation}
        />
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {counters.map(counter => (
          <div key={counter.label} className="rounded-lg border border-gray-600 bg-white p-4">
            <span className="block text-xs text-gray-400">{counter.label}</span>

            <strong className={cn('text-2xl font-bold', counter.className)}>
              {counter.value}
            </strong>
          </div>
        ))}

        <div className="col-span-2 rounded-lg border border-gray-600 bg-white p-4 lg:col-span-1">
          <span className="block text-xs text-gray-400">Valor em estoque</span>

          <strong className="text-2xl font-bold text-gray-500">
            {formatCurrency(summary?.totalValue ?? 0)}
          </strong>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {operationButtons.map(button => (
          <button
            key={button.operation}
            type="button"
            onClick={() => handleOpenOperation(button.operation)}
            className="rounded-full border border-gray-600 bg-white px-4 py-2 text-sm font-medium text-gray-500"
          >
            {button.label}
          </button>
        ))}
      </div>

      <ContentHeader title="Posição de estoque" quantity={items.length}>
        <label className="flex items-center gap-2 text-sm text-gray-400" role="button">
          <input
            type="checkbox"
            checked={onlyAlerts}
            onChange={event => setOnlyAlerts(event.target.checked)}
            className="rounded text-red-500 focus:ring-0"
          />

          Só o que precisa de atenção
        </label>
      </ContentHeader>

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={items.length === 0}
        emptyMessage={
          onlyAlerts
            ? 'Nenhum insumo precisando de atenção.'
            : 'Nenhum insumo ativo cadastrado ainda.'
        }
        errorMessage="Não foi possível carregar a posição de estoque."
        onRetry={refetch}
      >
        <StockPanelList items={items} onOperate={handleOpenOperation} />
      </ListFeedback>
    </>
  );
}
