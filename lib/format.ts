// lib/format.ts
// Formatos deterministas para que SSR y cliente generen el MISMO texto.

const DATE_FMT_GT = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'short',
  timeZone: 'America/Guatemala',
});

const MONTH_SHORT_FMT_GT = new Intl.DateTimeFormat('es-GT', {
  month: 'short',
  timeZone: 'America/Guatemala',
});

const NUM_FMT_GT = new Intl.NumberFormat('es-GT');

export function fmtDateGT(d: Date | string | number) {
  const date = d instanceof Date ? d : new Date(d);
  return DATE_FMT_GT.format(date);
}

export function fmtMonthShortGT(d: Date | string | number) {
  const date = d instanceof Date ? d : new Date(d);
  return MONTH_SHORT_FMT_GT.format(date);
}

export function fmtNumberGT(n: number | null | undefined) {
  return NUM_FMT_GT.format(n ?? 0);
}

// Para atributos data-* (no usar toLocale*). ISO estable YYYY-MM-DD (UTC).
export function toISODateUTC(d: Date | string | number) {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
