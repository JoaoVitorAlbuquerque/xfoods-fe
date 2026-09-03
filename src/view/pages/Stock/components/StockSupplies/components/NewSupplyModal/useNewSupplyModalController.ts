import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { suppliesService } from '../../../../../../../app/services/suppliesService';
import { useInvalidateStock, useSupplyCategories } from '../../../../../../../app/hooks/useStockQueries';
import { useMeasurementUnits } from '../../../../../../../app/hooks/useMeasurementUnits';
import { toastApiError } from '../../../../../../../app/utils/toastApiError';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(120, 'Nome deve ter no máximo 120 caracteres'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  supplyCategoryId: z.string().optional(),
  baseUnitId: z.string().min(1, 'Unidade base é obrigatória'),
  minStock: z.string().optional(),
  maxStock: z.string().optional(),
  initialStock: z.string().optional(),
  initialStockUnitId: z.string().optional(),
  initialUnitCost: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.minStock && data.maxStock && Number(data.maxStock) < Number(data.minStock)) {
    ctx.addIssue({
      path: ['maxStock'],
      code: z.ZodIssueCode.custom,
      message: 'Máximo não pode ser menor que o mínimo',
    });
  }
});

type FormData = z.infer<typeof schema>;

export function useNewSupplyModalController(onClose: () => void) {
  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      supplyCategoryId: '',
      baseUnitId: '',
      minStock: '',
      maxStock: '',
      initialStock: '',
      initialStockUnitId: '',
      initialUnitCost: '',
    },
  });

  const { activeCategories } = useSupplyCategories();
  const { units } = useMeasurementUnits();

  const baseUnitId = watch('baseUnitId');
  const initialStock = watch('initialStock');
  const initialStockUnitId = watch('initialStockUnitId');

  const baseUnit = units.find(unit => unit.id === baseUnitId);

  // O saldo de abertura é quase sempre informado na própria unidade base;
  // deixar o campo vazio obrigaria a escolher de novo o que já foi escolhido.
  useEffect(() => {
    if (baseUnitId) {
      setValue('initialStockUnitId', baseUnitId);
    }
  }, [baseUnitId, setValue]);

  const invalidateStock = useInvalidateStock();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: suppliesService.create,
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    const baseUnitCode = units.find(unit => unit.id === data.baseUnitId)?.code;
    const initialUnitCode = units.find(unit => unit.id === data.initialStockUnitId)?.code;

    if (!baseUnitCode) {
      toast.error('Selecione a unidade base do insumo.');
      return;
    }

    try {
      await mutateAsync({
        name: data.name,
        baseUnit: baseUnitCode,
        ...(data.description?.trim() ? { description: data.description.trim() } : {}),
        ...(data.supplyCategoryId ? { supplyCategoryId: data.supplyCategoryId } : {}),
        ...(data.minStock ? { minStock: data.minStock } : {}),
        ...(data.maxStock ? { maxStock: data.maxStock } : {}),
        ...(data.initialStock
          ? {
            initialStock: data.initialStock,
            ...(initialUnitCode ? { initialStockUnit: initialUnitCode } : {}),
            ...(data.initialUnitCost ? { initialUnitCost: data.initialUnitCost } : {}),
          }
          : {}),
      });

      invalidateStock();
      toast.success('Insumo cadastrado com sucesso!');
      reset();
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao cadastrar o insumo!');
    }
  });

  return {
    control,
    register,
    setValue,
    errors,
    handleSubmit,
    isPending,
    categories: activeCategories,
    baseUnit,
    baseUnitId,
    initialStock,
    initialStockUnitId,
  };
}
