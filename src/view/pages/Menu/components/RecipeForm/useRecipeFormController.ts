import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { recipesService } from '../../../../../app/services/recipesService';
import { RecipeItemParams } from '../../../../../app/services/recipesService/mutations';
import {
  useInvalidateRecipes,
  useProductOptions,
  useSubRecipes,
} from '../../../../../app/hooks/useRecipeQueries';
import { useMeasurementUnits } from '../../../../../app/hooks/useMeasurementUnits';
import { useSupplies } from '../../../../../app/hooks/useStockQueries';
import { toastApiError } from '../../../../../app/utils/toastApiError';
import { RecipeDetail, RecipeType, SizeType, sizeTypes } from '../../../../../types/Recipe';

export type RecipeFormMode = 'create' | 'edit' | 'new-version';

const itemSchema = z.object({
  kind: z.enum(['SUPPLY', 'SUB_RECIPE']),
  supplyId: z.string().optional(),
  subRecipeId: z.string().optional(),
  quantity: z.string().min(1, 'Informe a quantidade'),
  unitId: z.string().min(1, 'Selecione a unidade'),
  wastePercent: z.string().optional(),
  notes: z.string().max(200, 'Observação deve ter no máximo 200 caracteres').optional(),
}).superRefine((data, ctx) => {
  // Um item é insumo OU sub-receita, nunca os dois — a API recusa os dois juntos.
  if (data.kind === 'SUPPLY' && !data.supplyId) {
    ctx.addIssue({ path: ['supplyId'], code: z.ZodIssueCode.custom, message: 'Selecione o insumo' });
  }

  if (data.kind === 'SUB_RECIPE' && !data.subRecipeId) {
    ctx.addIssue({ path: ['subRecipeId'], code: z.ZodIssueCode.custom, message: 'Selecione a sub-receita' });
  }

  if (Number(data.quantity) <= 0) {
    ctx.addIssue({ path: ['quantity'], code: z.ZodIssueCode.custom, message: 'Quantidade deve ser maior que zero' });
  }

  const waste = Number(data.wastePercent || 0);

  if (waste < 0 || waste >= 100) {
    ctx.addIssue({
      path: ['wastePercent'],
      code: z.ZodIssueCode.custom,
      message: 'Perda deve ficar entre 0 e 100 (exclusivo)',
    });
  }
});

const schema = z.object({
  productId: z.string().optional(),
  name: z.string().max(120, 'Nome deve ter no máximo 120 caracteres').optional(),
  yieldQuantity: z.string().optional(),
  yieldUnitId: z.string().optional(),
  notes: z.string().max(1000, 'Observação deve ter no máximo 1000 caracteres').optional(),
  activate: z.boolean(),
  defineSizeFactors: z.boolean(),
  sizeFactors: z.array(z.object({ size: z.string(), factor: z.string() })),
  items: z.array(itemSchema).min(1, 'A ficha precisa de pelo menos um item'),
});

export type RecipeFormData = z.infer<typeof schema>;

export const emptyRecipeItem: RecipeFormData['items'][number] = {
  kind: 'SUPPLY',
  supplyId: '',
  subRecipeId: '',
  quantity: '',
  unitId: '',
  wastePercent: '',
  notes: '',
};

interface UseRecipeFormControllerParams {
  mode: RecipeFormMode;
  recipeType: RecipeType;
  /** Prato já escolhido, quando a ficha nasce da tela de cobertura. */
  presetProductId?: string;
  recipe?: RecipeDetail;
}

export function useRecipeFormController({
  mode,
  recipeType,
  presetProductId,
  recipe,
}: UseRecipeFormControllerParams) {
  const navigate = useNavigate();

  const { units } = useMeasurementUnits();
  const { supplies } = useSupplies({ active: 'true' });
  const { subRecipes } = useSubRecipes();
  const { products } = useProductOptions();

  const {
    control,
    register,
    watch,
    setValue,
    reset,
    handleSubmit: hookFormSubmit,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: presetProductId ?? '',
      name: '',
      yieldQuantity: '1',
      yieldUnitId: '',
      notes: '',
      activate: false,
      defineSizeFactors: false,
      sizeFactors: sizeTypes.map(size => ({ size, factor: '' })),
      items: [emptyRecipeItem],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // A ficha em edição chega por requisição; o formulário só pode ser
  // preenchido quando ela e as unidades estiverem em mãos — o item guarda a
  // sigla da unidade, e o seletor trabalha com o id.
  useEffect(() => {
    if (!recipe || units.length === 0) {
      return;
    }

    reset({
      productId: recipe.productId ?? '',
      name: recipe.name ?? '',
      yieldQuantity: String(recipe.yieldQuantity),
      yieldUnitId: recipe.yieldUnit?.id ?? '',
      notes: recipe.notes ?? '',
      activate: false,
      // A leitura da ficha não devolve os fatores de tamanho salvos, então o
      // formulário não tem como exibi-los: começa desligado e, enquanto ficar
      // assim, `sizeFactors` não é enviado e a tabela atual é preservada.
      defineSizeFactors: false,
      sizeFactors: sizeTypes.map(size => ({ size, factor: '' })),
      items: recipe.items.map(item => ({
        kind: item.type === 'SUPPLY' ? 'SUPPLY' : 'SUB_RECIPE',
        supplyId: item.supplyId ?? '',
        subRecipeId: item.subRecipeId ?? '',
        quantity: String(item.quantity),
        unitId: units.find(unit => unit.code === item.unit)?.id ?? '',
        wastePercent: item.wastePercent ? String(item.wastePercent) : '',
        notes: item.notes ?? '',
      })),
    });
  }, [recipe, units, reset]);

  const items = watch('items');
  const defineSizeFactors = watch('defineSizeFactors');
  const sizeFactors = watch('sizeFactors');
  const yieldUnitId = watch('yieldUnitId');
  const yieldQuantity = watch('yieldQuantity');

  const invalidateRecipes = useInvalidateRecipes();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (data: RecipeFormData) => {
      const unitCode = (unitId: string) =>
        units.find(unit => unit.id === unitId)?.code ?? '';

      const payloadItems: RecipeItemParams[] = data.items.map(item => ({
        ...(item.kind === 'SUPPLY'
          ? { supplyId: item.supplyId }
          : { subRecipeId: item.subRecipeId }),
        quantity: item.quantity,
        unit: unitCode(item.unitId),
        ...(item.wastePercent ? { wastePercent: item.wastePercent } : {}),
        ...(item.notes?.trim() ? { notes: item.notes.trim() } : {}),
      }));

      // Informar `sizeFactors` substitui a tabela inteira. Enviar uma lista
      // vazia apagaria os fatores já cadastrados, então ela só vai quando o
      // usuário assume a edição da tabela.
      const payloadSizeFactors = data.defineSizeFactors
        ? data.sizeFactors
          .filter(entry => entry.factor && Number(entry.factor) > 0)
          .map(entry => ({ size: entry.size as SizeType, factor: entry.factor }))
        : undefined;

      const shared = {
        ...(data.name?.trim() ? { name: data.name.trim() } : {}),
        ...(data.yieldQuantity ? { yieldQuantity: data.yieldQuantity } : {}),
        ...(data.yieldUnitId ? { yieldUnit: unitCode(data.yieldUnitId) } : {}),
        ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
        ...(payloadSizeFactors ? { sizeFactors: payloadSizeFactors } : {}),
      };

      if (mode === 'edit' && recipe) {
        return recipesService.update({ id: recipe.id, ...shared, items: payloadItems });
      }

      if (mode === 'new-version' && recipe) {
        return recipesService.newVersion({ id: recipe.id, ...shared, items: payloadItems });
      }

      const productId = data.productId || presetProductId;

      return recipesService.create({
        ...(recipeType === 'PRODUCT' && productId ? { productId } : {}),
        ...shared,
        activate: data.activate,
        items: payloadItems,
      });
    },
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    if (recipeType === 'SUB' && !data.name?.trim()) {
      toast.error('Uma sub-receita precisa de nome: sem prato, é o nome que a identifica.');
      return;
    }

    if (recipeType === 'SUB' && !data.yieldUnitId) {
      toast.error('Uma sub-receita precisa de unidade de rendimento.');
      return;
    }

    if (mode === 'create' && recipeType === 'PRODUCT' && !data.productId && !presetProductId) {
      toast.error('Selecione o prato da ficha.');
      return;
    }

    try {
      const saved = await mutateAsync(data);

      invalidateRecipes();
      toast.success(
        mode === 'new-version'
          ? 'Versão criada. Ela nasce inativa: a ficha atual continua valendo até você ativar a nova.'
          : mode === 'edit'
            ? 'Ficha atualizada com sucesso!'
            : 'Ficha criada com sucesso!',
      );
      navigate(`/menu/recipes/${saved.id}`);
    } catch (error) {
      toastApiError(error, 'Erro ao salvar a ficha técnica!');
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
    defineSizeFactors,
    sizeFactors,
    yieldUnitId,
    yieldQuantity,
    units,
    supplies,
    subRecipes,
    products,
  };
}
