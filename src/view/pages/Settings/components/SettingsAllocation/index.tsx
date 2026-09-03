import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NumericFormat } from "react-number-format";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";

import { costAllocationService } from "../../../../../app/services/costAllocationService";
import { costAllocationQueryKey } from "../../../../../app/hooks/useExpenseQueries";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import {
  AllocationMethod,
  AllocationPeriod,
  allocationMethodLabels,
  allocationMethods,
  allocationPeriodLabels,
  allocationPeriods,
  implementedAllocationMethods,
} from "../../../../../types/CostAllocation";
import { Button } from "../../../../components/Button";
import { ListFeedback } from "../../../../components/ListFeedback";
import { Select } from "../../../../components/Select";

export function SettingsAllocation() {
  const { data: settings, isFetching, isError, refetch } = useQuery({
    queryKey: [...costAllocationQueryKey, 'settings'],
    queryFn: costAllocationService.getSettings,
  });

  const [method, setMethod] = useState<AllocationMethod>('PER_SOLD_UNIT');
  const [referencePeriod, setReferencePeriod] = useState<AllocationPeriod>('MONTHLY');
  const [estimatedSalesUnits, setEstimatedSalesUnits] = useState('0');
  const [includeFixed, setIncludeFixed] = useState(true);
  const [includeVariable, setIncludeVariable] = useState(true);

  useEffect(() => {
    if (settings) {
      setMethod(settings.method);
      setReferencePeriod(settings.referencePeriod);
      setEstimatedSalesUnits(String(settings.estimatedSalesUnits));
      setIncludeFixed(settings.includeFixed);
      setIncludeVariable(settings.includeVariable);
    }
  }, [settings]);

  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: costAllocationService.updateSettings,
  });

  const handleSubmit = useCallback(async () => {
    try {
      await mutateAsync({
        method,
        referencePeriod,
        estimatedSalesUnits: estimatedSalesUnits || '0',
        includeFixed,
        includeVariable,
      });

      queryClient.invalidateQueries({ queryKey: costAllocationQueryKey });
      toast.success('Configuração de rateio salva!');
    } catch (error) {
      toastApiError(error, 'Erro ao salvar a configuração de rateio!');
    }
  }, [method, referencePeriod, estimatedSalesUnits, includeFixed, includeVariable, mutateAsync, queryClient]);

  const isMethodImplemented = implementedAllocationMethods.includes(method);

  return (
    <ListFeedback
      isLoading={isFetching}
      isError={isError}
      isEmpty={false}
      emptyMessage=""
      errorMessage="Não foi possível carregar a configuração de rateio."
      onRetry={refetch}
    >
      <div className="max-w-[640px] space-y-4">
        <div className="rounded-lg border border-gray-600 bg-white p-4">
          <span className="block font-medium text-gray-500">Método de rateio</span>

          <span className="mt-1 block text-xs text-gray-400">
            Como o custo indireto é distribuído entre os pratos.
          </span>

          <div className="mt-3">
            <Select
              value={method}
              onChange={event => setMethod(event.target.value as AllocationMethod)}
            >
              {allocationMethods.map(option => (
                <option key={option} value={option}>
                  {allocationMethodLabels[option]}
                  {!implementedAllocationMethods.includes(option) && ' (ainda não calcula)'}
                </option>
              ))}
            </Select>
          </div>

          {!isMethodImplemented && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
              <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

              <span>
                A configuração é gravada, mas os relatórios de{' '}
                <Link to="/expenses/allocation" className="font-bold underline">
                  custos operacionais
                </Link>{' '}
                e custo completo vão recusar o cálculo enquanto este método
                estiver escolhido. Só <strong>Por unidade vendida</strong> está
                implementado.
              </span>
            </p>
          )}

          <p className="mt-3 flex items-start gap-2 text-xs text-gray-400">
            <InfoCircledIcon className="mt-0.5 shrink-0" />

            Por unidade vendida distribui o mesmo valor para todo prato: um
            refrigerante de R$ 8 absorve o mesmo aluguel que uma pizza de R$ 60.
            É a limitação do método — e o motivo de existir o por faturamento.
          </p>
        </div>

        <div className="rounded-lg border border-gray-600 bg-white p-4">
          <span className="block font-medium text-gray-500">
            Vendas estimadas no período de referência
          </span>

          <span className="mt-1 block text-xs text-gray-400">
            É o divisor do rateio. Sem ele não existe custo por unidade — o
            relatório passa a mostrar um travessão em vez de um número inventado.
          </span>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumericFormat
              value={estimatedSalesUnits}
              onValueChange={(values, sourceInfo) => {
                if (sourceInfo.source === 'event') {
                  setEstimatedSalesUnits(values.value);
                }
              }}
              valueIsNumericString
              thousandSeparator="."
              decimalSeparator=","
              allowNegative={false}
              decimalScale={2}
              placeholder="Ex: 3.000"
              className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
            />

            <Select
              value={referencePeriod}
              onChange={event => setReferencePeriod(event.target.value as AllocationPeriod)}
            >
              {allocationPeriods.map(option => (
                <option key={option} value={option}>
                  {allocationPeriodLabels[option]}
                </option>
              ))}
            </Select>
          </div>

          <span className="mt-2 block text-xs text-gray-400">
            Um relatório de três meses com referência mensal multiplica a
            estimativa por três, para o custo por unidade não mudar só porque a
            janela ficou maior.
          </span>
        </div>

        <div className="rounded-lg border border-gray-600 bg-white p-4 space-y-4">
          <label className="flex items-start justify-between gap-4" role="button">
            <span>
              <span className="block font-medium text-gray-500">
                Incluir despesas fixas
              </span>

              <span className="mt-1 block text-xs text-gray-400">
                Aluguel, contador, internet — o que não varia com o volume.
              </span>
            </span>

            <input
              type="checkbox"
              checked={includeFixed}
              onChange={event => setIncludeFixed(event.target.checked)}
              className="mt-1 size-5 shrink-0 rounded text-red-500 focus:ring-0"
            />
          </label>

          <label className="flex items-start justify-between gap-4 border-t border-gray-600/40 pt-4" role="button">
            <span>
              <span className="block font-medium text-gray-500">
                Incluir despesas variáveis
              </span>

              <span className="mt-1 block text-xs text-gray-400">
                Comissão, taxa de cartão, embalagem — o que acompanha o movimento.
              </span>
            </span>

            <input
              type="checkbox"
              checked={includeVariable}
              onChange={event => setIncludeVariable(event.target.checked)}
              className="mt-1 size-5 shrink-0 rounded text-red-500 focus:ring-0"
            />
          </label>

          {!includeFixed && !includeVariable && (
            <p className="text-xs text-yellow-800">
              Com os dois desligados, nenhuma despesa entra no rateio e o custo
              indireto por unidade sai zero.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} isLoading={isPending} className="w-full sm:w-auto">
            Salvar Configuração
          </Button>
        </div>
      </div>
    </ListFeedback>
  );
}
