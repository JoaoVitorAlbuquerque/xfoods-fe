export function formatQuantity(value: number, maximumFractionDigits = 4) {
  return new Intl.NumberFormat('pt-br', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}
