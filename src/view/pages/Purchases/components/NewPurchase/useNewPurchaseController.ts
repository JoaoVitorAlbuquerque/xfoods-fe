import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { purchasesService } from '../../../../../app/services/purchasesService';
import { useInvalidatePurchases, useSuppliers } from '../../../../../app/hooks/usePurchaseQueries';
import { useMeasurementUnits } from '../../../../../app/hooks/useMeasurementUnits';
import { useSupplies } from '../../../../../app/hooks/useStockQueries';
import { toastApiError } from '../../../../../app/utils/toastApiError';

const itemSchema = z.object({
  supplyId: z.string().min(1, 'Selecione o insumo'),
  quantity: z.string().min(1, 'Informe a quantidade'),
  unitId: z.string().min(1, 'Selecione a unidade'),
  /** A nota às vezes traz o preço por quilo, às vezes só o total da linha. */
  priceMode: z.enum(['TOTAL', 'UNIT']),
  price: z.string().min(1, 'Informe o preço'),
  batch: z.string().max(60, 'Lote deve ter no máximo 60 caracteres').optional(),
  expiresAt: z.string().optional(),
}).superRefine((data, ctx) => {
  if (Number(data.quantity) <= 0) {
    ctx.addIssue({
      path: ['quantity'],
      code: z.ZodIssueCode.custom,
      message: 'Quantidade deve ser maior que zero',
    });
  }

  if (Number(data.price) < 0) {
    ctx.addIssue({
      path: ['price'],
      code: z.ZodIssueCode.custom,
      message: 'Preço não pode ser negativo',
    });
  }
});

const schema = z.object({
  supplierId: z.string().optional(),
  documentNumber: z.string().max(60, 'Número da nota deve ter no máximo 60 caracteres').optional(),
  issuedAt: z.string().optional(),
  notes: z.string().max(500, 'Observação deve ter no máximo 500 caracteres').optional(),
  items: z.array(itemSchema).min(1, 'Adicione pelo menos um item'),
});

export type NewPurchaseFormData = z.infer<typeof schema>;

export const emptyItem: NewPurchaseFormData['items'][number] = {
  supplyId: '',
  quantity: '',
  unitId: '',
  priceMode: 'TOTAL',
  price: '',
  batch: '',
  expiresAt: '',
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function useNewPurchaseController() {
  const navigate = useNavigate();

  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit: hookFormSubmit,
    formState: { errors },
  } = useForm<NewPurchaseFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: '',
      documentNumber: '',
      issuedAt: today(),
      notes: '',
      items: [emptyItem],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const { activeSuppliers } = useSuppliers();
  const { supplies } = useSupplies({ active: 'true' });
  const { units } = useMeasurementUnits();

  const items = watch('items');

  const invalidatePurchases = useInvalidatePurchases();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: purchasesService.create,
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      const purchase = await mutateAsync({
        ...(data.supplierId ? { supplierId: data.supplierId } : {}),
        ...(data.documentNumber?.trim() ? { documentNumber: data.documentNumber.trim() } : {}),
        ...(data.issuedAt ? { issuedAt: data.issuedAt } : {}),
        ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
        items: data.items.map(item => ({
          supplyId: item.supplyId,
          quantity: item.quantity,
          unit: units.find(unit => unit.id === item.unitId)?.code ?? '',
          // Exatamente um dos dois: a API recusa os dois juntos, porque um
          // poderia contradizer o outro.
          ...(item.priceMode === 'TOTAL'
            ? { totalPrice: item.price }
            : { unitPrice: item.price }),
          ...(item.batch?.trim() ? { batch: item.batch.trim() } : {}),
          ...(item.expiresAt ? { expiresAt: item.expiresAt } : {}),
        })),
      });

      invalidatePurchases();
      toast.success('Rascunho criado. O estoque só muda quando você confirmar.');
      navigate(`/purchases/${purchase.id}`);
    } catch (error) {
      toastApiError(error, 'Erro ao criar a compra!');
    }
  });

  return {
    control,
    register,
    setValue,
    errors,
    handleSubmit,
    isPending,
    fields,
    append,
    remove,
    items,
    suppliers: activeSuppliers,
    supplies,
    units,
  };
}
