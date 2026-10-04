// Small display helpers shared by components.

/** Years for one or more terms: "2025", "2025–2026", "2025–now", or "2025, 2026". */
export function termYears(terms: { start: Date; end: Date | null }[]): string {
  return terms.map((t) => yearRange(t.start, t.end)).join(", ")
}

/** "2025", "2025–2026" or "2025–now". */
export function yearRange(start: Date, end: Date | null): string {
  const a = start.getUTCFullYear()
  if (end === null) return `${a}–now`
  const b = end.getUTCFullYear()
  return a === b ? String(a) : `${a}–${b}`
}
