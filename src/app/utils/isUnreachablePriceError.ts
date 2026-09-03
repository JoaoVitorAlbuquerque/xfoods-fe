import axios from 'axios';

/**
 * 400 de combinação impossível: impostos + taxas + margem somam 100% ou mais.
 *
 * O caso tem explicação própria na tela, então a caixa de erro genérica não
 * deve aparecer junto — duas mensagens para o mesmo problema fazem parecer que
 * são dois problemas.
 */
export function isUnreachablePriceError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 400;
}
