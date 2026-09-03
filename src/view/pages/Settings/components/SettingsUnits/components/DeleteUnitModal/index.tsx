import { Button } from "../../../../../../components/Button";
import { Modal } from "../../../../../../components/Modal";
import { MeasurementUnit, unitKindLabels } from "../../../../../../../types/MeasurementUnit";
import { useDeleteUnitModalController } from "./useDeleteUnitModalController";

interface DeleteUnitModalProps {
  visible: boolean;
  onClose(): void;
  unit: MeasurementUnit;
}

export function DeleteUnitModal({ visible, onClose, unit }: DeleteUnitModalProps) {
  const { handleDeleteUnit, isPending } = useDeleteUnitModalController(unit, onClose);

  if (!visible) {
    return null;
  }

  return (
    <div className="left-0 top-0 bg-black/80 backdrop-blur-sm size-full fixed flex items-center justify-center z-10">
      <Modal
        visible={visible}
        onClose={onClose}
        title="Desativar Unidade"
      >
        <div className="flex flex-col items-center gap-6 max-w-[420px]">
          <span className="text-gray-400 font-medium text-center">
            Tem certeza que deseja desativar esta unidade?
          </span>

          <div className="space-x-2 text-gray-500 font-normal text-sm">
            <strong>{unit.code}</strong>
            <span>{unit.name}</span>
            <span className="text-gray-400">({unitKindLabels[unit.kind]})</span>
          </div>

          <span className="text-xs text-gray-400 text-center">
            A unidade não é apagada: ela é referenciada por insumos, compras e
            fichas técnicas, e remover a linha apagaria o significado das
            quantidades já gravadas com ela. Ela apenas deixa de aparecer nos
            formulários, e pode ser reativada depois.
          </span>
        </div>

        <footer className="flex items-center justify-between mt-8">
          <button
            onClick={onClose}
            type="button"
            className="py-3 font-bold text-red-800"
            disabled={isPending}
          >
            Manter Unidade
          </button>

          <Button
            onClick={handleDeleteUnit}
            isLoading={isPending}
          >
            Desativar Unidade
          </Button>
        </footer>
      </Modal>
    </div>
  );
}
