import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { NumericFormat } from "react-number-format";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";

import { pricingService } from "../../../../../app/services/pricingService";
import {
  useInvalidatePricing,
  usePricingSettings,
} from "../../../../../app/hooks/usePricingQueries";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { getPricingViability } from "../../../../../app/utils/pricingViability";
import { toastApiError } from "../../../../../app/utils/toastApiError";
import { Button } from "../../../../components/Button";
import { ListFeedback } from "../../../../components/ListFeedback";

const fields = [
  {
    key: 'desiredMarginPercent',
    label: 'Margem desejada',
    hint: 'Sobre o PREÇO de venda: 30% significa que 30% do preço final sobra como lucro, depois de custo, imposto e taxa.',
  },
  {
    key: 'taxPercent',
    label: 'Impostos',
    hint: 'O percentual do faturamento que sai em tributo — Simples, ISS, o que se aplicar ao seu regime.',
  },
  {
    key: 'cardFeePercent',
    label: 'Taxa de cartão',
    hint: 'O que a adquirente desconta de cada venda no cartão.',
  },
  {
    key: 'deliveryFeePercent',
    label: 'Taxa de delivery',
    hint: 'A comissão do aplicativo ou o custo da entrega própria.',
  },
  {
    key: 'otherFeesPercent',
    label: 'Outras taxas',
    hint: 'Comissão de garçom, embalagem cobrada por venda, o que mais incidir sobre o preço.',
  },
] as const;

type FieldKey = typeof fields[number]['key'];

type FormValues = Record<FieldKey, string>;

const emptyForm: FormValues = {
  desiredMarginPercent: '',
  taxPercent: '',
  cardFeePercent: '',
  deliveryFeePercent: '',
  otherFeesPercent: '',
};

/** Custo de referência do exemplo, só para dar concretude à conta. */
const EXAMPLE_COST = 10;

export function SettingsPricing() {
  const { settings, isFetching, isError, refetch } = usePricingSettings();
  const invalidatePricing = useInvalidatePricing();

  const [values, setValues] = useState<FormValues>(emptyForm);

  useEffect(() => {
    if (settings) {
      setValues({
        desiredMarginPercent: String(settings.desiredMarginPercent),
        taxPercent: String(settings.taxPercent),
        cardFeePercent: String(settings.cardFeePercent),
        deliveryFeePercent: String(settings.deliveryFeePercent),
        otherFeesPercent: String(settings.otherFeesPercent),
      });
    }
  }, [settings]);

  const { isPending, mutateAsync } = useMutation({
    mutationFn: pricingService.updateSettings,
  });

  const viability = getPricingViability({
    marginPercent: Number(values.desiredMarginPercent || 0),
    taxPercent: Number(values.taxPercent || 0),
    cardFeePercent: Number(values.cardFeePercent || 0),
    deliveryFeePercent: Number(values.deliveryFeePercent || 0),
    otherFeesPercent: Number(values.otherFeesPercent || 0),
  });

  const examplePrice = viability.isViable
    ? EXAMPLE_COST / (1 - viability.totalPercent / 100)
    : null;

  const handleSubmit = useCallback(async () => {
    try {
      await mutateAsync({
        desiredMarginPercent: values.desiredMarginPercent || '0',
        taxPercent: values.taxPercent || '0',
        cardFeePercent: values.cardFeePercent || '0',
        deliveryFeePercent: values.deliveryFeePercent || '0',
        otherFeesPercent: values.otherFeesPercent || '0',
      });

      invalidatePricing();
      toast.success('Configuração de preços salva!');
    } catch (error) {
      toastApiError(error, 'Erro ao salvar a configuração de preços!');
    }
  }, [values, mutateAsync, invalidatePricing]);

  return (
    <ListFeedback
      isLoading={isFetching && !settings}
      isError={isError}
      isEmpty={false}
      emptyMessage=""
      errorMessage="Não foi possível carregar a configuração de preços."
      onRetry={refetch}
    >
      <div className="max-w-[640px] space-y-4">
        {settings && !settings.configured && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-2 text-yellow-900">
              <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

              <div>
                <strong className="block text-sm">
                  Ninguém configurou a formação de preço ainda
                </strong>

                <p className="mt-1 text-xs">
                  Imposto e taxas nascem em <strong>zero de propósito</strong> —
                  não dá para adivinhar o regime tributário nem a adquirente de
                  ninguém, e um número inventado aqui sairia como preço
                  recomendado sem nada avisar. Enquanto não forem preenchidos, o
                  recomendado em{' '}
                  <Link to="/pricing" className="font-bold underline">
                    Preços
                  </Link>{' '}
                  ignora o que o governo e a máquina levam.
                </p>
              </div>
            </div>
          </div>
        )}

        {fields.map(field => (
          <div key={field.key} className="rounded-lg border border-gray-600 bg-white p-4">
            <span className="block font-medium text-gray-500">{field.label}</span>

            <span className="mt-1 block text-xs text-gray-400">{field.hint}</span>

            <div className="mt-3 sm:max-w-[200px]">
              <NumericFormat
                value={values[field.key]}
                onValueChange={(next, sourceInfo) => {
                  if (sourceInfo.source === 'event') {
                    setValues(current => ({ ...current, [field.key]: next.value }));
                  }
                }}
                valueIsNumericString
                decimalSeparator=","
                allowNegative={false}
                decimalScale={2}
                suffix="%"
                placeholder="0%"
                className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800"
              />
            </div>
          </div>
        ))}

        {/*
          A trava do servidor, repetida aqui: a API recusa 100% ou mais com um
          400, e ver o limite enquanto digita é melhor que descobrir no erro.
        */}
        <div className={
          viability.isViable
            ? 'rounded-lg border border-gray-600 bg-white p-4'
            : 'rounded-lg border border-red-200 bg-red-50 p-4'
        }>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <span className="font-medium text-gray-500">
              Impostos + taxas + margem
            </span>

            <strong className={
              viability.isViable
                ? 'text-xl font-bold text-gray-500'
                : 'text-xl font-bold text-red-900'
            }>
              {formatPercentPlain(viability.totalPercent)}
            </strong>
          </div>

          {viability.isViable ? (
            <p className="mt-2 flex items-start gap-2 text-xs text-gray-400">
              <InfoCircledIcon className="mt-0.5 shrink-0" />

              <span>
                Sobram {formatPercentPlain(100 - viability.totalPercent)} do preço
                para o custo do prato. Um prato que custa{' '}
                {formatCurrency(EXAMPLE_COST)} sairia a{' '}
                <strong className="text-gray-500">
                  {examplePrice === null ? '—' : formatCurrency(examplePrice)}
                </strong>{' '}
                — não a {formatCurrency(EXAMPLE_COST * (1 + Number(values.desiredMarginPercent || 0) / 100))},
                porque imposto e taxa também saem do preço, não do custo.
              </span>
            </p>
          ) : (
            <p className="mt-2 flex items-start gap-2 text-xs text-red-900">
              <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

              <span>
                {viability.message} Com as taxas e o imposto atuais, a margem
                máxima possível é{' '}
                <strong>{formatPercentPlain(viability.maxMarginPercent)}</strong>.
              </span>
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400">
          Taxa de cartão e de delivery são <strong>somadas</strong> em todo
          cálculo, o que precifica o canal mais caro. Para ver o preço do balcão
          sem essas taxas, use o seletor de canal em{' '}
          <Link to="/pricing" className="font-bold underline">
            Preços
          </Link>{' '}
          — ele sobrescreve os percentuais só na consulta, sem gravar nada.
        </p>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          {settings?.updatedAt && (
            <span className="text-xs text-gray-400 sm:mr-auto">
              Última alteração em{' '}
              {new Date(settings.updatedAt).toLocaleString('pt-br')}
            </span>
          )}

          <Button
            onClick={handleSubmit}
            isLoading={isPending}
            disabled={!viability.isViable}
            className="w-full sm:w-auto"
          >
            Salvar Configuração
          </Button>
        </div>
      </div>
    </ListFeedback>
  );
}
