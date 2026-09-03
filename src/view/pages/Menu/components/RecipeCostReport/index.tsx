import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import { recipesService } from "../../../../../app/services/recipesService";
import { recipesQueryKey } from "../../../../../app/hooks/useRecipeQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { TableComponents } from "../../../../components/TableElements";

/** Participação do custo direto no preço de venda. Não é margem. */
function costShare(directCost: number, sellingPrice: number | null) {
  if (sellingPrice === null || sellingPrice <= 0) {
    return null;
  }

  return (directCost / sellingPrice) * 100;
}

export function RecipeCostReport() {
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...recipesQueryKey, 'cost-report'],
    queryFn: recipesService.getCostReport,
  });

  const items = data?.items ?? [];
  const withMissingCost = data?.summary.withMissingCost ?? 0;

  return (
    <>
      <ContentHeader title="Custo direto por prato" quantity={items.length} />

      <p className="mb-4 flex items-start gap-2 text-sm text-gray-400">
        <InfoCircledIcon className="mt-0.5 shrink-0" />

        Custo direto é só o dos insumos da ficha ativa. Custo indireto, impostos
        e taxas entram na formação de preço — a participação abaixo não é margem.
      </p>

      {withMissingCost > 0 && (
        <p className="mb-6 flex items-start gap-2 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-900">
          <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

          <span>
            {withMissingCost} ficha(s) usam insumo nunca comprado, que entra com
            custo zero. <strong>O custo direto delas está subestimado</strong> —
            lance a compra desses insumos para os números fecharem.
          </span>
        </p>
      )}

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={items.length === 0}
        emptyMessage="Nenhum prato tem ficha ativa ainda."
        errorMessage="Não foi possível carregar o custo direto."
        onRetry={refetch}
      >
        <div className="space-y-3 md:hidden">
          {items.map(item => {
            const share = costShare(item.directCost, item.sellingPrice);

            return (
              <Link
                key={item.recipeId}
                to={`/menu/recipes/${item.recipeId}`}
                className="block rounded-lg border border-gray-600 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="block truncate text-gray-500">
                      {item.productName}
                    </strong>

                    <span className="text-xs text-gray-400">Versão {item.version}</span>
                  </div>

                  {item.hasMissingCost && (
                    <span className="whitespace-nowrap rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-900">
                      Custo incompleto
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="block text-xs text-gray-400">Custo direto</span>
                    <strong className="text-gray-500">
                      {formatCurrency(item.directCost)}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-400">Preço de venda</span>
                    <span className="text-gray-500">
                      {item.sellingPrice === null ? '—' : formatCurrency(item.sellingPrice)}
                    </span>
                  </div>
                </div>

                <span className="mt-2 block text-xs text-gray-400">
                  Custo direto sobre o preço:{' '}
                  {share === null ? '—' : `${formatQuantity(share, 1)}%`}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <TableComponents.Table>
            <thead>
              <tr className="bg-gray-600/20">
                <TableComponents.TableHeader>Prato</TableComponents.TableHeader>
                <TableComponents.TableHeader>Versão</TableComponents.TableHeader>
                <TableComponents.TableHeader>Custo direto</TableComponents.TableHeader>
                <TableComponents.TableHeader>Custo por porção</TableComponents.TableHeader>
                <TableComponents.TableHeader>Preço de venda</TableComponents.TableHeader>
                <TableComponents.TableHeader>Custo / preço</TableComponents.TableHeader>
                <TableComponents.TableHeader>Ações</TableComponents.TableHeader>
              </tr>
            </thead>

            <tbody>
              {items.map(item => {
                const share = costShare(item.directCost, item.sellingPrice);

                return (
                  <TableComponents.TableRow key={item.recipeId}>
                    <TableComponents.TableCell>
                      {item.productName}

                      {item.hasMissingCost && (
                        <span
                          className="ml-2 rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-900"
                          title="A ficha usa insumo nunca comprado: o custo está subestimado."
                        >
                          custo incompleto
                        </span>
                      )}
                    </TableComponents.TableCell>

                    <TableComponents.TableCell>{item.version}</TableComponents.TableCell>

                    <TableComponents.TableCell className="whitespace-nowrap font-medium">
                      {formatCurrency(item.directCost)}
                    </TableComponents.TableCell>

                    <TableComponents.TableCell className="whitespace-nowrap">
                      {formatCurrency(item.costPerYieldUnit)}
                    </TableComponents.TableCell>

                    <TableComponents.TableCell className="whitespace-nowrap">
                      {item.sellingPrice === null ? '—' : formatCurrency(item.sellingPrice)}
                    </TableComponents.TableCell>

                    <TableComponents.TableCell
                      className={cn(
                        'whitespace-nowrap',
                        share !== null && share >= 100 && 'font-bold text-red-900',
                      )}
                    >
                      {share === null ? '—' : `${formatQuantity(share, 1)}%`}
                    </TableComponents.TableCell>

                    <TableComponents.TableCell>
                      <Link
                        to={`/menu/recipes/${item.recipeId}`}
                        className="text-sm font-bold text-red-600"
                      >
                        Abrir
                      </Link>
                    </TableComponents.TableCell>
                  </TableComponents.TableRow>
                );
              })}
            </tbody>
          </TableComponents.Table>
        </div>
      </ListFeedback>
    </>
  );
}
