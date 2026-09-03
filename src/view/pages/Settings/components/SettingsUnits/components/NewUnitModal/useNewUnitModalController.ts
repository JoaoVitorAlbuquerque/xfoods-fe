import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { measurementUnitsService } from '../../../../../../../app/services/measurementUnitsService';
import { CreateMeasurementUnitParams } from '../../../../../../../app/services/measurementUnitsService/create';
import { measurementUnitsQueryKey, useMeasurementUnits } from '../../../../../../../app/hooks/useMeasurementUnits';
import { toastApiError } from '../../../../../../../app/utils/toastApiError';
import { findBaseUnit } from '../../../../../../../app/utils/unitConversion';
import { UnitKind } from '../../../../../../../types/MeasurementUnit';

const schema = z.object({
  code: z
    .string()
    .min(1, 'Sigla é obrigatória')
    .max(16, 'Sigla deve ter no máximo 16 caracteres')
    .regex(/^[A-Za-z0-9_]+$/, 'Sigla aceita apenas letras, números e underline'),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(60, 'Nome deve ter no máximo 60 caracteres'),
  kind: z.enum(['WEIGHT', 'VOLUME', 'COUNT'], {
    errorMap: () => ({ message: 'Grandeza é obrigatória' }),
  }),
  isPackaging: z.boolean(),
  factorToBase: z.string().optional(),
}).superRefine((data, ctx) => {
  // Embalagem não tem fator universal; qualquer outra unidade precisa de um,
  // senão ela entra no catálogo sem poder ser convertida.
  if (data.isPackaging) {
    return;
  }

  if (!data.factorToBase) {
    ctx.addIssue({
      path: ['factorToBase'],
      code: z.ZodIssueCode.custom,
      message: 'Fator de conversão é obrigatório para unidades que não são embalagem',
    });

    return;
  }

  if (Number(data.factorToBase) <= 0) {
    ctx.addIssue({
      path: ['factorToBase'],
      code: z.ZodIssueCode.custom,
      message: 'Fator de conversão deve ser maior que zero',
    });
  }
});

type FormData = z.infer<typeof schema>;

export function useNewUnitModalController(onClose: () => void) {
  const {
    register,
    control,
    watch,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      name: '',
      isPackaging: false,
      factorToBase: '',
    },
  });

  const { units } = useMeasurementUnits();

  const code = watch('code');
  const kind = watch('kind') as UnitKind | undefined;
  const isPackaging = watch('isPackaging');
  const factorToBase = watch('factorToBase');

  const baseUnit = kind ? findBaseUnit(units, kind) : undefined;

  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (data: CreateMeasurementUnitParams) => {
      return measurementUnitsService.create(data);
    },
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      await mutateAsync({
        code: data.code,
        name: data.name,
        kind: data.kind,
        isPackaging: data.isPackaging,
        // A API recusa `factorToBase` em embalagem, então ele nem é enviado.
        ...(data.isPackaging ? {} : { factorToBase: data.factorToBase }),
      });

      queryClient.invalidateQueries({ queryKey: measurementUnitsQueryKey });
      toast.success('Unidade criada com sucesso!');
      reset();
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao criar a unidade!');
    }
  });

  return {
    register,
    control,
    errors,
    handleSubmit,
    isPending,
    code,
    isPackaging,
    factorToBase,
    baseUnit,
  };
}
