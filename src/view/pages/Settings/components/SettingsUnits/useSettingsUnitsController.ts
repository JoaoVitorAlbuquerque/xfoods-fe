import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { MeasurementUnit } from "../../../../../types/MeasurementUnit";
import { measurementUnitsService } from "../../../../../app/services/measurementUnitsService";
import { measurementUnitsQueryKey, useMeasurementUnits } from "../../../../../app/hooks/useMeasurementUnits";
import { toastApiError } from "../../../../../app/utils/toastApiError";

export function useSettingsUnitsController() {
  const [showInactive, setShowInactive] = useState(false);
  const [isNewUnitModalVisible, setIsNewUnitModalVisible] = useState(false);
  const [isEditUnitModalVisible, setIsEditUnitModalVisible] = useState(false);
  const [isDeleteUnitModalVisible, setIsDeleteUnitModalVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<MeasurementUnit | null>(null);

  const { units, isFetching, isError, refetch } = useMeasurementUnits(showInactive);

  /** Sigla da base de cada grandeza, para escrever "1 KG = 1.000 G". */
  const baseUnitCodeByKind = useMemo(() => {
    return units.reduce<Record<string, string>>((acc, unit) => {
      if (unit.isBase) {
        acc[unit.kind] = unit.code;
      }

      return acc;
    }, {});
  }, [units]);

  const handleOpenNewUnitModal = useCallback(() => {
    setIsNewUnitModalVisible(true);
  }, []);

  const handleCloseNewUnitModal = useCallback(() => {
    setIsNewUnitModalVisible(false);
  }, []);

  const handleOpenEditUnitModal = useCallback((unit: MeasurementUnit) => {
    setSelectedUnit(unit);
    setIsEditUnitModalVisible(true);
  }, []);

  const handleCloseEditUnitModal = useCallback(() => {
    setIsEditUnitModalVisible(false);
    setSelectedUnit(null);
  }, []);

  const handleOpenDeleteUnitModal = useCallback((unit: MeasurementUnit) => {
    setSelectedUnit(unit);
    setIsDeleteUnitModalVisible(true);
  }, []);

  const handleCloseDeleteUnitModal = useCallback(() => {
    setIsDeleteUnitModalVisible(false);
    setSelectedUnit(null);
  }, []);

  const queryClient = useQueryClient();
  const { isPending: isReactivating, mutateAsync } = useMutation({
    mutationFn: async (unitId: string) => {
      return measurementUnitsService.update({ id: unitId, active: true });
    },
  });

  // Reativar é reversível e não move saldo nenhum, então não pede confirmação.
  const handleReactivateUnit = useCallback(async (unit: MeasurementUnit) => {
    try {
      await mutateAsync(unit.id);

      queryClient.invalidateQueries({ queryKey: measurementUnitsQueryKey });
      toast.success(`Unidade ${unit.code} reativada!`);
    } catch (error) {
      toastApiError(error, 'Erro ao reativar a unidade!');
    }
  }, [mutateAsync, queryClient]);

  return {
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
  };
}
