import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { consumptionService } from "../../../../../app/services/consumptionService";
import {
  consumptionQueryKey,
  consumptionStaleTime,
} from "../../../../../app/hooks/useConsumptionQueries";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { ConsumptionFilterBar } from "../ConsumptionFilterBar";
import { ConsumptionPeriodLine } from "../ConsumptionPeriodLine";
import { InterpretationPanel } from "../InterpretationPanel";
import { SupplyRowList } from "../SupplyRowList";
import { useConsumptionFilters } from "../../useConsumptionFilters";

export function TopDeviations() {
  const { filters, setFilters } = useConsumptionFilters();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...consumptionQueryKey, 'deviations', filters],
    queryFn: () => consumptionService.getDeviations(filters),
    staleTime: consumptionStaleTime,
  });

  return (
    <>
      <ConsumptionFilterBar filters={filters} onChange={setFilters} />

      <ListFeedback
        isLoading={isFetching && !data}
        isError={isError}
        isEmpty={false}
        emptyMessage=""
        errorMessage="Não foi possível carregar os maiores desvios."
        onRetry={refetch}
      >
        {data && (
          <>
            <ConsumptionPeriodLine period={data.period}>
              {' '}· tolerância de{' '}
              <strong className="text-gray-500">
                {formatPercentPlain(data.tolerancePercent)}
              </strong>
            </ConsumptionPeriodLine>

            <p className="mb-4 flex items-start gap-2 rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
              <InfoCircledIcon className="mt-0.5 shrink-0" />

              <span>
                Só o que passou da tolerância de{' '}
                {formatPercentPlain(data.tolerancePercent)}, do desvio mais
                gritante para o menos. Consumo que nenhuma venda previa vem
                primeiro: é variação sem base, e ficaria no fim de qualquer
                ordenação numérica. A tolerância vem das{' '}
                <Link to="/settings/stock" className="font-bold underline">
                  configurações de estoque
                </Link>
                .
              </span>
            </p>

            <ContentHeader title="Maiores desvios" quantity={data.items.length} />

            <SupplyRowList
              items={data.items}
              emptyMessage={`Nenhum insumo passou da tolerância de ${formatPercentPlain(data.tolerancePercent)} no período.`}
            />

            <InterpretationPanel
              className="mt-6"
              interpretation={data.interpretation}
            />
          </>
        )}
      </ListFeedback>
    </>
  );
}
