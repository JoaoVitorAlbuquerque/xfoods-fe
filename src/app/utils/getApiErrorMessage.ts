import axios from 'axios';

/**
 * As mensagens de erro da API são escritas para serem lidas por humanos e
 * dizem o caminho da correção — exibi-las é melhor do que uma string genérica.
 * O `message` pode ser um array quando a validação do DTO recusa vários campos.
 */
export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message) && message.length > 0) {
    return message.join('\n');
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return fallback;
}
