import { InfoCircledIcon } from "@radix-ui/react-icons";
import { ComponentProps, forwardRef } from "react";

import { cn } from "../../app/utils/cn";

interface SelectProps extends ComponentProps<'select'> {
  error?: string;
}

/**
 * `forwardRef` é obrigatório aqui: sem ele o `ref` do `register()` do
 * react-hook-form não chega ao `<select>`, o campo nunca é registrado e o
 * valor escolhido não aparece no submit.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          {...props}
          ref={ref}
          className={cn(
            'bg-white w-full rounded-lg border border-gray-600 px-3 h-[52px] text-gray-800 focus:border-gray-800 transition-all outline-none',
            error && '!border-red-900',
            className,
          )}
        >
          {props.children}
        </select>

        {error && (
          <div className="flex items-center gap-2 mt-2 text-red-900">
            <InfoCircledIcon />
            <span className="text-xs">{error}</span>
          </div>
        )}
      </div>
    );
  },
);
