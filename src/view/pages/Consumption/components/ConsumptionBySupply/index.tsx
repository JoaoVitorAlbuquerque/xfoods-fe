import { Link } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";

import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatPercent, formatPercentPlain } from "../../../../../app/utils/formatPercent";
import {
  consumptionClassifications,
  consumptionClassificationLabels,
} from "../../../../../types/Consumption";
import { stockMovementTypeLabels, StockMovementType } from "../../../../../types/StockMovement";
import { ConsumptionClassificationBadge } from "../../../../components/ConsumptionClassificationBadge";
import { ContentHeader } from "../../../../components/ContentHeader";
import { Input } from "../../../../components/Input";
import { ListFeedback } from "../../../../components/ListFeedback";
import { Select } from "../../../../components/Select";
import { TableComponents } from "../../../../components/TableElements";
import { ConsumptionFilterBar } from "../ConsumptionFilterBar";
import { ConsumptionPeriodLine } from "../ConsumptionPeriodLine";
import { DeviationBreakdown } from "../DeviationBreakdown";
import { InterpretationPanel } from "../InterpretationPanel";
import { useConsumptionBySupplyController } from "./useConsumptionBySupplyController";

/** Movimentações do insumo no período, para explicar de onde veio o real. */
function MovementTypeList({
  realByMovementType,
  baseUnit,
}: {
  realByMovementType: Partial<Record<StockMovementType, number>>;
  baseUnit: string;
}) {
  const entries = Object.entries(realByMovementType) as [StockMovementType, number][];

  if (entries.length === 0) {
    return (
      <p className="text-xs text-gray-400">
        Nenhuma movimentação de consumo no período.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {entries.map(([type, quantity]) => (
        <li key={type} className="flex items-center justify-between gap-3 text-xs">
          <span className="text-gray-500">{stockMovementTypeLabels[type]}</span>

          <span className="whitespace-nowrap text-gray-500">
            {formatQuantity(quantity)} {baseUnit}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ConsumptionBySupply() {
  const {
    data,
    items,
    isFetching,
    isError,
    refetch,
    filters,
    setFilters,
    search,
    setSearch,
    classification,
    setClassification,
    expanded,
    handleToggleExpanded,
  } = useConsumptionBySupplyController();

  const summary = data?.summary;

  return (
    <>
      <ConsumptionFilterBar filters={filters} onChange={setFilters} />

      <ListFeedback
        isLoading={isFetching && !data}
        isError={isError}
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar o Estimado × Real por insumo."
        onRetry={refetch}
      >
        {data && summary && (
          <>
            <ConsumptionPeriodLine period={data.period}>
              {' '}· tolerância de{' '}
              <strong className="text-gray-500">
                {formatPercentPlain(summary.tolerancePercent)}
              </strong>
            </ConsumptionPeriodLine>

            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Custo estimado</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(summary.estimatedCost)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Custo real</span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(summary.realCost)}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Custo do desvio</span>

                <strong className={cn(
                  'text-xl font-bold',
                  summary.differenceCost > 0 ? 'text-yellow-800' : 'text-gray-500',
                )}>
                  {formatCurrency(summary.differenceCost)}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  {formatPercent(summary.wastePercent)} do previsto
                </span>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Acima do esperado</span>

                <strong className={cn(
                  'text-xl font-bold',
                  summary.byClassification.ACIMA_DO_ESPERADO > 0
                    ? 'text-red-900'
                    : 'text-green-800',
                )}>
                  {summary.byClassification.ACIMA_DO_ESPERADO}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  de {summary.supplies} insumo(s)
                </span>
              </div>
            </div>

            {summary.productsWithoutRecipe.length > 0 && (
              <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900">
                <strong className="block text-sm">
                  {summary.productsWithoutRecipe.length} prato(s) vendidos sem ficha ativa
                </strong>

                <p className="mt-1 text-xs">
                  O consumo previsto deles é zero, então o que saiu para
                  prepará-los aparece inteiro como desvio:{' '}
                  {summary.productsWithoutRecipe.map(product => product.name).join(', ')}.{' '}
                  <Link to="/menu/recipes-coverage" className="font-bold underline">
                    Ver a cobertura de fichas
                  </Link>
                  .
                </p>
              </div>
            )}

            <ContentHeader title="Insumos" quantity={items.length} />

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                name="search"
                placeholder="Buscar insumo"
                value={search}
                onChange={event => setSearch(event.target.value)}
              />

              <Select
                value={classification}
                onChange={event => setClassification(event.target.value as typeof classification)}
              >
                <option value="">Todas as situações</option>

                {consumptionClassifications.map(option => (
                  <option key={option} value={option}>
                    {consumptionClassificationLabels[option]}
                  </option>
                ))}
              </Select>
            </div>

            {items.length === 0 && (
              <div className="rounded-lg border border-gray-600 bg-white p-8 text-center text-gray-400">
                Nenhum insumo para estes filtros.
              </div>
            )}

            <div className="space-y-3 md:hidden">
              {items.map(item => (
                <div
                  key={item.supplyId}
                  className={cn(
                    'rounded-lg border bg-white p-4',
                    /*
                      Consumo que nenhuma venda previa é o desvio mais grave que
                      existe: sem base não há porcentagem, e a linha precisa
                      saltar aos olhos em vez de sumir num travessão.
                    */
                    item.variationPercent === null && item.difference !== 0
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-600',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/stock/supplies/${item.supplyId}`}
                      className="min-w-0 truncate font-medium text-gray-500 underline"
                    >
                      {item.supplyName}
                    </Link>

                    <ConsumptionClassificationBadge classification={item.classification} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="block text-xs text-gray-400">Estimado</span>
                      <span className="text-gray-500">
                        {formatQuantity(item.estimatedQuantity)} {item.baseUnit}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Real</span>
                      <span className="text-gray-500">
                        {formatQuantity(item.realQuantity)} {item.baseUnit}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Diferença</span>
                      <span className={cn(
                        item.difference > 0 ? 'text-red-900' : 'text-gray-500',
                      )}>
                        {item.difference > 0 ? '+' : ''}
                        {formatQuantity(item.difference)} {item.baseUnit}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Variação</span>

                      <strong className={cn(
                        item.difference > 0 ? 'text-red-900' : 'text-gray-500',
                      )}>
                        {formatPercent(item.variationPercent)}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-600/40 pt-2">
                    <span className="text-xs text-gray-400">Custo do desvio</span>

                    <strong className={cn(
                      'text-sm',
                      item.differenceCost > 0 ? 'text-red-900' : 'text-gray-500',
                    )}>
                      {formatCurrency(item.differenceCost)}
                    </strong>
                  </div>

                  {item.variationPercent === null && item.difference !== 0 && (
                    <p className="mt-3 text-xs text-red-900">
                      Nenhuma venda do período previa este insumo, então não há
                      base para calcular porcentagem — e tudo o que saiu é desvio.
                    </p>
                  )}

                  <DeviationBreakdown
                    className="mt-3"
                    breakdown={item.deviationBreakdown}
                    difference={item.difference}
                    baseUnit={item.baseUnit}
                  />

                  <div className="mt-3 border-t border-gray-600/40 pt-3">
                    <span className="mb-2 block text-xs text-gray-400">
                      Movimentações do período
                    </span>

                    <MovementTypeList
                      realByMovementType={item.realByMovementType}
                      baseUnit={item.baseUnit}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <TableComponents.Table>
                <thead>
                  <tr className="bg-gray-600/20">
                    <TableComponents.TableHeader>Insumo</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Estimado</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Real</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Diferença</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Variação</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo do desvio</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Situação</TableComponents.TableHeader>
                    <TableComponents.TableHeader> </TableComponents.TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {items.map(item => {
                    const isUnforeseen =
                      item.variationPercent === null && item.difference !== 0;
                    const isExpanded = expanded.includes(item.supplyId);

                    return [
                      <TableComponents.TableRow
                        key={item.supplyId}
                        className={cn(
                          'border-b border-gray-600/40 bg-white',
                          isUnforeseen && 'bg-red-50',
                        )}
                      >
                        <TableComponents.TableCell>
                          <Link
                            to={`/stock/supplies/${item.supplyId}`}
                            className="underline"
                          >
                            {item.supplyName}
                          </Link>

                          {item.supplyCategory && (
                            <span className="ml-2 text-xs text-gray-400">
                              {item.supplyCategory}
                            </span>
                          )}
                        </TableComponents.TableCell>

                        <TableComponents.TableCell className="whitespace-nowrap">
                          {formatQuantity(item.estimatedQuantity)} {item.baseUnit}
                        </TableComponents.TableCell>

                        <TableComponents.TableCell className="whitespace-nowrap">
                          {formatQuantity(item.realQuantity)} {item.baseUnit}
                        </TableComponents.TableCell>

                        <TableComponents.TableCell
                          className={cn(
                            'whitespace-nowrap',
                            item.difference > 0 && 'text-red-900',
                          )}
                        >
                          {item.difference > 0 ? '+' : ''}
                          {formatQuantity(item.difference)} {item.baseUnit}
                        </TableComponents.TableCell>

                        <TableComponents.TableCell
                          className={cn(
                            'whitespace-nowrap font-medium',
                            item.difference > 0 && 'text-red-900',
                          )}
                          title={
                            isUnforeseen
                              ? 'Estimado zero: nenhuma venda previa este insumo, então não existe porcentagem.'
                              : undefined
                          }
                        >
                          {formatPercent(item.variationPercent)}
                        </TableComponents.TableCell>

                        <TableComponents.TableCell
                          className={cn(
                            'whitespace-nowrap font-medium',
                            item.differenceCost > 0 && 'text-red-900',
                          )}
                        >
                          {formatCurrency(item.differenceCost)}
                        </TableComponents.TableCell>

                        <TableComponents.TableCell>
                          <ConsumptionClassificationBadge
                            classification={item.classification}
                          />

                          <DeviationBreakdown
                            compact
                            className="ml-2"
                            breakdown={item.deviationBreakdown}
                            difference={item.difference}
                            baseUnit={item.baseUnit}
                          />
                        </TableComponents.TableCell>

                        <TableComponents.TableCell>
                          <button
                            type="button"
                            onClick={() => handleToggleExpanded(item.supplyId)}
                            className="flex items-center gap-1 whitespace-nowrap text-sm font-bold text-red-600"
                          >
                            {isExpanded ? 'Fechar' : 'Detalhar'}

                            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                          </button>
                        </TableComponents.TableCell>
                      </TableComponents.TableRow>,

                      isExpanded && (
                        <TableComponents.TableRow key={`${item.supplyId}-detail`}>
                          <TableComponents.TableCell colSpan={8}>
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                              <div>
                                <span className="mb-2 block text-xs text-gray-400">
                                  Movimentações do período
                                </span>

                                <MovementTypeList
                                  realByMovementType={item.realByMovementType}
                                  baseUnit={item.baseUnit}
                                />

                                <p className="mt-3 text-xs text-gray-400">
                                  Custo unitário de {formatCurrency(item.unitCost)}{' '}
                                  por {item.baseUnit} · estimado{' '}
                                  {formatCurrency(item.estimatedCost)} · real{' '}
                                  {formatCurrency(item.realCost)}
                                </p>
                              </div>

                              <DeviationBreakdown
                                breakdown={item.deviationBreakdown}
                                difference={item.difference}
                                baseUnit={item.baseUnit}
                              />
                            </div>

                            {isUnforeseen && (
                              <p className="mt-4 text-xs text-red-900">
                                Nenhuma venda do período previa este insumo. Não
                                há base para porcentagem, e tudo o que saiu é
                                desvio — normalmente produção, consumo interno ou
                                prato vendido sem ficha.
                              </p>
                            )}
                          </TableComponents.TableCell>
                        </TableComponents.TableRow>
                      ),
                    ];
                  })}
                </tbody>
              </TableComponents.Table>
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
