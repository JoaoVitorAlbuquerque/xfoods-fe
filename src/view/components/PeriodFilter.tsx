interface PeriodFilterProps {
  from: string;
  to: string;
  onChangeFrom(value: string): void;
  onChangeTo(value: string): void;
  hint?: string;
}

/**
 * Janela de competência dos relatórios de custo. Ausente nas duas pontas, a
 * API usa o mês corrente — por isso o campo vazio é um estado válido, e não
 * um filtro faltando.
 */
export function PeriodFilter({
  from,
  to,
  onChangeFrom,
  onChangeTo,
  hint = 'Em branco, o período é o mês corrente.',
}: PeriodFilterProps) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md">
        <label className="relative">
          <span className="absolute left-3 top-2 text-xs text-gray-700">
            Competência de
          </span>

          <input
            type="date"
            value={from}
            onChange={event => onChangeFrom(event.target.value)}
            className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 pt-4 text-gray-800 outline-none transition-all focus:border-gray-800"
          />
        </label>

        <label className="relative">
          <span className="absolute left-3 top-2 text-xs text-gray-700">Até</span>

          <input
            type="date"
            value={to}
            onChange={event => onChangeTo(event.target.value)}
            className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 pt-4 text-gray-800 outline-none transition-all focus:border-gray-800"
          />
        </label>
      </div>

      <span className="mt-2 block text-xs text-gray-400">{hint}</span>
    </div>
  );
}
