import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { Supply } from '../../../../../../../types/Supply';
import { suppliesService } from '../../../../../../../app/services/suppliesService';
import { useInvalidateStock, useSupplyCategories } from '../../../../../../../app/hooks/useStockQueries';
import { toastApiError } from '../../../../../../../app/utils/toastApiError';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(120, 'Nome deve ter no máximo 120 caracteres'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  supplyCategoryId: z.string().optional(),
  minStock: z.string().optional(),
  maxStock: z.string().optional(),
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

export function useEditSupplyModalController(supply: Supply, onClose: () => void) {
  const {
    control,
    register,
    setValue,
    handleSubmit: hookFormSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: supply.name,
      description: supply.description ?? '',
      supplyCategoryId: supply.supplyCategoryId ?? '',
      minStock: String(supply.minStock),
      maxStock: supply.maxStock === null ? '' : String(supply.maxStock),
    },
  });

  const { categories } = useSupplyCategories();

  // As categorias chegam por requisição. Se o valor padrão for aplicado antes
  // das <option> existirem, o navegador o descarta e o campo aparece como
  // "Sem categoria" mesmo com o insumo classificado — por isso ele é reaplicado
  // quando a lista chega.
  useEffect(() => {
    if (categories.length > 0) {
      setValue('supplyCategoryId', supply.supplyCategoryId ?? '');
    }
  }, [categories.length, supply.supplyCategoryId, setValue]);

  const invalidateStock = useInvalidateStock();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: suppliesService.update,
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      await mutateAsync({
        id: supply.id,
        name: data.name,
        description: data.description?.trim() ?? '',
        supplyCategoryId: data.supplyCategoryId || null,
        minStock: data.minStock || '0',
        // Campo vazio significa "não acompanho máximo": a API aceita ausência,
        // então o que é enviado é a ausência do campo, não um zero.
        ...(data.maxStock ? { maxStock: data.maxStock } : {}),
      });

      invalidateStock();
      toast.success('Insumo atualizado com sucesso!');
      onClose();
    } catch (error) {
      toastApiError(error, 'Erro ao atualizar o insumo!');
    }
  });

  return {
    control,
    register,
    errors,
    handleSubmit,
    isPending,
    categories,
  };
}
