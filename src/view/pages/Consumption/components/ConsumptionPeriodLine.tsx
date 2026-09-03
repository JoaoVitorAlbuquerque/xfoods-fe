import { formatDateTime } from "../../../../app/utils/formatDateTime";
import { ConsumptionPeriod } from "../../../../types/Consumption";

interface ConsumptionPeriodLineProps {
  period: ConsumptionPeriod;
  children?: React.ReactNode;
}

/**
 * A janela exata que a API usou, com hora.
 *
 * Diferente das competências de despesa, aqui o período é um intervalo de
 * instantes — e mostrá-lo por extenso é o que deixa visível até onde o
 * relatório foi buscar movimentação.
 */
export function ConsumptionPeriodLine({
  period,
  children,
}: ConsumptionPeriodLineProps) {
  return (
    <p className="mb-6 text-sm text-gray-400">
      De{' '}
      <strong className="text-gray-500">
        {formatDateTime(new Date(period.from))}
      </strong>{' '}
      a{' '}
      <strong className="text-gray-500">
        {formatDateTime(new Date(period.to))}
      </strong>

      {children}
    </p>
  );
}
