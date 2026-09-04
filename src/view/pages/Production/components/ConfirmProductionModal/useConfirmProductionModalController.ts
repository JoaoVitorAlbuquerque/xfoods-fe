import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

import { productionService } from "../../../../../app/services/productionService";
import { useInvalidateProduction } from "../../../../../app/hooks/useProductionQueries";
import { getApiErrorMessage } from "../../../../../app/utils/getApiErrorMessage";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { ProductionOrder, ProductionUnit } from "../../../../../types/Production";

/**
 * Conversão local só para a prévia. As duas unidades vêm da resposta com
 * `factorToBase`, e a API já garantiu que são da mesma grandeza quando a ficha
 * ganhou o insumo de saída — quem converte o valor gravado é o servidor.
 */
function toBaseUnit(quantity: number, from: ProductionUnit, base: ProductionUnit) {
  if (!from.factorToBase || !base.factorToBase) {
    return quantity;
  }

  return (quantity * from.factorToBase) / base.factorToBase;
}

export function useConfirmProductionModalController(
  order: ProductionOrder,
  onClose: () => void,
) {
  const baseUnit = order.outputSupply.baseUnit;
  const yieldUnit = order.recipe.yieldUnit ?? baseUnit;

  /** Unidades que fazem sentido informar: a da ficha e a base do subproduto. */
  const unitOptions = useMemo(() => (
    yieldUnit.id === baseUnit.id ? [baseUnit] : [yieldUnit, baseUnit]
  ), [yieldUnit, baseUnit]);

  const [unitCode, setUnitCode] = useState(yieldUnit.code);

  const selectedUnit =
    unitOptions.find(unit => unit.code === unitCode) ?? yieldUnit;

  /** O previsto na unidade escolhida, para o campo já nascer preenchido. */
  const expectedInSelectedUnit = useMemo(() => {
    if (!selectedUnit.factorToBase || !baseUnit.factorToBase) {
      return order.expectedQuantity;
    }

    return (order.expectedQuantity * baseUnit.factorToBase) / selectedUnit.factorToBase;
  }, [order.expectedQuantity, selectedUnit, baseUnit]);

  const [actualQuantity, setActualQuantity] = useState(String(expectedInSelectedUnit));
  const [notes, setNotes] = useState('');

  /** Mensagem do 409: falta de insumo, com o lote intacto. */
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  function handleChangeUnit(code: string) {
    const next = unitOptions.find(unit => unit.code === code) ?? yieldUnit;

    // Converter o que já está digitado evita o campo passar a significar outra
    // coisa só porque a unidade mudou.
    const current = Number(actualQuantity);

    if (Number.isFinite(current) && current > 0) {
      const inBase = toBaseUnit(current, selectedUnit, baseUnit);

      setActualQuantity(String(
        next.factorToBase && baseUnit.factorToBase
          ? (inBase * baseUnit.factorToBase) / next.factorToBase
          : inBase,
      ));
    }

    setUnitCode(code);
  }

  const actualInBase = toBaseUnit(Number(actualQuantity) || 0, selectedUnit, baseUnit);
  const difference = actualInBase - order.expectedQuantity;

  const yieldPercent = order.expectedQuantity === 0
    ? null
    : (actualInBase / order.expectedQuantity) * 100;

  /**
   * O custo por unidade com o rendimento informado. É esta conta que faz a
   * perda de produção chegar ao preço do prato: o mesmo custo de ingredientes
   * dividido por menos produto sobe o custo unitário.
   */
  const projectedUnitCost = actualInBase > 0
    ? order.totalCost / actualInBase
    : null;

  const invalidateProduction = useInvalidateProduction();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: productionService.confirm,
  });

  const handleConfirm = useCallback(async () => {
    if (actualInBase <= 0) {
      toast.error(
        'O rendimento real precisa ser maior que zero. Um lote que não produziu '
        + 'nada é perda dos ingredientes, e o caminho é lançar uma perda de estoque.',
      );
      return;
    }

    try {
      setConflictMessage(null);

      await mutateAsync({
        id: order.id,
        actualQuantity,
        // Sempre explícito: sem isso a API assume a unidade de rendimento da
        // ficha, que nem sempre é a que está selecionada na tela.
        actualQuantityUnit: selectedUnit.code,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      invalidateProduction();
      toast.success('Lote confirmado! Os ingredientes saíram e o subproduto entrou.');
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setConflictMessage(
          getApiErrorMessage(error, 'Falta insumo para confirmar este lote.'),
        );
        return;
      }

      toastApiError(error, 'Erro ao confirmar o lote!');
    }
  }, [
    actualInBase,
    actualQuantity,
    selectedUnit,
    notes,
    order.id,
    mutateAsync,
    invalidateProduction,
    onClose,
  ]);

  return {
    baseUnit,
    unitOptions,
    unitCode,
    handleChangeUnit,
    actualQuantity,
    setActualQuantity,
    notes,
    setNotes,
    actualInBase,
    difference,
    yieldPercent,
    projectedUnitCost,
    conflictMessage,
    isPending,
    handleConfirm,
  };
}
