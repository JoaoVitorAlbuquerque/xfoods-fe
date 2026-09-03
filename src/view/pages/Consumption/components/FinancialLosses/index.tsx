import { useQuery } from "@tanstack/react-query";
import { InfoCircledIcon } from "@radix-ui/react-icons";

import { consumptionService } from "../../../../../app/services/consumptionService";
import {
  consumptionQueryKey,
  consumptionStaleTime,
} from "../../../../../app/hooks/useConsumptionQueries";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { ContentHeader } from "../../../../components/ContentHeader";
import { ListFeedback } from "../../../../components/ListFeedback";
import { ConsumptionFilterBar } from "../ConsumptionFilterBar";
import { ConsumptionPeriodLine } from "../ConsumptionPeriodLine";
import { InterpretationPanel } from "../InterpretationPanel";
import { SupplyRowList } from "../SupplyRowList";
import { useConsumptionFilters } from "../../useConsumptionFilters";

export function FinancialLosses() {
  const { filters, setFilters } = useConsumptionFilters();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [...consumptionQueryKey, 'financial-losses', filters],
    queryFn: () => consumptionService.getFinancialLosses(filters),
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
        errorMessage="Não foi possível carregar as maiores perdas."
        onRetry={refetch}
      >
        {data && (
          <>
            <ConsumptionPeriodLine period={data.period} />

            <div className="mb-4 rounded-lg border border-gray-600 bg-white p-4 md:p-6">
              <span className="block text-xs text-gray-400">
                Custo do desvio nestes insumos
              </span>

              <strong className="text-2xl font-bold text-gray-500">
                {formatCurrency(data.summary.totalLossCost)}
              </strong>
            </div>

            {/*
              Consumo abaixo do previsto fica de fora: pode ser boa notícia ou
              ficha errada, mas não é perda — e misturar os dois esconderia o
              insumo que está de fato drenando caixa.
            */}
            <p className="mb-4 flex items-start gap-2 rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
              <InfoCircledIcon className="mt-0.5 shrink-0" />

              <span>
                Só o que custou dinheiro: os insumos que saíram <strong>além</strong>{' '}
                do previsto, do maior valor para o menor. Consumo abaixo do
                previsto não entra aqui — pode ser boa notícia ou ficha errada,
                mas não é perda.
              </span>
            </p>

            <ContentHeader title="Maiores perdas" quantity={data.items.length} />

            <SupplyRowList
              items={data.items}
              emptyMessage="Nenhum insumo saiu além do previsto no período."
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
