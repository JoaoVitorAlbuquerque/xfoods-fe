import { useMemo } from 'react';
import * as RdxSelect from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon, CrossCircledIcon } from '@radix-ui/react-icons';

import { cn } from '../../app/utils/cn';
import { useMeasurementUnits } from '../../app/hooks/useMeasurementUnits';
import { UnitKind, unitKindLabels, unitKinds } from '../../types/MeasurementUnit';

export const PACKAGING_DISABLED_HINT =
  'Unidade de embalagem: não tem fator de conversão universal, porque uma caixa '
  + 'de tomate não pesa o mesmo que uma de azeite. O fator é definido por insumo, '
  + 'na compra — por isso ela não pode ser unidade base.';

interface UnitSelectProps {
  /** Id da unidade selecionada. */
  value?: string;
  onChange?(unitId: string): void;
  /** Filtra por grandeza — o formulário de ficha só oferece o que é compatível. */
  kind?: UnitKind;
  /** Embalagem (CX, PCT, FARDO) não pode ser unidade base de insumo. */
  allowPackaging?: boolean;
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  /** Só a sigla no gatilho, sem rótulo flutuante — para uso dentro de outro campo. */
  compact?: boolean;
}

export function UnitSelect({
  value,
  onChange,
  kind,
  allowPackaging = true,
  placeholder = 'Unidade',
  error,
  className,
  disabled,
  compact,
}: UnitSelectProps) {
  const { units, isLoading } = useMeasurementUnits();

  const groups = useMemo(() => {
    const visible = kind ? units.filter(unit => unit.kind === kind) : units;

    return unitKinds
      .map(unitKind => ({
        kind: unitKind,
        units: visible.filter(unit => unit.kind === unitKind),
      }))
      .filter(group => group.units.length > 0);
  }, [units, kind]);

  const selectedUnit = units.find(unit => unit.id === value);

  return (
    <div className={compact ? 'flex items-stretch' : 'w-full'}>
      <div className={cn('relative', compact && 'flex flex-1 items-stretch')}>
        {!compact && (
          <label
            className={cn(
              'absolute z-10 top-1/2 -translate-y-1/2 left-3 pointer-events-none text-gray-700',
              selectedUnit && 'text-xs left-[13px] top-2 transition-all translate-y-0',
            )}
          >
            {placeholder}
          </label>
        )}

        <RdxSelect.Root value={value ?? ''} onValueChange={onChange} disabled={disabled || isLoading}>
          <RdxSelect.Trigger
            className={cn(
              'bg-white w-full rounded-lg border border-gray-600 px-3 h-[52px] text-gray-800 focus:border-gray-800 transition-all outline-none text-left relative',
              !compact && 'pt-4',
              compact && 'border-0 rounded-none h-auto pr-8 flex items-center',
              error && '!border-red-900',
              (disabled || isLoading) && 'cursor-not-allowed text-gray-400',
              className,
            )}
          >
            <RdxSelect.Value placeholder={compact ? placeholder : undefined}>
              {selectedUnit && (compact
                ? selectedUnit.code
                : `${selectedUnit.code} — ${selectedUnit.name}`)}
            </RdxSelect.Value>

            <RdxSelect.Icon className="absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronDownIcon className="w-5 h-5 text-gray-800" />
            </RdxSelect.Icon>
          </RdxSelect.Trigger>

          <RdxSelect.Portal>
            <RdxSelect.Content className="z-[99] overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-[0px_11px_20px_0px_rgba(0,0,0,0.10)]">
              <RdxSelect.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-gray-800 cursor-default">
                <ChevronUpIcon />
              </RdxSelect.ScrollUpButton>

              <RdxSelect.Viewport className="p-2 max-h-[320px]">
                {groups.length === 0 && (
                  <div className="p-2 text-sm text-gray-400">
                    Nenhuma unidade disponível.
                  </div>
                )}

                {groups.map(group => (
                  <RdxSelect.Group key={group.kind}>
                    <RdxSelect.Label className="px-2 pt-2 pb-1 text-xs font-bold uppercase text-gray-400">
                      {unitKindLabels[group.kind]}
                    </RdxSelect.Label>

                    {group.units.map(unit => {
                      const isBlocked = !allowPackaging && unit.isPackaging;

                      return (
                        <RdxSelect.Item
                          key={unit.id}
                          value={unit.id}
                          disabled={isBlocked}
                          title={isBlocked ? PACKAGING_DISABLED_HINT : undefined}
                          className={cn(
                            'p-2 text-gray-800 text-sm data-[state=checked]:font-bold outline-none data-[highlighted]:bg-gray-50 rounded-lg transition-colors',
                            isBlocked && 'text-gray-300 cursor-not-allowed data-[highlighted]:bg-transparent',
                          )}
                        >
                          <RdxSelect.ItemText>
                            {unit.code} — {unit.name}
                          </RdxSelect.ItemText>

                          {isBlocked && (
                            <span className="ml-2 text-xs">(embalagem, sem fator)</span>
                          )}
                        </RdxSelect.Item>
                      );
                    })}
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

      {error && !compact && (
        <div className="flex gap-2 items-center mt-2 text-red-900">
          <CrossCircledIcon />

          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  );
}
