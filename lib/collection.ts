import type { Payment, State } from "./engine.ts";

export type CalendarMode = "month" | "week" | "day";
export type CollectionEntry = Payment & { at: string; principal: number };
export const dayKey = (value: string | Date) => new Date(value).toISOString().slice(0, 10);
export function shiftDay(value: string, days: number) {
  const result = new Date(value + "T12:00:00Z"); result.setUTCDate(result.getUTCDate() + days); return dayKey(result);
}
export function selectionRange(selected: string, mode: CalendarMode) {
  if (mode === "day") return { start: selected, end: shiftDay(selected, 1) };
  const d = new Date(selected + "T12:00:00Z");
  if (mode === "week") { const start = shiftDay(selected, -((d.getUTCDay() + 6) % 7)); return { start, end: shiftDay(start, 7) }; }
  return { start: selected.slice(0, 7) + "-01", end: dayKey(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))) };
}

export function collectionEntries(state: State): CollectionEntry[] {
  const paid = new Map<string, number>();
  return state.payments.map(p => ({ ...p, at: p.status === "approved" ? p.reviewedAt ?? p.declaredAt : p.declaredAt, principal: 0 }))
    .sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id))
    .map(p => {
      if (p.status !== "approved" || p.target !== "current") return p;
      const previous = paid.get(p.memberId) ?? 0;
      const principal = Math.min(p.amount, Math.max(0, state.period.baseAmount - previous));
      paid.set(p.memberId, previous + principal);
      return { ...p, principal };
    });
}
export function collectionSummary(entries: CollectionEntry[], start: string, end: string) {
  const rows = entries.filter(e => dayKey(e.at) >= start && dayKey(e.at) < end);
  return {
    rows: rows.slice().reverse(),
    collected: rows.reduce((sum, e) => sum + e.principal, 0),
    pending: rows.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0),
    contributors: new Set(rows.filter(e => e.principal > 0).map(e => e.memberId)).size,
    cumulative: entries.filter(e => dayKey(e.at) < end).reduce((sum, e) => sum + e.principal, 0),
    opening: entries.filter(e => dayKey(e.at) < start).reduce((sum, e) => sum + e.principal, 0),
  };
}
