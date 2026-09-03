import { useQuery } from "@tanstack/react-query";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { ordersService } from "../../app/services/ordersService";
import { cn } from "../../app/utils/cn";
import { formatCurrency } from "../../app/utils/formatCurrency";
import { formatQuantity } from "../../app/utils/formatQuantity";
import { stockMovementTypeLabels } from "../../types/StockMovement";
import { Spinner } from "./Spinner";

interface OrderConsumptionPanelProps {
  orderId: string;
}

/**
 * O que este pedido tirou do estoque. `netConsumption` zerado em todos os
 * insumos significa venda totalmente estornada — o extrato continua mostrando
 * a saída e o retorno, porque o razão é append-only.
 */
export function OrderConsumptionPanel({ orderId }: OrderConsumptionPanelProps) {
  const { data, isFetching, isError } = useQuery({
    queryKey: ['orders', orderId, 'consumption'],
    queryFn: () => ordersService.getConsumption(orderId),
    enabled: Boolean(orderId),
  });

  if (isFetching) {
    return (
      <div className="mt-8 flex justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mt-8 rounded-lg border border-gray-600 p-4 text-xs text-gray-400">
        Não foi possível carregar o consumo de estoque deste pedido.
      </div>
    );
  }

  const withoutRecipe = data.items.filter(item => item.recipeId === null);
  const isFullyReversed =
    data.movements.length > 0
    && data.netConsumption.every(entry => entry.quantityBase === 0);

  return (
    <div className="mt-8 rounded-lg border border-gray-600 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong className="text-sm font-bold text-gray-500">
          O que este pedido tirou do estoque
        </strong>

        <span className="text-sm text-gray-400">
          Custo realizado:{' '}
          <strong className="text-gray-500">{formatCurrency(data.totalRecipeCost)}</strong>
        </span>
      </div>

      <p className="mt-1 flex items-start gap-2 text-xs text-gray-400">
        <InfoCircledIcon className="mt-0.5 shrink-0" />

        Custo realizado é o que foi congelado na venda — o que o prato custou
        naquele dia. Não é o custo atual da ficha, que muda quando o insumo
        muda de preço.
      </p>

      {data.movements.length === 0 && (
        <p className="mt-3 text-sm text-gray-400">
          Nenhuma movimentação de estoque foi gerada por este pedido. Isso
          acontece quando a conta ainda não foi fechada ou quando os pratos não
          tinham ficha técnica ativa na hora da venda.
        </p>
      )}

      {withoutRecipe.length > 0 && (
        <p className="mt-3 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
          {withoutRecipe.length} item(ns) deste pedido foram vendidos sem ficha
          técnica: nada foi consumido do estoque por eles.
        </p>
      )}

      {isFullyReversed && (
        <p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
          O saldo líquido está zerado em todos os insumos: o consumo desta venda
          foi inteiramente estornado.
        </p>
      )}

      {data.netConsumption.length > 0 && (
        <div className="mt-4">
          <span className="text-xs font-bold uppercase text-gray-400">
            Saldo líquido por insumo
          </span>

          <ul className="mt-2 space-y-1">
            {data.netConsumption.map(entry => (
              <li
                key={entry.supplyId}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="min-w-0 truncate text-gray-500">{entry.supplyName}</span>

                <span className={cn(
                  'whitespace-nowrap font-medium',
                  entry.quantityBase < 0 ? 'text-red-800' : 'text-gray-400',
                )}>
                  {formatQuantity(entry.quantityBase)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.movements.length > 0 && (
        <div className="mt-4">
          <span className="text-xs font-bold uppercase text-gray-400">
            Movimentações
          </span>

          <ul className="mt-2 space-y-1">
            {data.movements.map(movement => (
              <li
                key={movement.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="min-w-0 truncate text-gray-500">
                  {movement.supply.name}

                  <span className="ml-2 text-xs text-gray-400">
                    {stockMovementTypeLabels[movement.type]}
                    {movement.reversalOfId && ' · estorno'}
                  </span>
                </span>

                <span className={cn(
                  'whitespace-nowrap font-medium',
                  movement.quantityBase < 0 ? 'text-red-800' : 'text-green-800',
                )}>
                  {formatQuantity(movement.quantityBase)} {movement.unit.code}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
