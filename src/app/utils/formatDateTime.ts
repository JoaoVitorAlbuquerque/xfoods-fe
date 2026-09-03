export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('pt-br', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
