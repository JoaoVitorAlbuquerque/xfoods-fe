import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NumericFormat } from "react-number-format";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";

import { stockService } from "../../../../../app/services/stockService";
import { stockSettingsQueryKey, useStockSettings } from "../../../../../app/hooks/useStockQueries";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { Button } from "../../../../components/Button";
import { ListFeedback } from "../../../../components/ListFeedback";

export function SettingsStock() {
  const { settings, isFetching, isError, refetch } = useStockSettings();

  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [allowSaleWithoutRecipe, setAllowSaleWithoutRecipe] = useState(true);
  const [tolerance, setTolerance] = useState('5');

  useEffect(() => {
    if (settings) {
      setAllowNegativeStock(settings.allowNegativeStock);
      setAllowSaleWithoutRecipe(settings.allowSaleWithoutRecipe);
      setTolerance(String(settings.stockConsumptionTolerancePercentage));
    }
  }, [settings]);

  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: stockService.updateSettings,
  });

  const handleSubmit = useCallback(async () => {
    try {
      await mutateAsync({
        allowNegativeStock,
        allowSaleWithoutRecipe,
        stockConsumptionTolerancePercentage: tolerance || '0',
      });

      queryClient.invalidateQueries({ queryKey: stockSettingsQueryKey });
      toast.success('Configurações de estoque salvas!');
    } catch (error) {
      toastApiError(error, 'Erro ao salvar as configurações!');
    }
  }, [allowNegativeStock, allowSaleWithoutRecipe, tolerance, mutateAsync, queryClient]);

  return (
    <ListFeedback
      isLoading={isFetching}
      isError={isError}
      isEmpty={false}
      emptyMessage=""
      errorMessage="Não foi possível carregar as configurações de estoque."
      onRetry={refetch}
    >
      <div className="max-w-[640px] space-y-4">
        <div className="rounded-lg border border-gray-600 bg-white p-4">
          <label className="flex items-start justify-between gap-4" role="button">
            <span>
              <span className="block font-medium text-gray-500">
                Permitir saldo negativo
              </span>

              <span className="mt-1 block text-xs text-gray-400">
                Desligado, uma saída maior que o saldo é recusada — o que costuma
                pegar erro de digitação na hora.
              </span>
            </span>

            <input
              type="checkbox"
              checked={allowNegativeStock}
              onChange={event => setAllowNegativeStock(event.target.checked)}
              className="mt-1 size-5 shrink-0 rounded text-red-500 focus:ring-0"
            />
          </label>

          {!allowNegativeStock && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
              <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

              <span>
                Atenção: com a trava ligada, faltar insumo <strong>impede fechar
                a conta</strong> na venda. A transação inteira volta atrás e o
                pagamento não é confirmado. Quem ainda está ajustando o estoque
                costuma preferir permitir o negativo e tratar o saldo abaixo de
                zero como conferência pendente.
              </span>
            </p>
          )}
        </div>

        <div className="rounded-lg border border-gray-600 bg-white p-4">
          <label className="flex items-start justify-between gap-4" role="button">
            <span>
              <span className="block font-medium text-gray-500">
                Permitir venda de prato sem ficha técnica
              </span>

              <span className="mt-1 block text-xs text-gray-400">
                Ligado, a venda é concluída, um alerta é devolvido e nenhum insumo
                é consumido — o estoque desse prato deixa de ser confiável.
                Desligado, vender exige ficha ativa.
              </span>
            </span>

            <input
              type="checkbox"
              checked={allowSaleWithoutRecipe}
              onChange={event => setAllowSaleWithoutRecipe(event.target.checked)}
              className="mt-1 size-5 shrink-0 rounded text-red-500 focus:ring-0"
            />
          </label>
        </div>

        <div className="rounded-lg border border-gray-600 bg-white p-4">
          <span className="block font-medium text-gray-500">
            Tolerância de consumo (%)
          </span>

          <span className="mt-1 block text-xs text-gray-400">
            Margem entre o consumo previsto pelas fichas e o que saiu de fato do
            estoque. Dentro dela o desvio é ruído de operação — porção servida a
            olho, arredondamento de balança. Zero passa a acusar qualquer
            diferença.
          </span>

          <NumericFormat
            value={tolerance}
            onValueChange={(values, sourceInfo) => {
              if (sourceInfo.source === 'event') {
                setTolerance(values.value);
              }
            }}
            valueIsNumericString
            thousandSeparator="."
            decimalSeparator=","
            allowNegative={false}
            decimalScale={2}
            suffix=" %"
            placeholder="5 %"
            className="mt-3 h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800 sm:w-40"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} isLoading={isPending} className="w-full sm:w-auto">
            Salvar Configurações
          </Button>
        </div>
      </div>
    </ListFeedback>
  );
}
