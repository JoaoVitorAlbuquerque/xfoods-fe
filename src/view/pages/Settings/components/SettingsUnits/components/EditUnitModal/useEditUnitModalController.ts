import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { measurementUnitsService } from '../../../../../../../app/services/measurementUnitsService';
import { UpdateMeasurementUnitParams } from '../../../../../../../app/services/measurementUnitsService/update';
import { measurementUnitsQueryKey, useMeasurementUnits } from '../../../../../../../app/hooks/useMeasurementUnits';
import { toastApiError } from '../../../../../../../app/utils/toastApiError';
import { findBaseUnit } from '../../../../../../../app/utils/unitConversion';
import { MeasurementUnit } from '../../../../../../../types/MeasurementUnit';

const schema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(60, 'Nome deve ter no máximo 60 caracteres'),
  factorToBase: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function useEditUnitModalController(unit: MeasurementUnit, onClose: () => void) {
  const {
    register,
    control,
    watch,
    handleSubmit: hookFormSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: unit.name,
      factorToBase: unit.factorToBase === null ? '' : String(unit.factorToBase),
    },
  });

  const { units } = useMeasurementUnits();
  const baseUnit = findBaseUnit(units, unit.kind);
  const factorToBase = watch('factorToBase');

  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (data: UpdateMeasurementUnitParams) => {
      return measurementUnitsService.update(data);
    },
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    if (!unit.isPackaging && (!data.factorToBase || Number(data.factorToBase) <= 0)) {
      toast.error('Fator de conversão deve ser maior que zero.');
      return;
    }

    try {
      await mutateAsync({
        id: unit.id,
        name: data.name,
        // Embalagem não tem fator universal para atualizar.
        ...(unit.isPackaging ? {} : { factorToBase: data.factorToBase }),
      });

      queryClient.invalidateQueries({ queryKey: measurementUnitsQueryKey });
      toast.success('Unidade atualizada com sucesso!');
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao atualizar a unidade!');
    }
  });

  return {
    register,
    control,
    errors,
    handleSubmit,
    isPending,
    factorToBase,
    baseUnit,
  };
}
