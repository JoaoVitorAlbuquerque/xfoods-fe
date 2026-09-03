import { NumericFormat } from "react-number-format";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { formatQuantity } from "../../../../../../../app/utils/formatQuantity";
import { Button } from "../../../../../../components/Button";
import { Input } from "../../../../../../components/Input";
import { ListFeedback } from "../../../../../../components/ListFeedback";
import { Modal } from "../../../../../../components/Modal";
import { useNewStockCountModalController } from "./useNewStockCountModalController";

interface NewStockCountModalProps {
  visible: boolean;
  onClose(): void;
}

export function NewStockCountModal({ visible, onClose }: NewStockCountModalProps) {
  const {
    supplies,
    isFetching,
    isError,
    refetch,
    search,
    setSearch,
    note,
    setNote,
    countedAt,
    setCountedAt,
    countedBySupply,
    handleCountedChange,
    countedCount,
    handleSubmit,
    isPending,
  } = useNewStockCountModalController(onClose);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10 p-4">
      <Modal visible={visible} onClose={onClose} title="Novo Inventário">
        <div className="space-y-5 sm:w-[520px]">
          <p className="flex items-start gap-2 text-xs text-gray-400">
            <InfoCircledIcon className="mt-0.5 shrink-0" />

            Informe quanto foi encontrado de cada insumo. Deixe em branco o que
            não foi contado. Nada afeta o estoque até o inventário ser aplicado —
            o saldo comparado é o do instante da aplicação, não o de agora.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="relative">
              <span className="absolute left-3 top-2 text-xs text-gray-700">
                Data da contagem
              </span>

              <input
                type="date"
                value={countedAt}
                onChange={event => setCountedAt(event.target.value)}
                className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 pt-4 text-gray-800 outline-none transition-all focus:border-gray-800"
              />
            </label>

            <Input
              type="text"
              name="note"
              placeholder="Observação (opcional)"
              value={note}
              onChange={event => setNote(event.target.value)}
            />
          </div>

          <Input
            type="text"
            name="search"
            placeholder="Buscar insumo"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />

          <div className="max-h-[40vh] overflow-y-auto rounded-lg border border-gray-600">
            <ListFeedback
              isLoading={isFetching}
              isError={isError}
              isEmpty={supplies.length === 0}
              emptyMessage="Nenhum insumo ativo encontrado."
              onRetry={refetch}
            >
              <ul className="divide-y divide-gray-600/40">
                {supplies.map(supply => (
                  <li
                    key={supply.id}
                    className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-medium text-gray-500">
                        {supply.name}
                      </span>

                      <span className="text-xs text-gray-400">
                        Sistema: {formatQuantity(supply.currentStock)} {supply.baseUnit.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <NumericFormat
                        value={countedBySupply[supply.id] ?? ''}
                        onValueChange={(values, sourceInfo) => {
                          if (sourceInfo.source === 'event') {
                            handleCountedChange(supply.id, values.value);
                          }
                        }}
                        valueIsNumericString
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        decimalScale={4}
                        placeholder="Contado"
                        className="h-11 w-full rounded-lg border border-gray-600 px-3 text-gray-800 outline-none transition-all focus:border-gray-800 sm:w-32"
                      />

                      <span className="text-xs font-medium text-gray-400">
                        {supply.baseUnit.code}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </ListFeedback>
          </div>

          <footer className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-400">
              {countedCount} insumo(s) contado(s)
            </span>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="py-3 font-bold text-red-800"
              >
                Cancelar
              </button>

              <Button
                onClick={handleSubmit}
                isLoading={isPending}
                disabled={countedCount === 0}
                className="w-full sm:w-auto"
              >
                Registrar Contagem
              </Button>
            </div>
          </footer>
        </div>
      </Modal>
    </div>
  );
}
