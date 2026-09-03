import { cn } from "../../app/utils/cn";
import { StockStatus, stockStatusClasses, stockStatusLabels } from "../../types/Supply";

interface StockStatusBadgeProps {
  status: StockStatus;
  className?: string;
}

export function StockStatusBadge({ status, className }: StockStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium',
        stockStatusClasses[status],
        className,
      )}
    >
      {status === 'NEGATIVE' && <span aria-hidden>⚠</span>}

      {stockStatusLabels[status]}
    </span>
  );
}
