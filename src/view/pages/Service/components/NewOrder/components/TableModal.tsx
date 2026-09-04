import { FormEvent, useEffect, useState } from "react";

import { Button } from "../../../../../components/Button";
import { Input } from "../../../../../components/Input";
import { Modal } from "../../../../../components/Modal";
import { ModalOverlay } from "../../../../../components/ModalOverlay";

interface TableModalProps {
  visible: boolean;
  selectedTable: string;
  onClose(): void;
  onSave(table: string): void;
}

export function TableModal({
  visible,
  selectedTable,
  onClose,
  onSave,
}: TableModalProps) {
  const [table, setTable] = useState(selectedTable);

  // Reabrir o modal precisa mostrar a mesa que está valendo, não o que foi
  // digitado e descartado da última vez.
  useEffect(() => {
    if (visible) {
      setTable(selectedTable);
    }
  }, [visible, selectedTable]);

  if (!visible) {
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave(table.trim());
  }

  // A API recebe `table` como número; letras aqui virariam `NaN` no envio.
  const isValid = /^\d+$/.test(table.trim());

  return (
    <ModalOverlay>
      <Modal visible={visible} title="Informe a mesa" onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            name="table"
            placeholder="Número da mesa"
            inputMode="numeric"
            autoFocus
            value={table}
            onChange={event => setTable(event.target.value)}
          />

          <Button type="submit" disabled={!isValid} className="w-full">
            Salvar
          </Button>
        </form>
      </Modal>
    </ModalOverlay>
  );
}
