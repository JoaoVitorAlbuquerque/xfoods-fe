import { Link } from "react-router-dom";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { formatDateTime } from "../../../../../app/utils/formatDateTime";
import {
  ProductionStatus,
  productionStatusLabels,
  productionStatuses,
} from "../../../../../types/Production";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { PeriodFilter } from "../../../../components/PeriodFilter";
import { ProductionStatusBadge } from "../../../../components/ProductionStatusBadge";
import { Select } from "../../../../components/Select";
import { TableComponents } from "../../../../components/TableElements";
import { useProductionOrdersListController } from "./useProductionOrdersListController";

export function ProductionOrdersList() {
  const {
    orders,
    isFetching,
    isError,
    refetch,
    recipes,
    compositionOnly,
    outputSupplies,
    status,
    setStatus,
    recipeId,
    setRecipeId,
    outputSupplyId,
    setOutputSupplyId,
    from,
    setFrom,
    to,
    setTo,
  } = useProductionOrdersListController();

  return (
    <>
      <ContentHeader title="Lotes de produção" quantity={orders.length}>
        <Link to="/production/new" className="pt-1 text-sm font-bold text-red-600">
          Nova Ordem
        </Link>
      </ContentHeader>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          value={status}
          onChange={event => setStatus(event.target.value as ProductionStatus | '')}
        >
          <option value="">Todas as situações</option>

          {productionStatuses.map(option => (
            <option key={option} value={option}>
              {productionStatusLabels[option]}
            </option>
          ))}
        </Select>

        <Select value={recipeId} onChange={event => setRecipeId(event.target.value)}>
          <option value="">Todas as sub-receitas</option>

          {recipes.map(recipe => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.name ?? `Ficha v${recipe.version}`}
            </option>
          ))}
        </Select>

        <Select
          value={outputSupplyId}
          onChange={event => setOutputSupplyId(event.target.value)}
        >
          <option value="">Todos os subprodutos</option>

          {outputSupplies.map(supply => (
            <option key={supply.id} value={supply.id}>
              {supply.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-6">
        <PeriodFilter
          from={from}
          to={to}
          onChangeFrom={setFrom}
          onChangeTo={setTo}
          hint="Pela data de produção do lote. Em branco, todos."
        />
      </div>

      <ListFeedback
        isLoading={isFetching && orders.length === 0}
        isError={isError}
        isEmpty={orders.length === 0}
        emptyMessage={
          recipes.length === 0
            ? 'Nenhuma sub-receita tem insumo de saída, então não há o que produzir.'
            : 'Nenhum lote de produção para estes filtros.'
        }
        errorMessage="Não foi possível carregar os lotes de produção."
        onRetry={refetch}
      >
        <div className="space-y-3 md:hidden">
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/production/${order.id}`}
              className="block rounded-lg border border-gray-600 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-gray-500">
                    {order.recipe.name ?? 'Sub-receita'}
                  </strong>

                  <span className="text-xs text-gray-400">
                    → {order.outputSupply.name} · v{order.recipe.version}
                  </span>
                </div>

                <ProductionStatusBadge status={order.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="block text-xs text-gray-400">Produzido em</span>
                  <span className="text-gray-500">
                    {formatDateTime(new Date(order.producedAt))}
                  </span>
                </div>

                <div>
                  <span className="block text-xs text-gray-400">Lotes</span>
                  <span className="text-gray-500">{formatQuantity(order.batches)}</span>
                </div>

                <div>
                  <span className="block text-xs text-gray-400">Rendimento</span>
                  <span className="text-gray-500">
                    {formatQuantity(order.actualQuantity)}{' '}
                    {order.outputSupply.baseUnit.code}
                  </span>
                </div>

                <div>
                  <span className="block text-xs text-gray-400">
                    {order.status === 'CONFIRMED' ? 'Custo por unidade' : 'Custo previsto'}
                  </span>

                  <span className="text-gray-500">
                    {formatCurrency(order.unitCost)}
                  </span>
                </div>
              </div>

              {order.status === 'CONFIRMED' && order.yieldDifference !== 0 && (
                <div className="mt-3 flex items-center justify-between border-t border-gray-600/40 pt-2">
                  <span className="text-xs text-gray-400">Rendeu</span>

                  <strong className={cn(
                    'text-sm',
                    order.yieldDifference < 0 ? 'text-red-900' : 'text-green-800',
                  )}>
                    {formatPercentPlain(order.yieldPercent)}
                  </strong>
                </div>
              )}
            </Link>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <TableComponents.Table>
            <thead>
              <tr className="bg-gray-600/20">
                <TableComponents.TableHeader>Produzido em</TableComponents.TableHeader>
                <TableComponents.TableHeader>Sub-receita</TableComponents.TableHeader>
                <TableComponents.TableHeader>Subproduto</TableComponents.TableHeader>
                <TableComponents.TableHeader>Lotes</TableComponents.TableHeader>
                <TableComponents.TableHeader>Previsto</TableComponents.TableHeader>
                <TableComponents.TableHeader>Real</TableComponents.TableHeader>
                <TableComponents.TableHeader>Custo por unidade</TableComponents.TableHeader>
                <TableComponents.TableHeader>Situação</TableComponents.TableHeader>
                <TableComponents.TableHeader> </TableComponents.TableHeader>
              </tr>
            </thead>

            <tbody>
              {orders.map(order => (
                <TableComponents.TableRow key={order.id}>
                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatDateTime(new Date(order.producedAt))}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {order.recipe.name ?? 'Sub-receita'}

                    <span className="ml-2 text-xs text-gray-400">
                      v{order.recipe.version}
                    </span>
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    {order.outputSupply.name}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatQuantity(order.batches)}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatQuantity(order.expectedQuantity)}{' '}
                    {order.outputSupply.baseUnit.code}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatQuantity(order.actualQuantity)}{' '}
                    {order.outputSupply.baseUnit.code}

                    {order.status === 'CONFIRMED' && order.yieldDifference !== 0 && (
                      <span className={cn(
                        'ml-2 text-xs',
                        order.yieldDifference < 0 ? 'text-red-900' : 'text-green-800',
                      )}>
                        {formatPercentPlain(order.yieldPercent)}
                      </span>
                    )}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatCurrency(order.unitCost)}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    <ProductionStatusBadge status={order.status} />
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    <Link
                      to={`/production/${order.id}`}
                      className="whitespace-nowrap text-sm font-bold text-red-600"
                    >
                      Ver lote
                    </Link>
                  </TableComponents.TableCell>
                </TableComponents.TableRow>
              ))}
            </tbody>
          </TableComponents.Table>
        </div>
      </ListFeedback>

      {/*
        Sub-receita sem insumo de saída não é um cadastro incompleto: é o outro
        modo, e ela não deve aparecer no seletor de produção.
      */}
      {compositionOnly.length > 0 && (
        <p className="mt-6 flex items-start gap-2 text-xs text-gray-400">
          <InfoCircledIcon className="mt-0.5 shrink-0" />

          <span>
            {compositionOnly.length} sub-receita(s) não aparecem aqui porque não
            têm insumo de saída — elas são composição de custo e se desdobram nos
            ingredientes a cada venda, sem saldo próprio para repor. Para
            produzi-las, informe um insumo de saída na{' '}
            <Link to="/menu/sub-recipes" className="font-bold underline">
              ficha da sub-receita
            </Link>
            .
          </span>
        </p>
      )}
    </>
  );
}
