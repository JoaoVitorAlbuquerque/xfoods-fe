import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { productionService } from '../../../../../app/services/productionService';
import { recipesService } from '../../../../../app/services/recipesService';
import { recipesQueryKey } from '../../../../../app/hooks/useRecipeQueries';
import {
  useInvalidateProduction,
  useProducibleRecipes,
} from '../../../../../app/hooks/useProductionQueries';
import { useSupplies } from '../../../../../app/hooks/useStockQueries';
import { toastApiError } from '../../../../../app/utils/toastApiError';

const schema = z.object({
  recipeId: z.string().min(1, 'Selecione a sub-receita'),
  batches: z.string().min(1, 'Informe quantos lotes'),
  producedAt: z.string().optional(),
  notes: z.string().max(1000, 'Observação deve ter no máximo 1000 caracteres').optional(),
  adjustItems: z.boolean(),
  items: z.array(z.object({
    supplyId: z.string().min(1, 'Selecione o insumo'),
    quantity: z.string().min(1, 'Informe a quantidade'),
  })),
}).superRefine((data, ctx) => {
  if (Number(data.batches) <= 0) {
    ctx.addIssue({
      path: ['batches'],
      code: z.ZodIssueCode.custom,
      message: 'Os lotes precisam ser maiores que zero',
    });
  }

  if (!data.adjustItems) {
    return;
  }

  if (data.items.length === 0) {
    ctx.addIssue({
      path: ['items'],
      code: z.ZodIssueCode.custom,
      message: 'Informe pelo menos um ingrediente',
    });
  }

  data.items.forEach((item, index) => {
    if (Number(item.quantity) <= 0) {
      ctx.addIssue({
        path: ['items', index, 'quantity'],
        code: z.ZodIssueCode.custom,
        message: 'Quantidade deve ser maior que zero',
      });
    }
  });
});

export type ProductionFormData = z.infer<typeof schema>;

export function useNewProductionOrderController() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { recipes, compositionOnly, isFetching: isLoadingRecipes } = useProducibleRecipes();
  const { supplies } = useSupplies({ active: 'true' });
  const invalidateProduction = useInvalidateProduction();

  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit: hookFormSubmit,
    formState: { errors },
  } = useForm<ProductionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      recipeId: searchParams.get('recipeId') ?? '',
      batches: '1',
      producedAt: '',
      notes: '',
      adjustItems: false,
      items: [],
    },
  });

  const { fields, replace, remove } = useFieldArray({ control, name: 'items' });

  const recipeId = watch('recipeId');
  const batches = watch('batches');
  const adjustItems = watch('adjustItems');
  const items = watch('items');

  const recipe = recipes.find(item => item.id === recipeId);

  /** A ficha com custo, para a prévia dos ingredientes. */
  const { data: recipeDetail, isFetching: isLoadingRecipe } = useQuery({
    queryKey: [...recipesQueryKey, 'detail', recipeId],
    queryFn: () => recipesService.getById(recipeId),
    enabled: Boolean(recipeId),
  });

  const outputSupply = supplies.find(supply => supply.id === recipe?.outputSupplyId);

  const batchCount = Number(batches) || 0;

  /**
   * Prévia do que sai do estoque: a quantidade BRUTA da ficha (já com a perda
   * de preparo) multiplicada pelos lotes.
   */
  const preview = useMemo(() => (recipeDetail?.items ?? []).map(line => ({
    ...line,
    previewQuantity: line.effectiveQuantity * batchCount,
    previewCost: line.totalCost * batchCount,
  })), [recipeDetail, batchCount]);

  /**
   * Linha de sub-receita não tem `supplyId`: quem a desdobra até insumo é a
   * API. Informar `items` substitui a lista inteira, então ajustar à mão numa
   * ficha assim descartaria em silêncio os ingredientes da sub-receita.
   */
  const hasSubRecipeLines = preview.some(line => line.type !== 'SUPPLY');
  const canAdjustItems = preview.length > 0 && !hasSubRecipeLines;

  const expectedYield = recipeDetail
    ? recipeDetail.yieldQuantity * batchCount
    : 0;

  const previewCost = preview.reduce((total, line) => total + line.previewCost, 0);

  // Ligar o ajuste preenche a lista com o que a ficha prevê: o usuário corrige
  // o que mudou, em vez de digitar tudo de novo.
  useEffect(() => {
    if (adjustItems && canAdjustItems) {
      replace(preview.map(line => ({
        supplyId: line.supplyId ?? '',
        quantity: String(line.previewQuantity),
      })));

      return;
    }

    if (!adjustItems) {
      replace([]);
    }
  }, [adjustItems, canAdjustItems, preview, replace]);

  // Trocar de ficha invalida o ajuste feito para a anterior.
  useEffect(() => {
    setValue('adjustItems', false);
  }, [recipeId, setValue]);

  const { isPending, mutateAsync } = useMutation({
    mutationFn: productionService.create,
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      const created = await mutateAsync({
        recipeId: data.recipeId,
        batches: data.batches,
        // `datetime-local` é hora local; o ISO deixa o instante sem ambiguidade.
        ...(data.producedAt
          ? { producedAt: new Date(data.producedAt).toISOString() }
          : {}),
        ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
        // Sem ajuste, a API deriva da ficha e desdobra sub-receitas aninhadas.
        ...(data.adjustItems
          ? {
            items: data.items.map(item => ({
              supplyId: item.supplyId,
              quantity: item.quantity,
            })),
          }
          : {}),
      });

      invalidateProduction();
      toast.success('Lote criado como rascunho. Ele ainda não encostou no estoque.');
      navigate(`/production/${created.id}`);
    } catch (error) {
      toastApiError(error, 'Erro ao criar a ordem de produção!');
    }
  });

  return {
    control,
    register,
    errors,
    handleSubmit,
    isPending,
    fields,
    remove,
    items,
    recipes,
    compositionOnly,
    isLoadingRecipes,
    isLoadingRecipe,
    recipe,
    recipeDetail,
    outputSupply,
    supplies,
    preview,
    previewCost,
    expectedYield,
    batchCount,
    adjustItems,
    canAdjustItems,
    hasSubRecipeLines,
  };
}
