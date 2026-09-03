import { httpClient } from "../httpClient";

/**
 * O mesmo `GET /products`, tipado apenas com os campos que a ficha técnica
 * usa. O tipo `Product` existente descreve o formulário de produto (com
 * `imagePath: File`), não a resposta da API — usá-lo aqui obrigaria a uma
 * conversão forçada.
 */
export interface ProductOption {
  id: string;
  name: string;
  price: number;
}

export async function getAllOptions() {
  const { data } = await httpClient.get<ProductOption[]>('/products');

  return data;
}
