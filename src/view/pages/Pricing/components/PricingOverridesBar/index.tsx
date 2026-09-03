import { useState } from "react";
import { Link } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons";

import { PricingOverrides } from "../../../../../app/services/pricingService";
import { usePricingSettings } from "../../../../../app/hooks/usePricingQueries";
import { cn } from "../../../../../app/utils/cn";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { getPricingViability } from "../../../../../app/utils/pricingViability";
import { DescribedPercentages } from "../../../../../types/Pricing";
import { PeriodFilter } from "../../../../components/PeriodFilter";

interface PricingOverridesBarProps {
  overrides: PricingOverrides;
  onChange(next: PricingOverrides): void;
  /** Percentuais resolvidos na última resposta, para mostrar a origem de cada um. */
  percentages?: DescribedPercentages;
}

/**
 * Canais prontos. A API soma cartão + entrega + outras taxas em toda consulta,
 * o que precifica o canal mais caro; zerar o que não incide no balcão é o
 * atalho que o próprio contrato sugere (`?cardFeePercent=0`).
 */
const channels = [
  {
    id: 'SETTINGS',
    label: 'Delivery / padrão',
    hint: 'Cartão, entrega e outras taxas somados — é o canal mais caro.',
    overrides: {} as PricingOverrides,
  },
  {
    id: 'COUNTER_CARD',
    label: 'Balcão no cartão',
    hint: 'Zera só a taxa de entrega.',
    overrides: { deliveryFeePercent: '0' } as PricingOverrides,
  },
  {
    id: 'COUNTER_CASH',
    label: 'Balcão em dinheiro',
    hint: 'Zera a taxa de cartão e a de entrega.',
    overrides: { cardFeePercent: '0', deliveryFeePercent: '0' } as PricingOverrides,
  },
];

const percentFields = [
  { param: 'marginPercent', label: 'Margem' },
  { param: 'taxPercent', label: 'Impostos' },
  { param: 'cardFeePercent', label: 'Taxa de cartão' },
  { param: 'deliveryFeePercent', label: 'Taxa de entrega' },
  { param: 'otherFeesPercent', label: 'Outras taxas' },
] as const;

type PercentParam = typeof percentFields[number]['param'];

/** Só os percentuais: a competência não faz parte da identidade do canal. */
function samePercents(a: PricingOverrides, b: PricingOverrides) {
  return percentFields.every(field => (a[field.param] ?? '') === (b[field.param] ?? ''));
}

export function PricingOverridesBar({
  overrides,
  onChange,
  percentages,
}: PricingOverridesBarProps) {
  const { settings } = usePricingSettings();

  const activeChannel = channels.find(channel =>
    samePercents(overrides, channel.overrides),
  );

  const [isCustomOpen, setIsCustomOpen] = useState(!activeChannel);

  function handleChannel(channelOverrides: PricingOverrides) {
    onChange({
      ...channelOverrides,
      ...(overrides.from ? { from: overrides.from } : {}),
      ...(overrides.to ? { to: overrides.to } : {}),
    });
  }

  function handlePercent(param: PercentParam, value: string) {
    const next = { ...overrides };

    if (value === '') {
      delete next[param];
    } else {
      next[param] = value;
    }

    onChange(next);
  }

  /**
   * O que vai valer de fato: o que a consulta manda, ou o que está gravado.
   * É essa soma que a API recusa acima de 100% — mostrar aqui é o que faz o
   * usuário ver o limite antes de submeter.
   */
  const effective = {
    marginPercent: Number(overrides.marginPercent ?? settings?.desiredMarginPercent ?? 0),
    taxPercent: Number(overrides.taxPercent ?? settings?.taxPercent ?? 0),
    cardFeePercent: Number(overrides.cardFeePercent ?? settings?.cardFeePercent ?? 0),
    deliveryFeePercent: Number(overrides.deliveryFeePercent ?? settings?.deliveryFeePercent ?? 0),
    otherFeesPercent: Number(overrides.otherFeesPercent ?? settings?.otherFeesPercent ?? 0),
  };

  const viability = getPricingViability(effective);

  return (
    <div className="mb-6 space-y-4">
      {settings && !settings.configured && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-2 text-yellow-900">
            <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

            <div>
              <strong className="block text-sm">
                Ninguém configurou a formação de preço ainda
              </strong>

              <p className="mt-1 text-xs">
                Imposto e taxas nascem em <strong>zero de propósito</strong> — não
                dá para adivinhar o regime tributário nem a adquirente de
                ninguém. Enquanto estiverem zerados, o preço recomendado ignora o
                que o governo e a máquina de cartão levam, e sai mais baixo do
                que o real.{' '}
                <Link to="/settings/pricing" className="font-bold underline">
                  Configurar agora
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-600 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-gray-500">Canal de venda</span>

          <Link to="/settings/pricing" className="text-sm font-bold text-red-600">
            Configurar preços
          </Link>
        </div>

        <div className="mt-3 -mx-4 overflow-x-auto px-4">
          <div className="flex w-max gap-2">
            {channels.map(channel => (
              <button
                key={channel.id}
                type="button"
                onClick={() => handleChannel(channel.overrides)}
                title={channel.hint}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-sm transition-all',
                  activeChannel?.id === channel.id
                    ? 'border-red-800 bg-red-800 text-white'
                    : 'border-gray-600 text-gray-500',
                )}
              >
                {channel.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomOpen(open => !open)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm transition-all',
                !activeChannel
                  ? 'border-red-800 bg-red-800 text-white'
                  : 'border-gray-600 text-gray-500',
              )}
            >
              {activeChannel ? 'Personalizar' : 'Personalizado'}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          {activeChannel?.hint
            ?? 'Percentuais informados na consulta. Nada é gravado — a configuração continua como está.'}
        </p>

        {isCustomOpen && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-600/40 pt-4 lg:grid-cols-5">
            {percentFields.map(field => (
              <label key={field.param} className="relative block">
                <span className="absolute left-3 top-2 text-xs text-gray-700">
                  {field.label}
                </span>

                <NumericFormat
                  value={overrides[field.param] ?? ''}
                  onValueChange={(values, sourceInfo) => {
                    if (sourceInfo.source === 'event') {
                      handlePercent(field.param, values.value);
                    }
                  }}
                  valueIsNumericString
                  decimalSeparator=","
                  allowNegative={false}
                  decimalScale={2}
                  suffix="%"
                  placeholder="configuração"
                  className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 pt-4 text-gray-800 outline-none transition-all focus:border-gray-800"
                />
              </label>
            ))}

            <span className="col-span-2 text-xs text-gray-400 lg:col-span-5">
              Campo vazio usa o valor da configuração.
            </span>
          </div>
        )}

        {!viability.isViable && (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-900">
            <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

            <span>
              {viability.message} Com estas taxas, a margem máxima possível é{' '}
              <strong>{formatPercentPlain(viability.maxMarginPercent)}</strong>.
            </span>
          </p>
        )}

        {percentages && (
          <div className="mt-4 border-t border-gray-600/40 pt-4">
            <div className="flex flex-wrap gap-2">
              {percentFields.map(field => (
                <span
                  key={field.param}
                  className={cn(
                    'rounded px-2 py-1 text-xs',
                    percentages.source[field.param] === 'QUERY'
                      ? 'bg-red-100 text-red-900'
                      : 'bg-gray-500/10 text-gray-500',
                  )}
                >
                  {field.label} {formatPercentPlain(percentages[field.param])}
                  <span className="ml-1 opacity-70">
                    {percentages.source[field.param] === 'QUERY'
                      ? '· consulta'
                      : '· configuração'}
                  </span>
                </span>
              ))}
            </div>

            <p className="mt-3 flex items-start gap-2 text-xs text-gray-400">
              <InfoCircledIcon className="mt-0.5 shrink-0" />

              Impostos + taxas + margem somam{' '}
              {formatPercentPlain(percentages.totalPercent)} do preço. Sobram{' '}
              {formatPercentPlain(100 - percentages.totalPercent)} para o custo do
              prato.
            </p>
          </div>
        )}
      </div>

      <PeriodFilter
        from={overrides.from ?? ''}
        to={overrides.to ?? ''}
        onChangeFrom={value => onChange({ ...overrides, from: value })}
        onChangeTo={value => onChange({ ...overrides, to: value })}
        hint="Competência do custo indireto rateado. Em branco, o período é o mês corrente."
      />
    </div>
  );
}
