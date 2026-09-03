import { cn } from "../../app/utils/cn";
import {
  ConsumptionClassification,
  consumptionClassificationClasses,
  consumptionClassificationLabels,
} from "../../types/Consumption";

interface ConsumptionClassificationBadgeProps {
  classification: ConsumptionClassification;
  className?: string;
}

export function ConsumptionClassificationBadge({
  classification,
  className,
}: ConsumptionClassificationBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium',
        consumptionClassificationClasses[classification],
        className,
      )}
    >
      {classification === 'ACIMA_DO_ESPERADO' && <span aria-hidden>⚠</span>}

      {consumptionClassificationLabels[classification]}
    </span>
  );
}
