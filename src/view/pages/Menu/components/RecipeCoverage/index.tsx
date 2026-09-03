import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { recipesService } from "../../../../../app/services/recipesService";
import { recipesQueryKey } from "../../../../../app/hooks/useRecipeQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatQuantity } from "../../../../../app/utils/formatQuantity";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { TableComponents } from "../../../../components/TableElements";

export function RecipeCoverage() {
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...recipesQueryKey, 'missing'],
    queryFn: recipesService.getMissing,
  });

  const items = data?.items ?? [];
  const coverage = data?.summary.coveragePercent ?? null;

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-600 bg-white p-4">
          <span className="block text-xs text-gray-400">Cobertura de fichas</span>

          <strong className={cn(
            'text-2xl font-bold',
            coverage === null || coverage >= 100 ? 'text-green-800' : 'text-yellow-800',
          )}>
            {coverage === null ? '—' : `${formatQuantity(coverage, 2)}%`}
          </strong>
        </div>

        <div className="rounded-lg border border-gray-600 bg-white p-4">
          <span className="block text-xs text-gray-400">Pratos sem ficha</span>

          <strong className="text-2xl font-bold text-red-800">
            {data?.summary.withoutRecipe ?? 0}
          </strong>
        </div>

        <div className="rounded-lg border border-gray-600 bg-white p-4">
          <span className="block text-xs text-gray-400">Pratos vendáveis</span>

          <strong className="text-2xl font-bold text-gray-500">
            {data?.summary.totalProducts ?? 0}
          </strong>
        </div>
      </div>

      {items.length > 0 && (
        <p className="mb-6 flex items-start gap-2 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-900">
          <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

          <span>
            Estes pratos vendem sem baixar insumo nenhum: o saldo na tela
            continua batendo enquanto o produto some da prateleira. Enquanto a
            cobertura não chega a 100%, o custo e a margem de todo relatório
            saem subestimados.
          </span>
        </p>
      )}

      <ContentHeader title="Pratos sem ficha ativa" quantity={items.length} />

      <ListFeedback
        isLoading={isFetching}
        isError={isError}
        isEmpty={items.length === 0}
        emptyMessage="Todos os pratos vendáveis têm ficha ativa. O estoque baixa em toda venda."
        errorMessage="Não foi possível carregar a cobertura de fichas."
        onRetry={refetch}
      >
        <div className="space-y-3 md:hidden">
          {items.map(product => (
            <div key={product.id} className="rounded-lg border border-gray-600 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-gray-500">{product.name}</strong>

                  <span className="text-xs text-gray-400">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              </div>

              <Link
                to={`/menu/recipes/new?productId=${product.id}`}
                className="mt-3 inline-block rounded-full bg-red-800 px-4 py-2 text-xs font-bold text-white"
              >
                Criar ficha
              </Link>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <TableComponents.Table>
            <thead>
              <tr className="bg-gray-600/20">
                <TableComponents.TableHeader>Prato</TableComponents.TableHeader>
                <TableComponents.TableHeader>Preço de venda</TableComponents.TableHeader>
                <TableComponents.TableHeader>Ações</TableComponents.TableHeader>
              </tr>
            </thead>

            <tbody>
              {items.map(product => (
                <TableComponents.TableRow key={product.id}>
                  <TableComponents.TableCell>{product.name}</TableComponents.TableCell>

                  <TableComponents.TableCell className="whitespace-nowrap">
                    {formatCurrency(product.price)}
                  </TableComponents.TableCell>

                  <TableComponents.TableCell>
                    <Link
                      to={`/menu/recipes/new?productId=${product.id}`}
                      className="rounded-full bg-red-800 px-3 py-1 text-xs font-bold text-white"
                    >
                      Criar ficha
                    </Link>
                  </TableComponents.TableCell>
                </TableComponents.TableRow>
              ))}
            </tbody>
          </TableComponents.Table>
        </div>
      </ListFeedback>
    </>
  );
}
