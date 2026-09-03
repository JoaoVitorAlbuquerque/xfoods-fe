import { cn } from "../../app/utils/cn";
import {
  PriceStatus,
  priceStatusClasses,
  priceStatusLabels,
} from "../../types/Pricing";

interface PriceStatusBadgeProps {
  status: PriceStatus;
  className?: string;
}

export function PriceStatusBadge({ status, className }: PriceStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium',
        priceStatusClasses[status],
        className,
      )}
    >
      {status === 'ABAIXO_DO_CUSTO' && <span aria-hidden>⚠</span>}

      {priceStatusLabels[status]}
    </span>
  );
}
