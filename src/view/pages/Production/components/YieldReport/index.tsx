import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import { productionService } from "../../../../../app/services/productionService";
import {
  productionQueryKey,
  useProducibleRecipes,
} from "../../../../../app/hooks/useProductionQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { formatDateTime } from "../../../../../app/utils/formatDateTime";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { PeriodFilter } from "../../../../components/PeriodFilter";
import { Select } from "../../../../components/Select";
import { TableComponents } from "../../../../components/TableElements";

export function YieldReport() {
  const [recipeId, setRecipeId] = useState('');
  const [outputSupplyId, setOutputSupplyId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { recipes } = useProducibleRecipes();

  const filters = {
    ...(recipeId ? { recipeId } : {}),
    ...(outputSupplyId ? { outputSupplyId } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...productionQueryKey, 'yield-report', filters],
    queryFn: () => productionService.getYieldReport(filters),
  });

  const summary = data?.summary;
  const items = data?.items ?? [];

  const outputSupplies = [...new Map(
    items.map(item => [item.outputSupplyId, item.outputSupplyName]),
  ).entries()];

  /**
   * Todo lote abaixo do previsto não é a cozinha errando sempre — é a ficha
   * prometendo um rendimento que a receita não entrega.
   */
  const allBelowExpected =
    Boolean(summary) && summary!.batches > 1
    && summary!.batchesBelowExpected === summary!.batches;

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          {outputSupplies.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
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
          hint="Pela data de produção. Em branco, todos os lotes confirmados."
        />
      </div>

      <ListFeedback
        isLoading={isFetching && !data}
        isError={isError}
        isEmpty={items.length === 0}
        emptyMessage="Nenhum lote confirmado no período. O relatório só compara lotes que já foram confirmados."
        errorMessage="Não foi possível carregar o relatório de rendimento."
        onRetry={refetch}
      >
        {summary && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Lotes confirmados</span>

                <strong className="text-xl font-bold text-gray-500">
                  {summary.batches}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Renderam abaixo</span>

                <strong className={cn(
                  'text-xl font-bold',
                  summary.batchesBelowExpected > 0 ? 'text-yellow-800' : 'text-green-800',
                )}>
                  {summary.batchesBelowExpected}
                </strong>
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Rendimento médio</span>

                <strong className="text-xl font-bold text-gray-500">
                  {summary.singleSupply ? formatPercentPlain(summary.yieldPercent) : '—'}
                </strong>

                {!summary.singleSupply && (
                  <span className="mt-1 block text-xs text-gray-400">
                    filtre um subproduto
                  </span>
                )}
              </div>

              <div className="rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">Valor perdido</span>

                <strong className={cn(
                  'text-xl font-bold',
                  summary.lostValue > 0 ? 'text-red-900' : 'text-green-800',
                )}>
                  {formatCurrency(summary.lostValue)}
                </strong>

                <span className="mt-1 block text-xs text-gray-400">
                  ingredientes que não viraram produto
                </span>
              </div>
            </div>

            {/*
              Somar quantidades de subprodutos diferentes é somar grandezas
              distintas — 200 g de molho com 2 L de caldo não dão 202 de nada.
            */}
            {!summary.singleSupply && (
              <p className="mb-4 flex items-start gap-2 rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
                <InfoCircledIcon className="mt-0.5 shrink-0" />

                <span>
                  Há lotes de subprodutos diferentes neste recorte, e as
                  quantidades deles são de grandezas distintas. Por isso o
                  rendimento médio agregado fica em branco — filtre um subproduto
                  para tê-lo. O valor perdido continua válido: dinheiro soma com
                  dinheiro.
                </span>
              </p>
            )}

            {allBelowExpected && (
              <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-2 text-yellow-900">
                  <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                  <div>
                    <strong className="block text-sm">
                      Todos os {summary.batches} lotes renderam abaixo do previsto
                    </strong>

                    <p className="mt-1 text-xs">
                      Quando <strong>todo</strong> lote sai abaixo, o problema
                      costuma ser a ficha, não a cozinha: o rendimento cadastrado
                      promete mais do que a receita entrega. Corrigi-lo na ficha
                      acerta o custo previsto de uma vez, em vez de tratar cada
                      lote como perda.{' '}
                      <Link to="/menu/sub-recipes" className="font-bold underline">
                        Rever as sub-receitas
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}

            <ContentHeader title="Lote a lote" quantity={items.length} />

            <div className="space-y-3 md:hidden">
              {items.map(item => (
                <Link
                  key={item.productionOrderId}
                  to={`/production/${item.productionOrderId}`}
                  className={cn(
                    'block rounded-lg border bg-white p-4',
                    item.yieldDifference < 0 ? 'border-yellow-200' : 'border-gray-600',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <strong className="block truncate text-gray-500">
                        {item.recipeName ?? 'Sub-receita'}
                      </strong>

                      <span className="text-xs text-gray-400">
                        → {item.outputSupplyName} ·{' '}
                        {formatDateTime(new Date(item.producedAt))}
                      </span>
                    </div>

                    <strong className={cn(
                      'whitespace-nowrap',
                      item.yieldDifference < 0 ? 'text-yellow-800' : 'text-green-800',
                    )}>
                      {formatPercentPlain(item.yieldPercent)}
                    </strong>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="block text-xs text-gray-400">Previsto</span>
                      <span className="text-gray-500">
                        {formatQuantity(item.expectedQuantity)} {item.baseUnit}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Real</span>
                      <span className="text-gray-500">
                        {formatQuantity(item.actualQuantity)} {item.baseUnit}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">Diferença</span>
                      <span className={cn(
                        item.yieldDifference < 0 ? 'text-yellow-800' : 'text-gray-500',
                      )}>
                        {item.yieldDifference > 0 ? '+' : ''}
                        {formatQuantity(item.yieldDifference)} {item.baseUnit}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs text-gray-400">
                        Custo por {item.baseUnit}
                      </span>

                      <span className="text-gray-500">
                        {formatCurrency(item.unitCost)}
                      </span>
                    </div>
                  </div>
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
                    <TableComponents.TableHeader>Rendeu</TableComponents.TableHeader>
                    <TableComponents.TableHeader>Custo unitário</TableComponents.TableHeader>
                    <TableComponents.TableHeader> </TableComponents.TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {items.map(item => (
                    <TableComponents.TableRow
                      key={item.productionOrderId}
                      className={cn(
                        'border-b border-gray-600/40 bg-white',
                        item.yieldDifference < 0 && 'bg-yellow-50',
                      )}
                    >
                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatDateTime(new Date(item.producedAt))}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>
                        {item.recipeName ?? 'Sub-receita'}

                        <span className="ml-2 text-xs text-gray-400">
                          v{item.recipeVersion}
                        </span>
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>
                        {item.outputSupplyName}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(item.batches)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(item.expectedQuantity)} {item.baseUnit}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatQuantity(item.actualQuantity)} {item.baseUnit}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell
                        className={cn(
                          'whitespace-nowrap font-medium',
                          item.yieldDifference < 0 && 'text-yellow-800',
                        )}
                      >
                        {formatPercentPlain(item.yieldPercent)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell className="whitespace-nowrap">
                        {formatCurrency(item.unitCost)}
                      </TableComponents.TableCell>

                      <TableComponents.TableCell>
                        <Link
                          to={`/production/${item.productionOrderId}`}
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

            <p className="mt-4 text-xs text-gray-400">
              O custo unitário de cada lote é o custo dos ingredientes dividido
              pelo rendimento <strong>real</strong>. Ele é o custo do subproduto
              nas fichas que o usam, então um lote que rendeu menos encarece
              todos os pratos feitos com ele daí em diante.
            </p>
          </>
        )}
      </ListFeedback>
    </>
  );
}
