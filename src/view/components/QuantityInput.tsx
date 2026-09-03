import { InfoCircledIcon } from '@radix-ui/react-icons';
import { NumericFormat } from 'react-number-format';

import { cn } from '../../app/utils/cn';
import { UnitKind } from '../../types/MeasurementUnit';
import { UnitSelect } from './UnitSelect';

interface QuantityInputProps {
  /**
   * Quantidade como string numérica (`"12.54"`, ponto decimal) — é o formato
   * que a API recebe sem passar por float.
   */
  quantity?: string;
  onQuantityChange?(quantity: string): void;
  /** Id da unidade escolhida. */
  unitId?: string;
  onUnitChange?(unitId: string): void;
  kind?: UnitKind;
  allowPackaging?: boolean;
  placeholder?: string;
  unitPlaceholder?: string;
  error?: string;
  disabled?: boolean;
  name?: string;
  decimalScale?: number;
  className?: string;
}

export function QuantityInput({
  quantity,
  onQuantityChange,
  unitId,
  onUnitChange,
  kind,
  allowPackaging = true,
  placeholder = '0',
  unitPlaceholder = 'Un.',
  error,
  disabled,
  name,
  decimalScale = 4,
  className,
}: QuantityInputProps) {
  return (
    <div>
      <div
        className={cn(
          'flex items-stretch bg-white w-full rounded-lg border border-gray-600 focus-within:border-gray-800 transition-all overflow-hidden',
          error && '!border-red-900',
          disabled && 'bg-gray-200 cursor-not-allowed',
          className,
        )}
      >
        <NumericFormat
          name={name}
          value={quantity ?? ''}
          onValueChange={(values, sourceInfo) => {
            // Só o que o usuário digitou sobe: a reformatação do próprio
            // componente dispararia um ciclo de atualização à toa.
            if (sourceInfo.source === 'event') {
              onQuantityChange?.(values.value);
            }
          }}
          valueIsNumericString
          thousandSeparator="."
          decimalSeparator=","
          allowNegative={false}
          decimalScale={decimalScale}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 min-w-0 bg-transparent px-3 h-[52px] text-gray-800 outline-none',
            disabled && 'cursor-not-allowed',
          )}
        />

        <div className="w-px bg-gray-600" />

        <UnitSelect
          compact
          value={unitId}
          onChange={onUnitChange}
          kind={kind}
          allowPackaging={allowPackaging}
          placeholder={unitPlaceholder}
          disabled={disabled}
          className="min-w-[104px] flex items-center bg-transparent"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-900">
          <InfoCircledIcon />

          <span className="text-xs whitespace-pre-line">{error}</span>
        </div>
      )}
    </div>
  );
}
