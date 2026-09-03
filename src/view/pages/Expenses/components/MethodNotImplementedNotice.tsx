import { Link } from "react-router-dom";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import axios from "axios";

import { getApiErrorMessage } from "../../../../app/utils/getApiErrorMessage";

interface MethodNotImplementedNoticeProps {
  error: unknown;
}

/**
 * 501 significa "método configurado mas não implementado". A mensagem da API
 * diz exatamente o que falta; a tela acrescenta o caminho para a configuração,
 * que é onde o problema se resolve.
 */
export function MethodNotImplementedNotice({ error }: MethodNotImplementedNoticeProps) {
  if (!axios.isAxiosError(error) || error.response?.status !== 501) {
    return null;
  }

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <div className="flex items-start gap-2 text-yellow-900">
        <ExclamationTriangleIcon className="mt-0.5 shrink-0" />

        <div>
          <strong className="block text-sm">
            O método de rateio configurado ainda não calcula
          </strong>

          <p className="mt-2 whitespace-pre-line text-xs">
            {getApiErrorMessage(error, 'Método de rateio não implementado.')}
          </p>

          <p className="mt-3 text-xs">
            Só <strong>Por unidade vendida</strong> está implementado. Troque o
            método em{' '}
            <Link to="/settings/allocation" className="font-bold underline">
              Configurações › Rateio
            </Link>{' '}
            para ver este relatório.
          </p>
        </div>
      </div>
    </div>
  );
}
