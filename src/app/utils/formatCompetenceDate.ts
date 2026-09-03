/**
 * Datas de competência são **data pura em UTC**. Passá-las por `new Date()` e
 * formatar no fuso local transformaria 01/09 em 31/08 no Brasil — por isso a
 * formatação corta a string em vez de converter.
 *
 * Vale para `startDate`, `endDate`, `competenceDate` e `period.from` / `.to`.
 */
export function formatCompetenceDate(value: string | null | undefined) {
  if (!value) {
    return '—';
  }

  const [year, month, day] = value.slice(0, 10).split('-');

  if (!year || !month || !day) {
    return '—';
  }

  return `${day}/${month}/${year}`;
}

/** Só o trecho `YYYY-MM-DD`, que é o formato aceito pelo `<input type="date">`. */
export function toCompetenceInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : '';
}
