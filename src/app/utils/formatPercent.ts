/**
 * `null` significa "não há contra o que comparar" — primeira compra do insumo.
 * Mostrar "0%" nesse caso seria inventar uma variação que não existe.
 */
export function formatPercent(value: number | null, fractionDigits = 2) {
  if (value === null) {
    return '—';
  }

  const formatted = new Intl.NumberFormat('pt-br', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value);

  return `${value > 0 ? '+' : ''}${formatted}%`;
}
