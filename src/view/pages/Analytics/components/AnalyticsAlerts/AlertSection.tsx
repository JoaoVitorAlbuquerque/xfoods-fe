import { cn } from "../../../../../app/utils/cn";

interface AlertSectionProps {
  title: string;
  description: string;
  count: number;
  emptyMessage: string;
  tone?: 'danger' | 'warning' | 'neutral';
  action?: React.ReactNode;
  children: React.ReactNode;
}

const tones = {
  danger: 'bg-red-100 text-red-900',
  warning: 'bg-yellow-100 text-yellow-900',
  neutral: 'bg-gray-500/20 text-gray-500',
};

export function AlertSection({
  title,
  description,
  count,
  emptyMessage,
  tone = 'warning',
  action,
  children,
}: AlertSectionProps) {
  return (
    <section className="rounded-lg border border-gray-600 bg-white p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-gray-500">{title}</strong>

            <span className={cn(
              'rounded px-2 py-0.5 text-xs font-medium',
              count > 0 ? tones[tone] : 'bg-green-100 text-green-800',
            )}>
              {count}
            </span>
          </div>

          <span className="mt-1 block text-xs text-gray-400">{description}</span>
        </div>

        {action}
      </div>

      {count === 0 ? (
        <p className="mt-4 text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        <div className="mt-4">{children}</div>
      )}
    </section>
  );
}
