import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import {
  ConsumptionParams,
  consumptionMovementTypes,
} from "../../../../../app/services/consumptionService";
import { cn } from "../../../../../app/utils/cn";
import { PeriodGrouping, periodGroupingLabels, periodGroupings } from "../../../../../types/Consumption";
import { stockMovementTypeLabels } from "../../../../../types/StockMovement";
import {
  ReportFilterBar,
  ReportFilterField,
} from "../../../../components/ReportFilterBar";
import { Select } from "../../../../components/Select";

interface ConsumptionFilterBarProps {
  filters: ConsumptionParams;
  onChange(next: ConsumptionParams): void;
  show?: ReportFilterField[];
  /** Só o desperdício no tempo agrupa; nos demais o parâmetro é ignorado. */
  showGrouping?: boolean;
}

export function ConsumptionFilterBar({
  filters,
  onChange,
  show = ['category', 'product', 'supplyCategory', 'supply'],
  showGrouping,
}: ConsumptionFilterBarProps) {
  const selected = filters.movementTypes
    ? filters.movementTypes.split(',').filter(Boolean)
    : [];

  const isRestricted = selected.length > 0;

  function handleToggleType(type: string) {
    const next = selected.includes(type)
      ? selected.filter(item => item !== type)
      : [...selected, type];

    const updated = { ...filters };

    if (next.length === 0) {
      delete updated.movementTypes;
    } else {
      updated.movementTypes = next.join(',');
    }

    onChange(updated);
  }

  function handleGrouping(value: string) {
    const updated = { ...filters };

    if (value === '') {
      delete updated.groupBy;
    } else {
      updated.groupBy = value as PeriodGrouping;
    }

    onChange(updated);
  }

  return (
    <ReportFilterBar
      filters={filters}
      onChange={onChange}
      show={show}
      periodHint="Em branco, os últimos 30 dias até agora. O período aqui tem hora, não só data."
    >
      <div className="rounded-lg border border-gray-600 bg-white p-4">
        <span className="block font-medium text-gray-500">
          O que conta como consumo real
        </span>

        <span className="mt-1 block text-xs text-gray-400">
          Nenhum marcado, valem os seis tipos — que é o consumo total do período.
        </span>

        <div className="mt-3 -mx-4 overflow-x-auto px-4">
          <div className="flex w-max gap-2">
            {consumptionMovementTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => handleToggleType(type)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-sm transition-all',
                  selected.includes(type)
                    ? 'border-red-800 bg-red-800 text-white'
                    : 'border-gray-600 text-gray-500',
                )}
              >
                {stockMovementTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/*
          Restringir muda o SIGNIFICADO de "real": pedir só perdas compara o
          desperdício contra o consumo previsto inteiro, e a variação sai
          catastrófica sem que nada esteja errado.
        */}
        {isRestricted && (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
            <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

            <span>
              Com os tipos restritos, o "real" deixa de ser o consumo total: ele
              passa a somar só{' '}
              {selected
                .map(type => stockMovementTypeLabels[
                  type as keyof typeof stockMovementTypeLabels
                ] ?? type)
                .join(', ')}
              . A comparação serve para investigar uma causa específica, não
              para medir desperdício.
            </span>
          </p>
        )}

        {showGrouping && (
          <div className="mt-4 border-t border-gray-600/40 pt-4 sm:max-w-[240px]">
            <Select
              value={filters.groupBy ?? ''}
              onChange={event => handleGrouping(event.target.value)}
            >
              <option value="">Agrupar por dia (padrão)</option>

              {periodGroupings.map(option => (
                <option key={option} value={option}>
                  {periodGroupingLabels[option]}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
    </ReportFilterBar>
  );
}
