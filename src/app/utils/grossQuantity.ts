/**
 * Quantidade bruta necessária para sobrar a líquida pedida.
 *
 * `wastePercent` é quanto se perde do que ENTRA no preparo, não um acréscimo
 * sobre o líquido: 200 g com 10% de perda exigem 200 ÷ 0,9 = 222,22 g — e não
 * 220 g. É a convenção de ficha técnica de cozinha (fator de correção), a
 * mesma que a API usa; calcular como `líquido × (1 + perda)` subestimaria toda
 * saída de estoque.
 */
export function grossQuantity(netQuantity: number, wastePercent: number) {
  if (!Number.isFinite(netQuantity) || netQuantity <= 0) {
    return null;
  }

  if (!Number.isFinite(wastePercent) || wastePercent < 0 || wastePercent >= 100) {
    return null;
  }

  if (wastePercent === 0) {
    return netQuantity;
  }

  return netQuantity / (1 - wastePercent / 100);
}
