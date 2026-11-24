"use client";

import { cashBreakdown } from "./cash-visual";

const money = (n: number) => new Intl.NumberFormat("fr-TG").format(n);

export default function MoneyMiniature({ amount }: { amount: number }) {
  const value = Number.isSafeInteger(amount) && amount > 0 ? amount : 0;
  const notes = cashBreakdown(value);
  const remainder = value % 500;
  if (!value) return <span className="money-mini-zero" aria-label="Aucun billet : 0 franc CFA">Aucun billet</span>;
  const description = notes.map(n => `${n.count} billet${n.count > 1 ? "s" : ""} de ${money(n.value)} FCFA`).join(", ");
  return <span className="money-miniature" role="img" aria-label={`${money(value)} FCFA : ${description}${remainder ? `${notes.length ? ", " : ""}reste de ${money(remainder)} FCFA hors billets` : ""}`}>
    {notes.map(note => <span className="mini-denomination" key={note.value} aria-hidden="true">
      <span className="mini-note-frame">
        {Array.from({ length: Math.min(note.count, 3) }, (_, i) => <span key={i} className={`mini-banknote note-${note.value}`} style={{ left: 8 + i * 3, top: 12 - i * 2, zIndex: i + 1 }} />)}
        <b className="mini-note-count">{note.count}×</b>
      </span>
      <span className="mini-note-value">{money(note.value)}</span>
    </span>)}
    {remainder > 0 && <span className="mini-remainder">+ {money(remainder)} FCFA<small>hors billets</small></span>}
  </span>;
}
