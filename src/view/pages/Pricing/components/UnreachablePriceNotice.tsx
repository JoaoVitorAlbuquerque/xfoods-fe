import { Link } from "react-router-dom";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { getApiErrorMessage } from "../../../../app/utils/getApiErrorMessage";
import { isUnreachablePriceError } from "../../../../app/utils/isUnreachablePriceError";

interface UnreachablePriceNoticeProps {
  error: unknown;
}

/**
 * 400 de combinação impossível: impostos + taxas + margem somam 100% ou mais.
 *
 * A mensagem da API explica por que nenhum preço resolve o caso, e a tela
 * acrescenta os dois lugares onde isso se conserta — a configuração gravada ou
 * os percentuais desta consulta.
 */
export function UnreachablePriceNotice({ error }: UnreachablePriceNoticeProps) {
  if (!isUnreachablePriceError(error)) {
    return null;
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-2 text-red-900">
        <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

        <div>
          <strong className="block text-sm">
            Não é possível calcular o preço
          </strong>

          <p className="mt-2 whitespace-pre-line text-xs">
            {getApiErrorMessage(error, 'Percentuais somam 100% ou mais.')}
          </p>

          <p className="mt-3 text-xs">
            Reduza a margem ou as taxas no canal escolhido acima, ou ajuste a{' '}
            <Link to="/settings/pricing" className="font-bold underline">
              configuração de preços
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
