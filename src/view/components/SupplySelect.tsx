import { useMemo } from 'react';
import * as RdxSelect from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon, CrossCircledIcon } from '@radix-ui/react-icons';

import { cn } from '../../app/utils/cn';
import { formatQuantity } from '../../app/utils/formatQuantity';
import { useSupplies } from '../../app/hooks/useStockQueries';

interface SupplySelectProps {
  value?: string;
  onChange?(supplyId: string): void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const NO_CATEGORY = 'Sem categoria';

export function SupplySelect({
  value,
  onChange,
  placeholder = 'Insumo',
  error,
  disabled,
  className,
}: SupplySelectProps) {
  const { supplies, isFetching } = useSupplies({ active: 'true' });

  const groups = useMemo(() => {
    const byCategory = new Map<string, typeof supplies>();

    supplies.forEach(supply => {
      const key = supply.category?.name ?? NO_CATEGORY;
      byCategory.set(key, [...(byCategory.get(key) ?? []), supply]);
    });

    return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [supplies]);

  const selectedSupply = supplies.find(supply => supply.id === value);

  return (
    <div className="w-full">
      <div className="relative">
        <label
          className={cn(
            'absolute z-10 top-1/2 -translate-y-1/2 left-3 pointer-events-none text-gray-700',
            selectedSupply && 'text-xs left-[13px] top-2 transition-all translate-y-0',
          )}
        >
          {placeholder}
        </label>

        <RdxSelect.Root value={value ?? ''} onValueChange={onChange} disabled={disabled || isFetching}>
          <RdxSelect.Trigger
            className={cn(
              'bg-white w-full rounded-lg border border-gray-600 px-3 h-[52px] pt-4 pr-9 text-gray-800 focus:border-gray-800 transition-all outline-none text-left relative truncate',
              error && '!border-red-900',
              (disabled || isFetching) && 'cursor-not-allowed text-gray-400',
              className,
            )}
          >
            <RdxSelect.Value>
              {selectedSupply && selectedSupply.name}
            </RdxSelect.Value>

            <RdxSelect.Icon className="absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronDownIcon className="w-5 h-5 text-gray-800" />
            </RdxSelect.Icon>
          </RdxSelect.Trigger>

          <RdxSelect.Portal>
            <RdxSelect.Content className="z-[99] max-w-[calc(100vw-2rem)] overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-[0px_11px_20px_0px_rgba(0,0,0,0.10)]">
              <RdxSelect.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-gray-800 cursor-default">
                <ChevronUpIcon />
              </RdxSelect.ScrollUpButton>

              <RdxSelect.Viewport className="p-2 max-h-[320px]">
                {groups.length === 0 && (
                  <div className="p-2 text-sm text-gray-400">
                    Nenhum insumo ativo cadastrado.
                  </div>
                )}

                {groups.map(([categoryName, categorySupplies]) => (
                  <RdxSelect.Group key={categoryName}>
                    <RdxSelect.Label className="px-2 pt-2 pb-1 text-xs font-bold uppercase text-gray-400">
                      {categoryName}
                    </RdxSelect.Label>

                    {categorySupplies.map(supply => (
                      <RdxSelect.Item
                        key={supply.id}
                        value={supply.id}
                        className="p-2 text-gray-800 text-sm data-[state=checked]:font-bold outline-none data-[highlighted]:bg-gray-50 rounded-lg transition-colors"
                      >
                        <RdxSelect.ItemText>{supply.name}</RdxSelect.ItemText>

                        <span className="ml-2 text-xs text-gray-400">
                          {formatQuantity(supply.currentStock)} {supply.baseUnit.code}
                        </span>
                      </RdxSelect.Item>
                    ))}
                  </RdxSelect.Group>
                ))}
              </RdxSelect.Viewport>

              <RdxSelect.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-gray-800 cursor-default">
                <ChevronDownIcon />
              </RdxSelect.ScrollDownButton>
            </RdxSelect.Content>
          </RdxSelect.Portal>
        </RdxSelect.Root>
      </div>

      {error && (
        <div className="flex gap-2 items-center mt-2 text-red-900">
          <CrossCircledIcon />

          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  );
}
