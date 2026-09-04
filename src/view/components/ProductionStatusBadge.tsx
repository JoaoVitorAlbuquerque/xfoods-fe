import { cn } from "../../app/utils/cn";
import {
  ProductionStatus,
  productionStatusClasses,
  productionStatusHints,
  productionStatusLabels,
} from "../../types/Production";

interface ProductionStatusBadgeProps {
  status: ProductionStatus;
  className?: string;
}

export function ProductionStatusBadge({ status, className }: ProductionStatusBadgeProps) {
  return (
    <span
      title={productionStatusHints[status]}
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium',
        productionStatusClasses[status],
        className,
      )}
    >
      {productionStatusLabels[status]}
    </span>
  );
}
