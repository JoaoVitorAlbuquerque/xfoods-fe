import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { measurementUnitsService } from "../../../../../../../app/services/measurementUnitsService";
import { measurementUnitsQueryKey } from "../../../../../../../app/hooks/useMeasurementUnits";
import { toastApiError } from "../../../../../../../app/utils/toastApiError";
import { MeasurementUnit } from "../../../../../../../types/MeasurementUnit";

export function useDeleteUnitModalController(unit: MeasurementUnit, onClose: () => void) {
  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (unitId: string) => {
      return measurementUnitsService.remove(unitId);
    },
  });

  const handleDeleteUnit = useCallback(async () => {
    try {
      await mutateAsync(unit.id);

      queryClient.invalidateQueries({ queryKey: measurementUnitsQueryKey });
      toast.success(`Unidade ${unit.code} desativada!`);
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao desativar a unidade!');
    }
  }, [unit, mutateAsync, onClose, queryClient]);

  return {
    handleDeleteUnit,
    isPending,
  };
}
