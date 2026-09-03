import { Link } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatPercent, formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { formatCompetenceDate } from "../../../../../app/utils/formatCompetenceDate";
import { ListFeedback } from "../../../../components/ListFeedback";
import { NotesPanel } from "../../../../components/NotesPanel";
import { PriceStatusBadge } from "../../../../components/PriceStatusBadge";
import { AnalyticsFilterBar } from "../AnalyticsFilterBar";
import { AlertSection } from "./AlertSection";
import { useAnalyticsAlertsController } from "./useAnalyticsAlertsController";

const thresholdFields = [
  {
    key: 'highCostThresholdPercent',
    label: 'Custo elevado acima de',
    suffix: '%',
    hint: 'Do preço de venda. 35% é a referência comum de food cost.',
  },
  {
    key: 'costIncreaseThresholdPercent',
    label: 'Aumento de insumo acima de',
    suffix: '%',
    hint: 'Alta na última compra em relação à anterior.',
  },
  {
    key: 'wasteThresholdCost',
    label: 'Perda acima de',
    prefix: 'R$ ',
    hint: 'Em dinheiro, no período. Zero lista toda perda lançada.',
  },
] as const;

export function AnalyticsAlerts() {
  const {
    data,
    isFetching,
    isError,
    refetch,
    filters,
    setFilters,
    detailSearch,
    thresholds,
    handleThreshold,
    handleResetThresholds,
    isCustomized,
  } = useAnalyticsAlertsController();

  return (
    <>
      <AnalyticsFilterBar
        filters={filters}
        onChange={setFilters}
        show={['category', 'product', 'supplyCategory', 'supply']}
      />

      <div className="mb-6 rounded-lg border border-gray-600 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="block font-medium text-gray-500">Limiares</span>

            <span className="mt-1 block text-xs text-gray-400">
              {data?.thresholds.note
                ?? 'Limiares são referências configuráveis, não regras do sistema.'}
            </span>
          </div>

          {isCustomized && (
            <button
              type="button"
              onClick={handleResetThresholds}
              className="text-sm font-bold text-red-600"
            >
              Voltar aos padrões
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {thresholdFields.map(field => (
            <label key={field.key} className="relative block">
              <span className="absolute left-3 top-2 text-xs text-gray-700">
                {field.label}
              </span>

              <NumericFormat
                value={thresholds[field.key]}
                onValueChange={(values, sourceInfo) => {
                  if (sourceInfo.source === 'event') {
                    handleThreshold(field.key, values.value);
                  }
                }}
                valueIsNumericString
                decimalSeparator=","
                allowNegative={false}
                decimalScale={2}
                prefix={'prefix' in field ? field.prefix : undefined}
                suffix={'suffix' in field ? field.suffix : undefined}
                className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 pt-4 text-gray-800 outline-none transition-all focus:border-gray-800"
              />

              <span className="mt-1 block text-xs text-gray-400">{field.hint}</span>
            </label>
          ))}
        </div>
      </div>

      <ListFeedback
        isLoading={isFetching && !data}
        isError={isError}
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar os alertas."
        onRetry={refetch}
      >
        {data && (
          <>
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

            <div className="space-y-4">
              <AlertSection
                title="Margem abaixo da desejada"
                description="Olha o que JÁ FOI VENDIDO: a margem realizada de cada prato no período."
                count={data.summary.belowTargetMargin}
                emptyMessage="Nenhum prato vendido ficou abaixo da margem desejada."
              >
                <ul className="space-y-3">
                  {data.productsBelowTargetMargin.map(item => (
                    <li
                      key={item.productId}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-600/40 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/analytics/products/${item.productId}?${detailSearch}`}
                          className="block truncate font-medium text-gray-500 underline"
                        >
                          {item.productName}
                        </Link>

                        <span className="text-xs text-gray-400">
                          {formatQuantity(item.unitsSold)} vendida(s) ·{' '}
                          {formatCurrency(item.revenue)}
                        </span>
                      </div>

                      <span className="whitespace-nowrap text-sm">
                        <strong className="text-yellow-800">
                          {formatPercentPlain(item.marginPercent)}
                        </strong>

                        <span className="text-gray-400">
                          {' '}× {formatPercentPlain(item.targetMarginPercent)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </AlertSection>

              {/*
                Os dois primeiros alertas parecem o mesmo e não são. A nota fica
                ENTRE eles, onde a confusão acontece.
              */}
              <p className="flex items-start gap-2 rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
                <InfoCircledIcon className="mt-0.5 shrink-0" />

                <span>
                  Estes dois alertas respondem perguntas diferentes.{' '}
                  <strong>Margem abaixo da desejada</strong> olha o passado — o
                  que as vendas do período renderam.{' '}
                  <strong>Preço abaixo do recomendado</strong> olha a tabela de
                  preços contra o custo de hoje. Um prato pode estar no preço
                  certo e render pouco, se o insumo encareceu depois de o preço
                  ter sido definido.
                </span>
              </p>

              <AlertSection
                title="Preço abaixo do recomendado"
                description="Olha a TABELA DE PREÇOS contra o custo de hoje, tenha o prato vendido ou não."
                count={data.summary.belowRecommendedPrice}
                emptyMessage="Nenhum prato está abaixo do preço recomendado."
                action={
                  <Link to="/pricing" className="text-sm font-bold text-red-600">
                    Abrir formação de preço
                  </Link>
                }
              >
                <ul className="space-y-3">
                  {data.productsBelowRecommendedPrice.map(item => (
                    <li
                      key={item.productId}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-600/40 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/pricing/products/${item.productId}`}
                          className="block truncate font-medium text-gray-500 underline"
                        >
                          {item.productName}
                        </Link>

                        <span className="text-xs text-gray-400">
                          {formatCurrency(item.currentPrice)} · recomendado{' '}
                          {formatCurrency(item.recommendedPrice)}
                        </span>
                      </div>

                      <span className="flex items-center gap-2">
                        <PriceStatusBadge status={item.status} />

                        <strong className="whitespace-nowrap text-sm text-red-900">
                          {formatCurrency(item.difference)}
                        </strong>
                      </span>
                    </li>
                  ))}
                </ul>
              </AlertSection>

              <AlertSection
                title="Pratos sem ficha técnica"
                description="Sem ficha não há custo direto: eles ficam fora de margem, custo e preço recomendado."
                count={data.summary.withoutRecipe}
                emptyMessage="Todo prato ativo tem ficha técnica."
                action={
                  <Link
                    to="/menu/recipes-coverage"
                    className="text-sm font-bold text-red-600"
                  >
                    Ver a cobertura
                  </Link>
                }
              >
                <ul className="space-y-3">
                  {data.productsWithoutRecipe.map(product => (
                    <li
                      key={product.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-600/40 pb-3 last:border-0 last:pb-0"
                    >
                      <span className="min-w-0 truncate font-medium text-gray-500">
                        {product.name}
                      </span>

                      <span className="flex items-center gap-3">
                        <span className="whitespace-nowrap text-sm text-gray-400">
                          {formatCurrency(product.price)}
                        </span>

                        <Link
                          to={`/menu/recipes/new?productId=${product.id}`}
                          className="whitespace-nowrap text-sm font-bold text-red-600"
                        >
                          Criar ficha
                        </Link>
                      </span>
                    </li>
                  ))}
                </ul>
              </AlertSection>

              <AlertSection
                title="Custo elevado"
                description={`Custo completo acima de ${formatPercentPlain(data.thresholds.highCostPercentOfPrice)} do preço de venda.`}
                count={data.summary.highCost}
                emptyMessage="Nenhum prato passa do limiar de custo configurado."
              >
                <ul className="space-y-3">
                  {data.productsWithHighCost.map(item => (
                    <li
                      key={item.productId}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-600/40 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/analytics/products/${item.productId}?${detailSearch}`}
                          className="block truncate font-medium text-gray-500 underline"
                        >
                          {item.productName}
                        </Link>

                        <span className="text-xs text-gray-400">
                          custo {formatCurrency(item.fullCost)} · preço{' '}
                          {formatCurrency(item.currentPrice)}
                        </span>
                      </div>

                      <strong className={cn(
                        'whitespace-nowrap text-sm',
                        item.costShareOfPricePercent >= 100
                          ? 'text-red-900'
                          : 'text-yellow-800',
                      )}>
                        {formatPercentPlain(item.costShareOfPricePercent)} do preço
                      </strong>
                    </li>
                  ))}
                </ul>
              </AlertSection>

              <AlertSection
                title="Insumos que encareceram"
                description={`Alta acima de ${formatPercentPlain(data.thresholds.costIncreasePercent)} na última compra em relação à anterior.`}
                count={data.summary.costIncrease}
                emptyMessage="Nenhum insumo passou do limiar de aumento."
                action={
                  <Link
                    to="/purchases/cost-report"
                    className="text-sm font-bold text-red-600"
                  >
                    Ver variação de preço
                  </Link>
                }
              >
                <ul className="space-y-3">
                  {data.suppliesWithCostIncrease.map(item => (
                    <li
                      key={item.supplyId}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-600/40 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/purchases/supplies/${item.supplyId}/history`}
                          className="block truncate font-medium text-gray-500 underline"
                        >
                          {item.supplyName}
                        </Link>

                        <span className="text-xs text-gray-400">
                          {item.previousUnitCostBase === null
                            ? '—'
                            : formatCurrency(item.previousUnitCostBase)}{' '}
                          → {formatCurrency(item.currentUnitCostBase)} por{' '}
                          {item.baseUnit.code}
                        </span>
                      </div>

                      <strong className="whitespace-nowrap text-sm text-red-900">
                        {formatPercent(item.variationPercent)}
                      </strong>
                    </li>
                  ))}
                </ul>
              </AlertSection>

              <AlertSection
                title="Insumos com desperdício"
                description={`Perdas lançadas acima de ${formatCurrency(data.thresholds.wasteCost)} no período.`}
                count={data.summary.highWaste}
                emptyMessage="Nenhuma perda lançada acima do limiar."
                action={
                  <Link
                    to="/stock/movements"
                    className="text-sm font-bold text-red-600"
                  >
                    Ver movimentações
                  </Link>
                }
              >
                <ul className="space-y-3">
                  {data.suppliesWithHighWaste.map(item => (
                    <li
                      key={item.supplyId}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-600/40 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/stock/supplies/${item.supplyId}`}
                          className="block truncate font-medium text-gray-500 underline"
                        >
                          {item.supplyName}
                        </Link>

                        <span className="text-xs text-gray-400">
                          {formatQuantity(item.quantityBase)} {item.baseUnit} em{' '}
                          {item.movements} lançamento(s)
                        </span>
                      </div>

                      <strong className="whitespace-nowrap text-sm text-red-900">
                        {formatCurrency(item.cost)}
                      </strong>
                    </li>
                  ))}
                </ul>
              </AlertSection>
            </div>

            <NotesPanel
              className="mt-6"
              variant="info"
              title="Como ler estes alertas"
              notes={data.notes}
            />
          </>
        )}
      </ListFeedback>
    </>
  );
}
