import toast from 'react-hot-toast';

import { getApiErrorMessage } from './getApiErrorMessage';

/**
 * `whitespace-pre-line` porque a validação do DTO devolve várias mensagens e
 * elas ficam ilegíveis emendadas numa linha só.
 */
export function toastApiError(error: unknown, fallback: string) {
  toast.error(getApiErrorMessage(error, fallback), {
    className: 'whitespace-pre-line',
  });
}
