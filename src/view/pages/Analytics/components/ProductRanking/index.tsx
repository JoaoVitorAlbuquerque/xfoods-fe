import { Link } from "react-router-dom";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { formatCompetenceDate } from "../../../../../app/utils/formatCompetenceDate";
import {
  productRankingHints,
  productRankingLabels,
  productRankings,
} from "../../../../../types/Analytics";
import { ContentHeader } from "../../../../components/ContentHeader";
import { DataQualityBadge } from "../../../../components/DataQualityBadge";
import { ListFeedback } from "../../../../components/ListFeedback";
import { NotesPanel } from "../../../../components/NotesPanel";
import { TableComponents } from "../../../../components/TableElements";
import { ReportFilterBar } from "../../../../components/ReportFilterBar";
import { useProductRankingController } from "./useProductRankingController";

export function ProductRanking() {
  const {
    data,
    isFetching,
    isError,
    refetch,
    filters,
    setFilters,
    detailSearch,
    rankBy,
    setRankBy,
    page,
    setPage,
    pageCount,
  } = useProductRankingController();

  return (
    <>
      <div className="-mx-4 mb-3 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {productRankings.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setRankBy(option)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm transition-all',
                rankBy === option
                  ? 'border-red-800 bg-red-800 text-white'
                  : 'border-gray-600 text-gray-500',
              )}
            >
              {productRankingLabels[option]}
            </button>
          ))}
        </div>
      </div>

      {/*
        Os seis rankings discordam entre si de propósito. Dizer o que cada um
        mede evita a leitura de que um deles está errado.
      */}
      <p className="mb-6 flex items-start gap-2 text-xs text-gray-400">
        <InfoCircledIcon className="mt-0.5 shrink-0" />

        <span>
          {productRankingHints[rankBy]} O prato que mais fatura raramente é o que
          mais lucra — por isso as seis listas não coincidem.
        </span>
      </p>

      <ReportFilterBar
        filters={filters}
        onChange={setFilters}
        periodHint="Em branco, o período é o mês corrente. O recorte vale para as vendas e para a despesa rateada."
        show={['category', 'product']}
      />

      <ListFeedback
        isLoading={isFetching && !data}
        isError={isError}
        isEmpty={Boolean(data) && data!.items.length === 0}
        emptyMessage="Nenhuma venda no período para este recorte."
        errorMessage="Não foi possível carregar o ranking."
        onRetry={refetch}
      >
        {data && data.items.length > 0 && (
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
              {data.indirectCostPerUnit !== null && (
                <>
                  {' '}· rateio de{' '}
                  <strong className="text-gray-500">
                    {formatCurrency(data.indirectCostPerUnit)}
                  </strong>{' '}
                  por unidade
                </>
              )}
            </p>

            <ContentHeader
              title={productRankingLabels[rankBy]}
              quantity={data.total}
            />

            <div className="space-y-3 md:hidden">
              {data.items.map((item, index) => (
                <Link
                  key={item.productId}
                  to={`/analytics/products/${item.productId}?${detailSearch}`}
                  className="block rounded-lg border border-gray-600 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong className="min-w-0 truncate text-gray-500">
                      {data.offset + index + 1}. {item.productName}
                    </strong>

                    <strong className={cn(
                      'whitespace-nowrap',
                      item.profit < 0 ? 'text-red-900' : 'text-gray-500',
                    )}>
                      {formatCurrency(item.profit)}
                    </strong>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="block text-xs text-gray-400">Vendidas</span>
                      <span className="text-gray-500">{formatQuantity(item.units)}</span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Faturamento</span>
                      <span className="text-gray-500">{formatCurrency(item.revenue)}</span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Custo total</span>
                      <span className="text-gray-500">{formatCurrency(item.totalCost)}</span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Margem</span>

                      <strong className={cn(
                        item.marginPercent !== null
                        && item.marginPercent < data.percentages.marginPercent
                          ? 'text-yellow-800'
                          : 'text-green-800',
                      )}>
                        {formatPercentPlain(item.marginPercent)}
                      </strong>
                    </div>
                  </div>

                  <DataQualityBadge
                    compact
                    className="mt-3"
                    dataQuality={item.dataQuality}
                  />
                </Link>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <TableComponents.Table>
                <thead>
                  <tr className="bg-gray-600/20">
                    <TableComponents.TableHeader>#</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Prato</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Vendidas</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Faturamento</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo direto</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo total</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Lucro</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Margem</TableComponents.TableHeader>
                    <TableComponents.TableHeader> </TableComponents.TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {data.items.map((item, index) => (
                    <TableComponents.TableRow key={item.productId}>
                      <TableComponents.TableCell className="text-gray-400">
                        {data.offset + index + 1}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>
                        {item.productName}

                        {item.categoryName && (
                          <span className="ml-2 text-xs text-gray-400">
                            {item.categoryName}
                          </span>
                        )}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(item.units)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatCurrency(item.revenue)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatCurrency(item.directCost)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatCurrency(item.totalCost)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell
                        className={cn(
                          'whitespace-nowrap font-medium',
                          item.profit < 0 && 'text-red-900',
                        )}
                      >
                        {formatCurrency(item.profit)}
                      </TableComponents.TableCell>

                      {/* Regra 4.2: a cobertura anda colada na margem. */}
                      <TableComponents.TableCell className="whitespace-nowrap">
                        <strong className={cn(
                          item.marginPercent !== null
                          && item.marginPercent < data.percentages.marginPercent
                            ? 'text-yellow-800'
                            : 'text-green-800',
                        )}>
                          {formatPercentPlain(item.marginPercent)}
                        </strong>

                        <DataQualityBadge
                          compact
                          className="ml-2"
                          dataQuality={item.dataQuality}
                        />
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>
                        <Link
                          to={`/analytics/products/${item.productId}?${detailSearch}`}
                          className="whitespace-nowrap text-sm font-bold text-red-600"
                        >
                          Ver prato
                        </Link>
                      </TableComponents.TableCell>
                    </TableComponents.TableRow>
                  ))}
                </tbody>
              </TableComponents.Table>
            </div>

            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage(current => current - 1)}
                  className="text-sm font-bold text-red-600 disabled:text-gray-400"
                >
                  Anterior
                </button>

                <span className="text-sm text-gray-400">
                  Página {page + 1} de {pageCount}
                </span>

                <button
                  type="button"
                  disabled={page + 1 >= pageCount}
                  onClick={() => setPage(current => current + 1)}
                  className="text-sm font-bold text-red-600 disabled:text-gray-400"
                >
                  Próxima
                </button>
              </div>
            )}

            <NotesPanel
              className="mt-6"
              variant="info"
              title="Como ler este ranking"
              notes={data.notes}
            />

            <NotesPanel
              className="mt-4"
              title="Ressalvas deste cálculo"
              notes={data.caveats}
            />
          </>
        )}
      </ListFeedback>
    </>
  );
}
