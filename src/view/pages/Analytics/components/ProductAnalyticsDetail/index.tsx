import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeftIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { analyticsService } from "../../../../../app/services/analyticsService";
import {
  analyticsQueryKey,
  analyticsStaleTime,
} from "../../../../../app/hooks/useAnalyticsQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { formatCompetenceDate } from "../../../../../app/utils/formatCompetenceDate";
import { costBasisHints, costBasisLabels } from "../../../../../types/Analytics";
import { DataQualityBadge } from "../../../../components/DataQualityBadge";
import { ListFeedback } from "../../../../components/ListFeedback";
import { NotesPanel } from "../../../../components/NotesPanel";
import { PriceStatusBadge } from "../../../../components/PriceStatusBadge";
import { AnalyticsFilterBar } from "../AnalyticsFilterBar";
import { useAnalyticsFilters } from "../../useAnalyticsFilters";

export function ProductAnalyticsDetail() {
  const { productId } = useParams<{ productId: string }>();
  const { filters, setFilters, searchParams } = useAnalyticsFilters();

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: [...analyticsQueryKey, 'product', productId, filters],
    queryFn: () => analyticsService.getProductDetail(productId!, filters),
    enabled: Boolean(productId),
    staleTime: analyticsStaleTime,
    retry: false,
  });

  /** 404: o prato não vendeu no período e também não tem ficha ativa. */
  const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;

  const unit = data?.unitEconomics;
  const totals = data?.periodTotals;
  const listSearch = searchParams.toString();

  return (
    <>
      <Link
        to={`/analytics/products?${listSearch}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-red-600"
      >
        <ArrowLeftIcon />
        Voltar aos rankings
      </Link>

      <AnalyticsFilterBar filters={filters} onChange={setFilters} />

      {isNotFound && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900">
          <strong className="block text-sm">
            Nada a mostrar deste prato no período
          </strong>

          <p className="mt-2 text-xs">
            Ele não teve venda na janela escolhida e também não tem ficha
            técnica ativa — sem uma coisa nem outra, não há custo nem margem a
            calcular. Amplie o período ou{' '}
            <Link
              to={`/menu/recipes/new?productId=${productId}`}
              className="font-bold underline"
            >
              crie a ficha deste prato
            </Link>
            .
          </p>
        </div>
      )}

      <ListFeedback
        isLoading={isFetching && !data}
        isError={isError && !isNotFound}
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar os indicadores deste prato."
        onRetry={refetch}
      >
        {data && (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <strong className="text-xl font-bold text-gray-500">
                {data.productName}
              </strong>

              {data.priceStatus && <PriceStatusBadge status={data.priceStatus} />}
            </div>

            <p className="mb-6 text-sm text-gray-400">
              De{' '}
              <strong className="text-gray-500">
                {formatCompetenceDate(data.period.from)}
              </strong>{' '}
              a{' '}
              <strong className="text-gray-500">
                {formatCompetenceDate(data.period.to)}
              </strong>
            </p>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Vendidas</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatQuantity(data.sales.unitsSold)}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  em {data.sales.items} lançamento(s)
                </span>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Faturamento</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(data.sales.revenue)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Preço atual</span>

                <strong className="text-xl font-bold text-gray-500">
                  {data.currentPrice === null ? '—' : formatCurrency(data.currentPrice)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  Preço recomendado
                </span>

                <strong className="text-xl font-bold text-gray-500">
                  {data.recommendedPrice === null
                    ? '—'
                    : formatCurrency(data.recommendedPrice)}
                </strong>

                {data.recommendedPrice === null && (
                  <span className="mt-1 block text-xs text-gray-400">
                    sem ficha ativa
                  </span>
                )}
              </div>
            </div>

            {data.priceAlert && (
              <div className={cn(
                'mt-4 flex items-start gap-2 rounded-lg border p-4 text-sm',
                data.priceStatus === 'ABAIXO_DO_CUSTO'
                  ? 'border-red-200 bg-red-50 text-red-900'
                  : 'border-yellow-200 bg-yellow-50 text-yellow-900',
              )}>
                <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                <span>
                  {data.priceAlert}{' '}
                  <Link
                    to={`/pricing/products/${data.productId}`}
                    className="font-bold underline"
                  >
                    Abrir a formação de preço
                  </Link>
                  .
                </span>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/*
                Regra 4.7: custo realizado e custo atual são números diferentes.
                O rótulo diz qual dos dois está na tela antes de qualquer conta.
              */}
              {unit && (
                <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-gray-500">Economia de uma unidade</strong>

                    <span className={cn(
                      'rounded px-2 py-0.5 text-xs font-medium',
                      unit.costBasis === 'REALIZED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-500/20 text-gray-500',
                    )}>
                      {costBasisLabels[unit.costBasis]}
                    </span>
                  </div>

                  <span className="mt-1 block text-xs text-gray-400">
                    {costBasisHints[unit.costBasis]}
                  </span>

                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Preço</span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(unit.price)}
                      </span>
                    </li>

                    <li className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Custo direto</span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(unit.directCost)}
                      </span>
                    </li>

                    <li className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Custo indireto</span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(unit.indirectCost)}
                      </span>
                    </li>

                    <li className="flex items-center justify-between gap-3 border-t border-gray-600/40 pt-2">
                      <strong className="text-gray-500">Custo total</strong>

                      <strong className="whitespace-nowrap text-gray-500">
                        {formatCurrency(unit.totalCost)}
                      </strong>
                    </li>

                    <li className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Impostos</span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(unit.taxes)}
                      </span>
                    </li>

                    <li className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Taxas</span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(unit.fees)}
                      </span>
                    </li>
                  </ul>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-gray-600/40 pt-4">
                    <div>
                      <span className="block text-xs text-gray-400">Lucro</span>

                      <strong className={cn(
                        'text-2xl font-bold',
                        unit.profit < 0 ? 'text-red-900' : 'text-gray-500',
                      )}>
                        {formatCurrency(unit.profit)}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="block text-xs text-gray-400">Margem</span>

                      <strong className={cn(
                        'text-2xl font-bold',
                        unit.marginPercent !== null
                        && unit.marginPercent < data.percentages.marginPercent
                          ? 'text-yellow-800'
                          : 'text-green-800',
                      )}>
                        {formatPercentPlain(unit.marginPercent)}
                      </strong>

                      <span className="mt-1 block text-xs text-gray-400">
                        pedida: {formatPercentPlain(data.percentages.marginPercent)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {totals ? (
                <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
                  <strong className="block text-gray-500">Total do período</strong>

                  <span className="mt-1 block text-xs text-gray-400">
                    A soma das vendas, com o custo congelado em cada uma.
                  </span>

                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Faturamento</span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(totals.revenue)}
                      </span>
                    </li>

                    <li className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Custo direto</span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(totals.directCost)}
                      </span>
                    </li>

                    <li className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Custo indireto</span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(totals.indirectCost)}
                      </span>
                    </li>

                    <li className="flex items-center justify-between gap-3 border-t border-gray-600/40 pt-2">
                      <strong className="text-gray-500">Custo total</strong>

                      <strong className="whitespace-nowrap text-gray-500">
                        {formatCurrency(totals.totalCost)}
                      </strong>
                    </li>

                    <li className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Impostos</span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(totals.taxes)}
                      </span>
                    </li>

                    <li className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Taxas</span>

                      <span className="whitespace-nowrap text-gray-500">
                        {formatCurrency(totals.fees)}
                      </span>
                    </li>
                  </ul>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-gray-600/40 pt-4">
                    <div>
                      <span className="block text-xs text-gray-400">Lucro</span>

                      <strong className={cn(
                        'text-2xl font-bold',
                        totals.profit < 0 ? 'text-red-900' : 'text-gray-500',
                      )}>
                        {formatCurrency(totals.profit)}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="block text-xs text-gray-400">Margem</span>

                      <strong className="text-2xl font-bold text-gray-500">
                        {formatPercentPlain(totals.marginPercent)}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-600 bg-white p-4 text-sm text-gray-400 md:p-6">
                  Este prato não teve venda no período, então não há total a
                  somar. Os números ao lado vêm da ficha técnica atual.
                </div>
              )}
            </div>

            {/* Regra 4.2: a cobertura acompanha as margens acima. */}
            <DataQualityBadge className="mt-4" dataQuality={data.dataQuality} />

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to={`/pricing/products/${data.productId}`}
                className="text-sm font-bold text-red-600"
              >
                Ver a formação de preço
              </Link>

              <Link to="/menu/recipes-cost" className="text-sm font-bold text-red-600">
                Ver o custo das fichas
              </Link>
            </div>

            <NotesPanel
              className="mt-6"
              title="Ressalvas deste cálculo"
              notes={data.caveats}
            />
          </>
        )}
      </ListFeedback>
    </>
  );
}
