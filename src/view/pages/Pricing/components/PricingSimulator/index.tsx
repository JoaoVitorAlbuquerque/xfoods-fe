import { Cross2Icon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { NumericFormat } from "react-number-format";

import { cn } from "../../../../../app/utils/cn";
import { formatCurrency } from "../../../../../app/utils/formatCurrency";
import { formatPercentPlain } from "../../../../../app/utils/formatPercent";
import { isUnreachablePriceError } from "../../../../../app/utils/isUnreachablePriceError";
import { Button } from "../../../../components/Button";
import { ListFeedback } from "../../../../components/ListFeedback";
import { NotesPanel } from "../../../../components/NotesPanel";
import { Select } from "../../../../components/Select";
import { TableComponents } from "../../../../components/TableElements";
import { PricingOverridesBar } from "../PricingOverridesBar";
import { UnreachablePriceNotice } from "../UnreachablePriceNotice";
import { usePricingSimulatorController } from "./usePricingSimulatorController";

export function PricingSimulator() {
  const {
    data,
    isFetching,
    isError,
    error,
    refetch,
    overrides,
    setOverrides,
    productOptions,
    source,
    setSource,
    productId,
    setProductId,
    cost,
    setCost,
    margins,
    marginDraft,
    setMarginDraft,
    handleAddMargin,
    handleRemoveMargin,
    hasSubject,
  } = usePricingSimulatorController();

  return (
    <>
      <div className="mb-6 rounded-lg border border-gray-600 bg-white p-4">
        <span className="block font-medium text-gray-500">O que simular</span>

        <span className="mt-1 block text-xs text-gray-400">
          Um prato do cardápio usa o custo completo real dele. Um custo avulso
          serve para testar um prato que ainda não existe.
        </span>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            value={source}
            onChange={event => setSource(event.target.value as typeof source)}
          >
            <option value="COST">Um custo avulso</option>
            <option value="PRODUCT">Um prato do cardápio</option>
          </Select>

          {source === 'PRODUCT' ? (
            <Select
              value={productId}
              onChange={event => setProductId(event.target.value)}
            >
              <option value="">Escolha o prato</option>

              {productOptions.map(product => (
                <option key={product.productId} value={product.productId}>
                  {product.productName}
                </option>
              ))}
            </Select>
          ) : (
            <label className="relative block">
              <span className="absolute left-3 top-2 text-xs text-gray-700">
                Custo completo do prato
              </span>

              <NumericFormat
                value={cost}
                onValueChange={(values, sourceInfo) => {
                  if (sourceInfo.source === 'event') {
                    setCost(values.value);
                  }
                }}
                valueIsNumericString
                thousandSeparator="."
                decimalSeparator=","
                allowNegative={false}
                decimalScale={2}
                prefix="R$ "
                placeholder="R$ 0,00"
                className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 pt-4 text-gray-800 outline-none transition-all focus:border-gray-800"
              />
            </label>
          )}
        </div>

        {source === 'PRODUCT' && productOptions.length === 0 && (
          <p className="mt-3 text-xs text-yellow-800">
            Nenhum prato com ficha ativa para simular. Sem ficha não há custo
            completo, e a simulação por prato não tem de onde partir.
          </p>
        )}

        <div className="mt-4 border-t border-gray-600/40 pt-4">
          <span className="block font-medium text-gray-500">Margens a simular</span>

          <span className="mt-1 block text-xs text-gray-400">
            Sem nenhuma escolhida, a API simula uma faixa em torno da margem
            configurada.
          </span>

          {margins.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {margins.map(margin => (
                <button
                  key={margin}
                  type="button"
                  onClick={() => handleRemoveMargin(margin)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-600 px-3 py-1 text-sm text-gray-500"
                >
                  {formatPercentPlain(Number(margin))}

                  <Cross2Icon />
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <NumericFormat
              value={marginDraft}
              onValueChange={(values, sourceInfo) => {
                if (sourceInfo.source === 'event') {
                  setMarginDraft(values.value);
                }
              }}
              valueIsNumericString
              decimalSeparator=","
              allowNegative={false}
              decimalScale={2}
              suffix="%"
              placeholder="Ex: 35%"
              className="h-[52px] w-full rounded-lg border border-gray-600 bg-white px-3 text-gray-800 outline-none transition-all focus:border-gray-800 sm:w-40"
            />

            <Button
              onClick={handleAddMargin}
              disabled={!marginDraft}
              className="w-full sm:w-auto"
            >
              Adicionar margem
            </Button>
          </div>
        </div>
      </div>

      <PricingOverridesBar
        overrides={overrides}
        onChange={setOverrides}
        percentages={data?.percentages}
      />

      <div className="mb-6">
        <UnreachablePriceNotice error={error} />
      </div>

      {!hasSubject && (
        <div className="rounded-lg border border-gray-600 bg-white p-8 text-center text-gray-400">
          {source === 'PRODUCT'
            ? 'Escolha um prato para ver os cenários.'
            : 'Informe um custo para ver os cenários.'}
        </div>
      )}

      {hasSubject && (
        <ListFeedback
          isLoading={isFetching}
          isError={isError && !data && !isUnreachablePriceError(error)}
          isEmpty={false}
          emptyMessage=""
          errorMessage="Não foi possível simular estes cenários."
          onRetry={refetch}
        >
          {data && (
            <>
              <div className="mb-6 rounded-lg border border-gray-600 bg-white p-4">
                <span className="block text-xs text-gray-400">
                  {data.product ? 'Custo completo do prato' : 'Custo informado'}
                </span>

                <strong className="text-xl font-bold text-gray-500">
                  {formatCurrency(data.cost)}
                </strong>

                {data.product && (
                  <span className="mt-1 block text-sm text-gray-400">
                    {data.product.name}
                  </span>
                )}
              </div>

              <div className="space-y-3 md:hidden">
                {data.scenarios.map(scenario => (
                  <div
                    key={scenario.marginPercent}
                    className={cn(
                      'rounded-lg border bg-white p-4',
                      scenario.viable ? 'border-gray-600' : 'border-red-200',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="block text-xs text-gray-400">
                          Margem pedida
                        </span>

                        <strong className="text-gray-500">
                          {formatPercentPlain(scenario.marginPercent)}
                        </strong>
                      </div>

                      <strong className="text-xl font-bold text-gray-500">
                        {scenario.price === null ? '—' : formatCurrency(scenario.price)}
                      </strong>
                    </div>

                    {scenario.viable ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="block text-xs text-gray-400">Impostos</span>
                          <span className="text-gray-500">
                            {scenario.taxes === null ? '—' : formatCurrency(scenario.taxes)}
                          </span>
                        </div>

                        <div>
                          <span className="block text-xs text-gray-400">Taxas</span>
                          <span className="text-gray-500">
                            {scenario.fees === null ? '—' : formatCurrency(scenario.fees)}
                          </span>
                        </div>

                        <div>
                          <span className="block text-xs text-gray-400">Lucro</span>
                          <span className="text-gray-500">
                            {scenario.profit === null ? '—' : formatCurrency(scenario.profit)}
                          </span>
                        </div>

                        <div>
                          <span className="block text-xs text-gray-400">
                            Margem obtida
                          </span>

                          <strong className="text-gray-500">
                            {formatPercentPlain(scenario.effectiveMarginPercent)}
                          </strong>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 flex items-start gap-2 text-xs text-red-900">
                        <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                        {scenario.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <TableComponents.Table>
                  <thead>
                    <tr className="bg-gray-600/20">
                      <TableComponents.TableHeader>Margem pedida</TableComponents.TableHeader>
                      <TableComponents.TableHeader>Preço</TableComponents.TableHeader>
                      <TableComponents.TableHeader>Impostos</TableComponents.TableHeader>
                      <TableComponents.TableHeader>Taxas</TableComponents.TableHeader>
                      <TableComponents.TableHeader>Lucro</TableComponents.TableHeader>
                      <TableComponents.TableHeader>Margem obtida</TableComponents.TableHeader>
                      <TableComponents.TableHeader>Sobre o custo</TableComponents.TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {data.scenarios.map(scenario => (
                      <TableComponents.TableRow key={scenario.marginPercent}>
                        <TableComponents.TableCell className="whitespace-nowrap font-medium">
                          {formatPercentPlain(scenario.marginPercent)}
                        </TableComponents.TableCell>

                        {scenario.viable ? (
                          <>
                            <TableComponents.TableCell className="whitespace-nowrap font-medium">
                              {scenario.price === null ? '—' : formatCurrency(scenario.price)}
                            </TableComponents.TableCell>

                            <TableComponents.TableCell className="whitespace-nowrap">
                              {scenario.taxes === null ? '—' : formatCurrency(scenario.taxes)}
                            </TableComponents.TableCell>

                            <TableComponents.TableCell className="whitespace-nowrap">
                              {scenario.fees === null ? '—' : formatCurrency(scenario.fees)}
                            </TableComponents.TableCell>

                            <TableComponents.TableCell className="whitespace-nowrap">
                              {scenario.profit === null ? '—' : formatCurrency(scenario.profit)}
                            </TableComponents.TableCell>

                            <TableComponents.TableCell className="whitespace-nowrap">
                              {formatPercentPlain(scenario.effectiveMarginPercent)}
                            </TableComponents.TableCell>

                            <TableComponents.TableCell className="whitespace-nowrap">
                              {formatPercentPlain(scenario.markupOverCostPercent)}
                            </TableComponents.TableCell>
                          </>
                        ) : (
                          /*
                            A linha inviável fica na tabela com o motivo:
                            esconder a combinação que estoura 100% apagaria
                            justamente onde a conta deixa de fechar.
                          */
                          <TableComponents.TableCell colSpan={6} className="text-red-900">
                            <span className="flex items-start gap-2 text-xs">
                              <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

                              {scenario.reason}
                            </span>
                          </TableComponents.TableCell>
                        )}
                      </TableComponents.TableRow>
                    ))}
                  </tbody>
                </TableComponents.Table>
              </div>

              <p className="mt-4 text-xs text-gray-400">
                A <strong>margem obtida</strong> pode ficar alguns centésimos
                abaixo da pedida: o preço é arredondado ao centavo, e a margem
                mostrada é a do preço real, não a da intenção.
              </p>

              <NotesPanel
                className="mt-6"
                title="Ressalvas deste cálculo"
                notes={data.caveats}
              />

              <NotesPanel
                className="mt-4"
                variant="info"
                title="Como ler estes cenários"
                notes={data.notes}
              />
            </>
          )}
        </ListFeedback>
      )}
    </>
  );
}
