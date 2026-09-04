import { Ingredient } from './Ingredient';

/**
 * O produto como `GET /products` e `GET /products/:categoryId/categories`
 * devolvem.
 *
 * O tipo `Product` já existente descreve o **formulário** de cadastro
 * (`imagePath: File`, `price: string`, `category: string`), não a resposta da
 * API — usá-lo aqui obrigaria a conversões forçadas em toda a tela de pedido.
 */
export interface MenuProduct {
  id: string;
  name: string;
  description: string | null;
  imagePath: string | null;
  /** Decimal já serializado como número pelo interceptor da API. */
  price: number;
  category: {
    id: string;
    name: string;
    icon: string;
  } | null;
  ingredients: { ingredient: Ingredient }[];
}
