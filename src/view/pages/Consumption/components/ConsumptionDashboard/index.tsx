import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { consumptionService } from "../../../../../app/services/consumptionService";
import {
  consumptionQueryKey,
  consumptionStaleTime,
} from "../../../../../app/hooks/useConsumptionQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatPercent, formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { ListFeedback } from "../../../../components/ListFeedback";
import { ConsumptionFilterBar } from "../ConsumptionFilterBar";
import { ConsumptionPeriodLine } from "../ConsumptionPeriodLine";
import { InterpretationPanel } from "../InterpretationPanel";
import { useConsumptionFilters } from "../../useConsumptionFilters";

export function ConsumptionDashboard() {
  const { filters, setFilters, searchParams } = useConsumptionFilters();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...consumptionQueryKey, 'dashboard', filters],
    queryFn: () => consumptionService.getDashboard(filters),
    staleTime: consumptionStaleTime,
  });

  const search = searchParams.toString();
  const spentMore = (data?.totalDeviationCost ?? 0) > 0;

  return (
    <>
      <ConsumptionFilterBar filters={filters} onChange={setFilters} />

      <ListFeedback
        isLoading={isFetching && !data}
        isError={isError}
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar o painel de consumo."
        onRetry={refetch}
      >
        {data && (
          <>
            <ConsumptionPeriodLine period={data.period}>
              {' '}· tolerância de{' '}
              <strong className="text-gray-500">
                {formatPercentPlain(data.tolerancePercent)}
              </strong>
            </ConsumptionPeriodLine>

            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  Estimado pelas fichas
                </span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(data.estimatedConsumptionCost)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  Real, pelo razão
                </span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(data.realConsumptionCost)}
                </strong>
              </div>

              <div className={cn(
                'rounded-lg border p-4',
                spentMore ? 'border-yellow-200 bg-yellow-50' : 'border-gray-600 bg-white',
              )}>
                <span className="block text-xs text-gray-400">Desvio líquido</span>

                <strong className={cn(
                  'text-xl font-bold',
                  spentMore ? 'text-yellow-800' : 'text-gray-500',
                )}>
                  {formatCurrency(data.totalDeviationCost)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  Desvio sobre o previsto
                </span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatPercent(data.wastePercent)}
                </strong>
              </div>
            </div>

            {/*
              O líquido compensa: +10 num insumo e −10 em outro somam zero, e
              seriam dois problemas lidos como nenhum. O bruto é quem conta.
            */}
            <section className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
              <strong className="block text-gray-500">
                O desvio sem compensação
              </strong>

              <span className="mt-1 block text-xs text-gray-400">
                O líquido acima soma sobras com faltas. Aqui os dois lados
                aparecem separados.
              </span>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <span className="block text-xs text-gray-400">
                    Saiu mais que o previsto
                  </span>

                  <strong className="text-lg font-bold text-red-900">
                    {formatCurrency(data.deviationCost.aboveExpected)}
                  </strong>

                  <span className="mt-1 block text-xs text-gray-500">
                    {data.counts.aboveExpected} insumo(s)
                  </span>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <span className="block text-xs text-gray-400">
                    Saiu menos que o previsto
                  </span>

                  <strong className="text-lg font-bold text-blue-900">
                    {formatCurrency(data.deviationCost.belowExpected)}
                  </strong>

                  <span className="mt-1 block text-xs text-gray-500">
                    {data.counts.belowExpected} insumo(s)
                  </span>
                </div>

                <div className="rounded-lg border border-gray-600 p-4">
                  <span className="block text-xs text-gray-400">
                    Total a apurar
                  </span>

                  <strong className="text-lg font-bold text-gray-500">
                    {formatCurrency(data.deviationCost.gross)}
                  </strong>

                  <span className="mt-1 block text-xs text-gray-500">
                    soma dos dois lados, em módulo
                  </span>
                </div>
              </div>
            </section>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  Insumos comparados
                </span>

                <strong className="text-xl font-bold text-gray-500">
                  {data.counts.supplies}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  Dentro da tolerância
                </span>

                <strong className="text-xl font-bold text-green-800">
                  {data.counts.withinTolerance}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Pratos vendidos</span>

                <strong className="text-xl font-bold text-gray-500">
                  {data.counts.productsSold}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  Vendidos sem ficha
                </span>

                <strong className={cn(
                  'text-xl font-bold',
                  data.counts.productsWithoutRecipe > 0
                    ? 'text-yellow-800'
                    : 'text-green-800',
                )}>
                  {data.counts.productsWithoutRecipe}
                </strong>
              </div>
            </div>

            {data.counts.productsWithoutRecipe > 0 && (
              <p className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-xs text-yellow-900">
                {data.counts.productsWithoutRecipe} prato(s) foram vendidos sem
                ficha ativa. O consumo previsto deles é zero, então tudo o que
                saiu para prepará-los entra como desvio — é a primeira coisa a
                corrigir quando o número não fecha.{' '}
                <Link to="/menu/recipes-coverage" className="font-bold underline">
                  Ver a cobertura de fichas
                </Link>
                .
              </p>
            )}

            <p className="mt-4 flex items-start gap-2 text-xs text-gray-400">
              <InfoCircledIcon className="mt-0.5 shrink-0" />

              <span>
                Os totais são em dinheiro, não em quantidade: grama, mililitro e
                unidade não se somam. A tolerância de{' '}
                {formatPercentPlain(data.tolerancePercent)} vem das{' '}
                <Link to="/settings/stock" className="font-bold underline">
                  configurações de estoque
                </Link>
                .
              </span>
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to={`/consumption/by-supply?${search}`}
                className="text-sm font-bold text-red-600"
              >
                Ver insumo por insumo
              </Link>

              <Link
                to={`/consumption/deviations?${search}`}
                className="text-sm font-bold text-red-600"
              >
                Ver os maiores desvios
              </Link>

              <Link
                to={`/consumption/losses?${search}`}
                className="text-sm font-bold text-red-600"
              >
                Ver as maiores perdas
              </Link>
            </div>

            <InterpretationPanel
              className="mt-6"
              interpretation={data.interpretation}
            />
          </>
        )}
      </ListFeedback>
    </>
  );
}
