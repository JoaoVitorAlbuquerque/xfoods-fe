import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';

import { stockService } from '../../../../../app/services/stockService';
import {
  ManualEntryType,
  ManualExitType,
} from '../../../../../app/services/stockService/operations';
import { useInvalidateStock, useSupplies } from '../../../../../app/hooks/useStockQueries';
import { useMeasurementUnits } from '../../../../../app/hooks/useMeasurementUnits';
import { getApiErrorMessage } from '../../../../../app/utils/getApiErrorMessage';
import { toastApiError } from '../../../../../app/utils/toastApiError';
import { formatQuantity } from '../../../../../app/utils/formatQuantity';

export type StockOperation = 'ENTRY' | 'EXIT' | 'LOSS' | 'ADJUSTMENT';

const schemaShape = z.object({
  supplyId: z.string().min(1, 'Selecione o insumo'),
  unitId: z.string().min(1, 'Selecione a unidade'),
  quantity: z.string().optional(),
  targetQuantity: z.string().optional(),
  reason: z.string().optional(),
  unitCost: z.string().optional(),
  type: z.string().optional(),
});

export type StockOperationFormData = z.infer<typeof schemaShape>;

function buildSchema(operation: StockOperation) {
  return schemaShape.superRefine((data, ctx) => {
    if (operation === 'ADJUSTMENT') {
      if (!data.targetQuantity || Number(data.targetQuantity) < 0) {
        ctx.addIssue({
          path: ['targetQuantity'],
          code: z.ZodIssueCode.custom,
          message: 'Informe o saldo correto encontrado',
        });
      }
    } else if (!data.quantity || Number(data.quantity) <= 0) {
      ctx.addIssue({
        path: ['quantity'],
        code: z.ZodIssueCode.custom,
        message: 'Quantidade deve ser maior que zero',
      });
    }

    // Perda sem motivo não é auditável, e ajuste sem motivo não explica por que
    // o saldo mudou. A API recusa os dois — validar aqui poupa a ida.
    if ((operation === 'LOSS' || operation === 'ADJUSTMENT') && !data.reason?.trim()) {
      ctx.addIssue({
        path: ['reason'],
        code: z.ZodIssueCode.custom,
        message: 'Motivo é obrigatório',
      });
    }

    if (operation === 'EXIT' && !data.type) {
      ctx.addIssue({
        path: ['type'],
        code: z.ZodIssueCode.custom,
        message: 'Selecione o tipo da saída',
      });
    }
  });
}

export function useStockOperationModalController(
  operation: StockOperation,
  preselectedSupplyId: string | undefined,
  onClose: () => void,
) {
  /** 409 de saldo insuficiente ganha tratamento próprio, não um toast genérico. */
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  const resolver = useMemo(() => zodResolver(buildSchema(operation)), [operation]);

  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit: hookFormSubmit,
    formState: { errors },
  } = useForm<StockOperationFormData>({
    resolver,
    defaultValues: {
      supplyId: preselectedSupplyId ?? '',
      unitId: '',
      quantity: '',
      targetQuantity: '',
      reason: '',
      unitCost: '',
      type: operation === 'ENTRY' ? 'PURCHASE' : undefined,
    },
  });

  const { supplies } = useSupplies({ active: 'true' });
  const { units } = useMeasurementUnits();

  const supplyId = watch('supplyId');
  const unitId = watch('unitId');
  const quantity = watch('quantity');
  const targetQuantity = watch('targetQuantity');

  const selectedSupply = supplies.find(supply => supply.id === supplyId);

  // A unidade acompanha o insumo: a base dele é o padrão certo em quase todo
  // lançamento, e trocar de insumo sem trocar a unidade deixaria um KG
  // selecionado num insumo contado em unidades.
  useEffect(() => {
    if (selectedSupply) {
      setValue('unitId', selectedSupply.baseUnitId);
    }
  }, [selectedSupply, setValue]);

  const invalidateStock = useInvalidateStock();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (data: StockOperationFormData) => {
      const unitCode = units.find(unit => unit.id === data.unitId)?.code;

      if (operation === 'ADJUSTMENT') {
        return stockService.createAdjustment({
          supplyId: data.supplyId,
          targetQuantity: data.targetQuantity!,
          unit: unitCode,
          reason: data.reason!.trim(),
        });
      }

      if (operation === 'LOSS') {
        return stockService.createLoss({
          supplyId: data.supplyId,
          quantity: data.quantity!,
          unit: unitCode,
          reason: data.reason!.trim(),
        });
      }

      if (operation === 'EXIT') {
        return stockService.createExit({
          supplyId: data.supplyId,
          quantity: data.quantity!,
          unit: unitCode,
          type: data.type as ManualExitType,
          reason: data.reason?.trim() || undefined,
        });
      }

      return stockService.createEntry({
        supplyId: data.supplyId,
        quantity: data.quantity!,
        unit: unitCode,
        type: (data.type as ManualEntryType) || undefined,
        reason: data.reason?.trim() || undefined,
        unitCost: data.unitCost || undefined,
      });
    },
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    setConflictMessage(null);

    try {
      const result = await mutateAsync(data);

      invalidateStock();

      if (operation === 'ADJUSTMENT') {
        const adjustment = result as Awaited<ReturnType<typeof stockService.createAdjustment>>;

        // Ajuste sem diferença não gera movimento — dizer isso é mais honesto
        // do que comemorar um lançamento que não aconteceu.
        if (!adjustment.applied) {
          toast.success('Saldo já estava correto: nenhum ajuste foi lançado.');
        } else {
          toast.success(
            `Saldo ajustado (diferença de ${formatQuantity(adjustment.difference)} ${selectedSupply?.baseUnit.code ?? ''}).`,
          );
        }
      } else {
        const movement = result as Awaited<ReturnType<typeof stockService.createEntry>>;

        toast.success(
          `Lançamento registrado. Saldo: ${formatQuantity(movement.balanceAfter)} ${selectedSupply?.baseUnit.code ?? ''}`,
        );
      }

      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setConflictMessage(getApiErrorMessage(error, 'Saldo insuficiente.'));
        return;
      }

      toastApiError(error, 'Erro ao registrar o lançamento!');
    }
  });

  return {
    control,
    register,
    setValue,
    errors,
    handleSubmit,
    isPending,
    conflictMessage,
    selectedSupply,
    supplyId,
    unitId,
    quantity,
    targetQuantity,
  };
}
