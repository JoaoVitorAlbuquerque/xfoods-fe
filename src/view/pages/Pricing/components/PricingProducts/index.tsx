import { Link } from "react-router-dom";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { formatCompetenceDate } from "../../../../../app/utils/formatCompetenceDate";
import { isUnreachablePriceError } from "../../../../../app/utils/isUnreachablePriceError";
import { priceStatuses, priceStatusLabels } from "../../../../../types/Pricing";
import { ContentHeader } from "../../../../components/ContentHeader";
import { Input } from "../../../../components/Input";
import { ListFeedback } from "../../../../components/ListFeedback";
import { NotesPanel } from "../../../../components/NotesPanel";
import { PriceStatusBadge } from "../../../../components/PriceStatusBadge";
import { Select } from "../../../../components/Select";
import { TableComponents } from "../../../../components/TableElements";
import { PricingOverridesBar } from "../PricingOverridesBar";
import { UnreachablePriceNotice } from "../UnreachablePriceNotice";
import { usePricingProductsController } from "./usePricingProductsController";

/** `null` só acontece com prato sem preço cadastrado. */
function formatMoney(value: number | null) {
  return value === null ? '—' : formatCurrency(value);
}

export function PricingProducts() {
  const {
    data,
    items,
    isFetching,
    isError,
    error,
    refetch,
    overrides,
    setOverrides,
    detailSearch,
    search,
    setSearch,
    status,
    setStatus,
  } = usePricingProductsController();

  const summary = data?.summary;
  const belowCost = data?.items.filter(item => item.status === 'ABAIXO_DO_CUSTO') ?? [];
  const withoutRecipe = summary?.productsWithoutRecipe ?? [];

  return (
    <>
      <PricingOverridesBar
        overrides={overrides}
        onChange={setOverrides}
        percentages={data?.percentages}
      />

      <div className="mb-6">
        <UnreachablePriceNotice error={error} />
      </div>

      <ListFeedback
        isLoading={isFetching}
        isError={isError && !data && !isUnreachablePriceError(error)}
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar a formação de preço do cardápio."
        onRetry={refetch}
      >
        {data && summary && (
          <>
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

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Pratos precificados</span>

                <strong className="text-xl font-bold text-gray-500">
                  {summary.products}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Abaixo do custo</span>

                <strong className={cn(
                  'text-xl font-bold',
                  summary.belowCost > 0 ? 'text-red-900' : 'text-green-800',
                )}>
                  {summary.belowCost}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Abaixo do recomendado</span>

                <strong className={cn(
                  'text-xl font-bold',
                  summary.belowRecommended > 0 ? 'text-yellow-800' : 'text-green-800',
                )}>
                  {summary.belowRecommended}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Lucro na mesa</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(summary.gapPerUnit)}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  por unidade, somando os pratos fora do recomendado
                </span>
              </div>
            </div>

            {belowCost.length > 0 && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2 text-red-900">
                  <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                  <div className="min-w-0">
                    <strong className="block text-sm">
                      {belowCost.length} prato(s) vendidos abaixo do custo
                    </strong>

                    <p className="mt-1 text-xs">
                      Não é margem apertada: depois de imposto e taxas, cada uma
                      dessas vendas dá prejuízo. Aqui vender mais aumenta a perda.
                    </p>

                    <ul className="mt-3 space-y-1 text-xs">
                      {belowCost.map(item => (
                        <li key={item.productId}>
                          <Link
                            to={`/pricing/products/${item.productId}?${detailSearch}`}
                            className="font-bold underline"
                          >
                            {item.productName}
                          </Link>
                          : preço {formatMoney(item.currentPrice)}, recomendado{' '}
                          {formatCurrency(item.recommendedPrice)} → margem{' '}
                          {formatPercentPlain(item.currentMarginPercent)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {withoutRecipe.length > 0 && (
              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900">
                <strong className="block text-sm">
                  {withoutRecipe.length} prato(s) sem ficha ativa ficam fora desta tela
                </strong>

                <p className="mt-1 text-xs">
                  Sem ficha não há custo direto, e sem custo direto não existe
                  preço a recomendar:{' '}
                  {withoutRecipe.map(product => product.name).join(', ')}.{' '}
                  <Link to="/menu/recipes-coverage" className="font-bold underline">
                    Ver a cobertura de fichas
                  </Link>
                  .
                </p>
              </div>
            )}

            <ContentHeader title="Cardápio" quantity={items.length} />

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                name="search"
                placeholder="Buscar prato"
                value={search}
                onChange={event => setSearch(event.target.value)}
              />

              <Select
                value={status}
                onChange={event => setStatus(event.target.value as typeof status)}
              >
                <option value="">Todas as situações</option>

                {priceStatuses.map(option => (
                  <option key={option} value={option}>
                    {priceStatusLabels[option]}
                  </option>
                ))}
              </Select>
            </div>

            {items.length === 0 && (
              <div className="rounded-lg border border-gray-600 bg-white p-8 text-center text-gray-400">
                Nenhum prato com ficha ativa para estes filtros.
              </div>
            )}

            <div className="space-y-3 md:hidden">
              {items.map(item => (
                <Link
                  key={item.productId}
                  to={`/pricing/products/${item.productId}?${detailSearch}`}
                  className={cn(
                    'block rounded-lg border bg-white p-4',
                    item.status === 'ABAIXO_DO_CUSTO' ? 'border-red-200' : 'border-gray-600',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong className="min-w-0 truncate text-gray-500">
                      {item.productName}
                    </strong>

                    <PriceStatusBadge status={item.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="block text-xs text-gray-400">Preço atual</span>
                      <span className="text-gray-500">{formatMoney(item.currentPrice)}</span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Recomendado</span>
                      <strong className="text-gray-500">
                        {formatCurrency(item.recommendedPrice)}
                      </strong>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Custo completo</span>
                      <span className="text-gray-500">{formatCurrency(item.fullCost)}</span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Diferença</span>
                      <span className={cn(
                        'text-gray-500',
                        item.difference !== null && item.difference < 0 && 'text-red-900',
                      )}>
                        {formatMoney(item.difference)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-600/40 pt-2">
                    <span className="text-xs text-gray-400">Margem atual × pedida</span>

                    <span className="text-sm">
                      <strong className={cn(
                        item.status === 'ABAIXO_DO_CUSTO' ? 'text-red-900' : 'text-gray-500',
                      )}>
                        {formatPercentPlain(item.currentMarginPercent)}
                      </strong>

                      <span className="text-gray-400">
                        {' '}× {formatPercentPlain(item.targetMarginPercent)}
                      </span>
                    </span>
                  </div>

                  {item.hasMissingCost && (
                    <span className="mt-3 block rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-900">
                      A ficha usa insumo nunca comprado: o custo e o preço
                      recomendado estão subestimados.
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <TableComponents.Table>
                <thead>
                  <tr className="bg-gray-600/20">
                    <TableComponents.TableHeader>Prato</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo completo</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Preço atual</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Recomendado</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Diferença</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Margem atual</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Situação</TableComponents.TableHeader>
                    <TableComponents.TableHeader> </TableComponents.TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {items.map(item => (
                    <TableComponents.TableRow key={item.productId}>
                      <TableComponents.TableCell>
                        {item.productName}

                        {item.hasMissingCost && (
                          <span
                            className="ml-2 rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-900"
                            title="A ficha usa insumo nunca comprado: o custo direto está subestimado, e o preço recomendado junto."
                          >
                            custo incompleto
                          </span>
                        )}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatCurrency(item.fullCost)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatMoney(item.currentPrice)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap font-medium">
                        {formatCurrency(item.recommendedPrice)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell
                        className={cn(
                          'whitespace-nowrap',
                          item.difference !== null && item.difference < 0 && 'text-red-900',
                        )}
                      >
                        {formatMoney(item.difference)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        <strong className={cn(
                          item.status === 'ABAIXO_DO_CUSTO' && 'text-red-900',
                        )}>
                          {formatPercentPlain(item.currentMarginPercent)}
                        </strong>

                        <span className="text-gray-400">
                          {' '}× {formatPercentPlain(item.targetMarginPercent)}
                        </span>
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>
                        <PriceStatusBadge status={item.status} />
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>
                        <Link
                          to={`/pricing/products/${item.productId}?${detailSearch}`}
                          className="whitespace-nowrap text-sm font-bold text-red-600"
                        >
                          Ver detalhe
                        </Link>
                      </TableComponents.TableCell>
                    </TableComponents.TableRow>
                  ))}
                </tbody>
              </TableComponents.Table>
            </div>

            {summary.withMissingSupplyCost > 0 && (
              <p className="mt-4 text-xs text-yellow-800">
                {summary.withMissingSupplyCost} ficha(s) usam insumo nunca
                comprado. Nelas o custo direto está subestimado, e o preço
                recomendado sai mais baixo do que deveria.
              </p>
            )}

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
