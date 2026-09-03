import { useQuery } from "@tanstack/react-query";

import { categoriesService } from "../../app/services/categoriesService";
import { productsService } from "../../app/services/productsService";
import { suppliesService } from "../../app/services/suppliesService";
import { supplyCategoriesService } from "../../app/services/supplyCategoriesService";
import {
  suppliesQueryKey,
  supplyCategoriesQueryKey,
} from "../../app/hooks/useStockQueries";
import { PeriodFilter } from "./PeriodFilter";
import { Select } from "./Select";

/** Os recortes que os relatórios gerenciais têm em comum. */
export interface ReportFilterValues {
  from?: string;
  to?: string;
  productId?: string;
  categoryId?: string;
  supplyId?: string;
  supplyCategoryId?: string;
}

export type ReportFilterField =
  | 'product'
  | 'category'
  | 'supply'
  | 'supplyCategory';

interface ReportFilterBarProps<T extends ReportFilterValues> {
  filters: T;
  onChange(next: T): void;
  /** Cada relatório mostra só os recortes que fazem diferença na conta dele. */
  show?: ReportFilterField[];
  periodHint?: string;
  /** Controles próprios do relatório, como tipos de movimentação. */
  children?: React.ReactNode;
}

/**
 * Período e recortes de produto e insumo, compartilhados por Indicadores e
 * Consumo. As chaves das consultas são as mesmas das telas de estoque e
 * cardápio, então a lista costuma vir do cache.
 */
export function ReportFilterBar<T extends ReportFilterValues>({
  filters,
  onChange,
  show = [],
  periodHint,
  children,
}: ReportFilterBarProps<T>) {
  const wantsMenu = show.includes('product') || show.includes('category');
  const wantsSupply = show.includes('supply') || show.includes('supplyCategory');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
    staleTime: 1000 * 60 * 5,
    enabled: show.includes('category'),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['product-options'],
    queryFn: productsService.getAllOptions,
    staleTime: 1000 * 60 * 5,
    enabled: show.includes('product'),
  });

  const { data: supplies = [] } = useQuery({
    queryKey: [...suppliesQueryKey, {}],
    queryFn: () => suppliesService.getAll({}),
    staleTime: 1000 * 60 * 5,
    enabled: show.includes('supply'),
  });

  const { data: supplyCategories = [] } = useQuery({
    queryKey: supplyCategoriesQueryKey,
    queryFn: supplyCategoriesService.getAll,
    staleTime: 1000 * 60 * 5,
    enabled: show.includes('supplyCategory'),
  });

  function handleChange(key: keyof ReportFilterValues, value: string) {
    const next = { ...filters };

    if (value === '') {
      delete next[key];
    } else {
      Object.assign(next, { [key]: value });
    }

    onChange(next);
  }

  return (
    <div className="mb-6 space-y-4">
      <PeriodFilter
        from={filters.from ?? ''}
        to={filters.to ?? ''}
        onChangeFrom={value => handleChange('from', value)}
        onChangeTo={value => handleChange('to', value)}
        hint={periodHint ?? 'Em branco, o período é o mês corrente.'}
      />

      {(wantsMenu || wantsSupply) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {show.includes('category') && (
            <Select
              value={filters.categoryId ?? ''}
              onChange={event => handleChange('categoryId', event.target.value)}
            >
              <option value="">Todas as categorias do cardápio</option>

              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          )}

          {show.includes('product') && (
            <Select
              value={filters.productId ?? ''}
              onChange={event => handleChange('productId', event.target.value)}
            >
              <option value="">Todos os pratos</option>

              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
          )}

          {show.includes('supplyCategory') && (
            <Select
              value={filters.supplyCategoryId ?? ''}
              onChange={event => handleChange('supplyCategoryId', event.target.value)}
            >
              <option value="">Todas as categorias de insumo</option>

              {supplyCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          )}

          {show.includes('supply') && (
            <Select
              value={filters.supplyId ?? ''}
              onChange={event => handleChange('supplyId', event.target.value)}
            >
              <option value="">Todos os insumos</option>

              {supplies.map(supply => (
                <option key={supply.id} value={supply.id}>
                  {supply.name}
                </option>
              ))}
            </Select>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
