import { Link } from "react-router-dom";
import { ArrowLeftIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { formatCompetenceDate } from "../../../../../app/utils/formatCompetenceDate";
import { isUnreachablePriceError } from "../../../../../app/utils/isUnreachablePriceError";
import { ListFeedback } from "../../../../components/ListFeedback";
import { NotesPanel } from "../../../../components/NotesPanel";
import { PriceStatusBadge } from "../../../../components/PriceStatusBadge";
import { TableComponents } from "../../../../components/TableElements";
import { ApplyPriceModal } from "../ApplyPriceModal";
import { PricingOverridesBar } from "../PricingOverridesBar";
import { ProfitabilityBreakdown } from "../ProfitabilityBreakdown";
import { UnreachablePriceNotice } from "../UnreachablePriceNotice";
import { usePricingProductDetailController } from "./usePricingProductDetailController";

export function PricingProductDetail() {
  const {
    productId,
    data,
    isFetching,
    isError,
    error,
    isNotFound,
    refetch,
    overrides,
    setOverrides,
    listSearch,
    priceToApply,
    handleOpenApply,
    handleCloseApply,
  } = usePricingProductDetailController();

  const currentMargin = data?.profitability.atCurrentPrice?.marginPercent ?? null;
  const missesTarget =
    data !== undefined
    && currentMargin !== null
    && currentMargin < data.targetMarginPercent;

  return (
    <>
      {data && priceToApply && (
        <ApplyPriceModal
          visible
          onClose={handleCloseApply}
          productName={data.productName}
          price={priceToApply.price}
          marginPercent={priceToApply.marginPercent}
          targetMarginPercent={data.targetMarginPercent}
          currentPrice={data.currentPrice}
          source={priceToApply.source}
        />
      )}

      <Link
        to={`/pricing?${listSearch}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-red-600"
      >
        <ArrowLeftIcon />
        Voltar ao cardápio
      </Link>

      <PricingOverridesBar
        overrides={overrides}
        onChange={setOverrides}
        percentages={data?.percentages}
      />

      <div className="mb-6">
        <UnreachablePriceNotice error={error} />
      </div>

      {isNotFound && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900">
          <strong className="block text-sm">
            Este prato não tem ficha técnica ativa
          </strong>

          <p className="mt-2 text-xs">
            Sem ficha não há custo direto, e sem custo direto não existe preço a
            recomendar — qualquer número aqui seria chute.{' '}
            <Link
              to={`/menu/recipes/new?productId=${productId}`}
              className="font-bold underline"
            >
              Criar a ficha deste prato
            </Link>
            .
          </p>
        </div>
      )}

      <ListFeedback
        isLoading={isFetching}
        isError={
          isError && !isNotFound && !data && !isUnreachablePriceError(error)
        }
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar a formação de preço deste prato."
        onRetry={refetch}
      >
        {data && (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <strong className="text-xl font-bold text-gray-500">
                {data.productName}
              </strong>

              <PriceStatusBadge status={data.status} />

              {data.hasMissingCost && (
                <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-900">
                  custo incompleto
                </span>
              )}
            </div>

            <p className="mb-6 text-sm text-gray-400">
              Custo indireto da competência de{' '}
              <strong className="text-gray-500">
                {formatCompetenceDate(data.period.from)}
              </strong>{' '}
              a{' '}
              <strong className="text-gray-500">
                {formatCompetenceDate(data.period.to)}
              </strong>
            </p>

            {/* A conta, na ordem em que ela é feita. */}
            <div className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Custo direto</span>

                  <span className="whitespace-nowrap text-gray-500">
                    {formatCurrency(data.cost.directCost)}
                  </span>
                </li>

                <li className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">
                    Custo indireto rateado
                  </span>

                  <span className="whitespace-nowrap text-gray-500">
                    {formatCurrency(data.cost.indirectCost)}
                  </span>
                </li>
              </ul>

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-600/40 pt-3">
                <strong className="text-gray-500">Custo completo</strong>

                <strong className="whitespace-nowrap text-gray-500">
                  {formatCurrency(data.cost.fullCost)}
                </strong>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-600/40 pt-4">
                <div>
                  <span className="block text-xs text-gray-400">Impostos</span>

                  <strong className="text-gray-500">
                    {formatPercentPlain(data.percentages.taxPercent)}
                  </strong>
                </div>

                <div>
                  <span className="block text-xs text-gray-400">Taxas</span>

                  <strong className="text-gray-500">
                    {formatPercentPlain(data.percentages.feesPercent)}
                  </strong>
                </div>

                <div>
                  <span className="block text-xs text-gray-400">Margem</span>

                  <strong className="text-gray-500">
                    {formatPercentPlain(data.percentages.marginPercent)}
                  </strong>
                </div>
              </div>

              <ul className="mt-4 space-y-2 border-t border-gray-600/40 pt-4 text-sm">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Preço atual</span>

                  <span className="whitespace-nowrap text-gray-500">
                    {data.currentPrice === null ? '—' : formatCurrency(data.currentPrice)}
                  </span>
                </li>

                <li className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-medium text-gray-500">Preço recomendado</span>

                  <span className="flex items-center gap-3">
                    <strong className="whitespace-nowrap text-xl font-bold text-gray-500">
                      {formatCurrency(data.recommendedPrice)}
                    </strong>

                    <button
                      type="button"
                      onClick={() => handleOpenApply({
                        price: data.recommendedPrice,
                        marginPercent: data.profitability.atRecommendedPrice.marginPercent,
                        source: 'Preço recomendado',
                      })}
                      className="whitespace-nowrap text-sm font-bold text-red-600"
                    >
                      Aplicar
                    </button>
                  </span>
                </li>

                <li className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Diferença</span>

                  <strong className={cn(
                    'whitespace-nowrap',
                    data.difference !== null && data.difference < 0
                      ? 'text-red-900'
                      : 'text-gray-500',
                  )}>
                    {data.difference === null ? '—' : formatCurrency(data.difference)}
                  </strong>
                </li>
              </ul>

              {/*
                O que justifica o alerta não é a diferença em reais, é a margem.
                Por isso ela vem no mesmo tamanho do preço, e não como rodapé.
              */}
              {data.alert && (
                <div className={cn(
                  'mt-4 rounded-lg border p-4',
                  data.status === 'ABAIXO_DO_CUSTO'
                    ? 'border-red-200 bg-red-50'
                    : 'border-yellow-200 bg-yellow-50',
                )}>
                  <div className={cn(
                    'flex items-start gap-2',
                    data.status === 'ABAIXO_DO_CUSTO' ? 'text-red-900' : 'text-yellow-900',
                  )}>
                    <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                    <strong className="text-sm">{data.alert}</strong>
                  </div>

                  <div className="mt-4 flex flex-wrap items-end gap-6">
                    <div>
                      <span className="block text-xs text-gray-400">
                        Margem no preço atual
                      </span>

                      <strong className={cn(
                        'text-2xl font-bold',
                        data.status === 'ABAIXO_DO_CUSTO' ? 'text-red-900' : 'text-yellow-800',
                      )}>
                        {formatPercentPlain(currentMargin)}
                      </strong>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">
                        Margem pedida
                      </span>

                      <strong className="text-2xl font-bold text-gray-500">
                        {formatPercentPlain(data.targetMarginPercent)}
                      </strong>
                    </div>
                  </div>

                  {missesTarget && (
                    <p className="mt-3 text-xs text-gray-500">
                      É a margem que explica o alerta: a diferença em reais só
                      mede o quanto o preço andou.
                    </p>
                  )}
                </div>
              )}

              {data.currentPrice === null && (
                <p className="mt-4 text-xs text-yellow-800">
                  Este prato não tem preço cadastrado, então não há o que
                  comparar com o recomendado.
                </p>
              )}
            </div>

            {data.hasMissingCost && (
              <p className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-xs text-yellow-900">
                A ficha deste prato usa insumo nunca comprado. O custo direto
                está subestimado, e o preço recomendado sai mais baixo do que
                deveria — registre a compra desse insumo antes de decidir por
                este número.
              </p>
            )}

            <h3 className="mb-4 mt-8 text-lg font-semibold text-gray-500">
              Rentabilidade nos dois preços
            </h3>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {data.profitability.atCurrentPrice ? (
                <ProfitabilityBreakdown
                  title="No preço atual"
                  subtitle="É o que cada venda entrega hoje."
                  breakdown={data.profitability.atCurrentPrice}
                  targetMarginPercent={data.targetMarginPercent}
                />
              ) : (
                <div className="rounded-lg border border-gray-600 bg-white p-4 text-sm text-gray-400 md:p-6">
                  Sem preço cadastrado não há rentabilidade atual a mostrar.
                </div>
              )}

              <ProfitabilityBreakdown
                highlight
                title="No preço recomendado"
                subtitle="É o que a margem pedida exige."
                breakdown={data.profitability.atRecommendedPrice}
                targetMarginPercent={data.targetMarginPercent}
              />
            </div>

            <h3 className="mb-2 mt-8 text-lg font-semibold text-gray-500">
              Arredondamento
            </h3>

            <p className="mb-4 text-sm text-gray-400">
              Preços de cardápio perto do recomendado, cada um com a margem que
              ele realmente entrega. Arredondar para baixo come margem; para
              cima, sobra.
            </p>

            <div className="space-y-3 md:hidden">
              {data.roundingSuggestions.map(suggestion => (
                <div
                  key={suggestion.strategy}
                  className="rounded-lg border border-gray-600 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <strong className="block text-gray-500">
                        {formatCurrency(suggestion.price)}
                      </strong>

                      <span className="text-xs text-gray-400">
                        {suggestion.label}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenApply({
                        price: suggestion.price,
                        marginPercent: suggestion.marginPercent,
                        source: suggestion.label,
                      })}
                      className="whitespace-nowrap text-sm font-bold text-red-600"
                    >
                      Aplicar
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="block text-xs text-gray-400">Diferença</span>

                      <span className={cn(
                        suggestion.differenceFromRecommended < 0
                          ? 'text-red-900'
                          : 'text-gray-500',
                      )}>
                        {formatCurrency(suggestion.differenceFromRecommended)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Margem</span>

                      <strong className={cn(
                        suggestion.marginPercent !== null
                        && suggestion.marginPercent < data.targetMarginPercent
                          ? 'text-yellow-800'
                          : 'text-green-800',
                      )}>
                        {formatPercentPlain(suggestion.marginPercent)}
                      </strong>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Lucro</span>

                      <span className="text-gray-500">
                        {formatCurrency(suggestion.profit)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <TableComponents.Table>
                <thead>
                  <tr className="bg-gray-600/20">
                    <TableComponents.TableHeader>Preço</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Estratégia</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Diferença</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Margem</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Lucro</TableComponents.TableHeader>
                    <TableComponents.TableHeader> </TableComponents.TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {data.roundingSuggestions.map(suggestion => (
                    <TableComponents.TableRow key={suggestion.strategy}>
                      <TableComponents.TableCell className="whitespace-nowrap font-medium">
                        {formatCurrency(suggestion.price)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>
                        {suggestion.label}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell
                        className={cn(
                          'whitespace-nowrap',
                          suggestion.differenceFromRecommended < 0 && 'text-red-900',
                        )}
                      >
                        {formatCurrency(suggestion.differenceFromRecommended)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        <strong className={cn(
                          suggestion.marginPercent !== null
                          && suggestion.marginPercent < data.targetMarginPercent
                            ? 'text-yellow-800'
                            : 'text-green-800',
                        )}>
                          {formatPercentPlain(suggestion.marginPercent)}
                        </strong>
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatCurrency(suggestion.profit)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>
                        <button
                          type="button"
                          onClick={() => handleOpenApply({
                            price: suggestion.price,
                            marginPercent: suggestion.marginPercent,
                            source: suggestion.label,
                          })}
                          className="whitespace-nowrap text-sm font-bold text-red-600"
                        >
                          Aplicar
                        </button>
                      </TableComponents.TableCell>
                    </TableComponents.TableRow>
                  ))}
                </tbody>
              </TableComponents.Table>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to={`/pricing/simulate?productId=${data.productId}&${listSearch}`}
                className="text-sm font-bold text-red-600"
              >
                Simular outras margens para este prato
              </Link>

              <Link to="/expenses/full-cost" className="text-sm font-bold text-red-600">
                Ver a composição do custo indireto
              </Link>
            </div>

            <NotesPanel
              className="mt-6"
              title="Ressalvas deste cálculo"
              notes={data.caveats}
            />

            <NotesPanel
              className="mt-4"
              variant="info"
              title="Como ler estes preços"
              notes={data.notes}
            />
          </>
        )}
      </ListFeedback>
    </>
  );
}
