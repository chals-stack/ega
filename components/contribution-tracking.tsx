"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowsClockwise, CalendarBlank, ChartBar, UsersThree, Wallet } from "@phosphor-icons/react";
import type { State } from "@/lib/engine";
import { memberSummary } from "@/lib/engine";
import { cashBreakdown } from "@/components/cash-visual";
import { collectionEntries, dayKey, shiftDay } from "@/lib/collection";
import MoneyMiniature from "@/components/money-miniature";

const money = (amount: number) => new Intl.NumberFormat("fr-TG").format(amount);
const shortDay = (value: string) => new Intl.DateTimeFormat("fr-TG", { day: "numeric", month: "short", timeZone: "Africa/Lome" }).format(new Date(value + "T12:00:00Z"));

type Point = { id: string; label: string; amount: number; detail?: string };

function VerticalMoneyPoint({ point, max, compact = false }: { point: Point; max: number; compact?: boolean }) {
  const notes = cashBreakdown(point.amount);
  const ratio = max > 0 ? point.amount / max : 0;
  const level = point.amount > 0 ? Math.max(18, Math.round(ratio * 100)) : 4;
  const description = notes.map(note => `${note.count} billet${note.count > 1 ? "s" : ""} de ${money(note.value)} FCFA`).join(", ");
  return <article className={`tracking-point ${compact ? "is-compact" : ""}`} aria-label={`${point.label} : ${money(point.amount)} FCFA${description ? `, ${description}` : ""}`}>
    <div className="tracking-plot">
      <span className="tracking-guide" style={{ height: `${level}%` }} />
      <div className="tracking-money-position" style={{ bottom: `${level}%` }}>
        {point.amount > 0 ? <span className="tracking-note-group" aria-hidden="true">
          {notes.map((note, index) => <span className="tracking-note-denom" key={note.value} style={{ zIndex: index + 1 }}>
            <i className={`tracking-banknote note-${note.value}`} />
            <b>{note.count}×</b>
          </span>)}
        </span> : <span className="tracking-zero" aria-hidden="true" />}
        <strong>{money(point.amount)}<small> FCFA</small></strong>
      </div>
    </div>
    <span className="tracking-label">{point.label}</span>
    {point.detail && <small className="tracking-detail">{point.detail}</small>}
  </article>;
}

function MoneyGraph({ title, eyebrow, icon, points, compact = false }: { title: string; eyebrow: string; icon: ReactNode; points: Point[]; compact?: boolean }) {
  const max = Math.max(1, ...points.map(point => point.amount));
  return <section className={`money-graph ${compact ? "money-graph-compact" : ""}`}>
    <header><span className="money-graph-icon">{icon}</span><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div></header>
    <div className="money-graph-scale" aria-hidden="true"><span>{money(max)}</span><span>{money(Math.round(max / 2))}</span><span>0</span></div>
    <div className="money-graph-scroll"><div className="money-graph-points">{points.map(point => <VerticalMoneyPoint key={point.id} point={point} max={max} compact={compact} />)}</div></div>
  </section>;
}

export default function ContributionTracking({ state }: { state: State }) {
  const [range, setRange] = useState<"cycle" | "7days">("cycle");
  const entries = useMemo(() => collectionEntries(state), [state]);
  const today = dayKey(state.now);
  const start = range === "cycle" ? dayKey(state.period.opensAt) : shiftDay(today, -6);
  const days = useMemo(() => {
    const result: string[] = [];
    for (let value = start; value <= today; value = shiftDay(value, 1)) result.push(value);
    return result;
  }, [start, today]);
  const approved = entries.filter(entry => entry.status === "approved" && entry.principal > 0);
  let running = approved.filter(entry => dayKey(entry.at) < start).reduce((sum, entry) => sum + entry.principal, 0);
  const cumulative: Point[] = days.map(day => {
    const amount = approved.filter(entry => dayKey(entry.at) === day).reduce((sum, entry) => sum + entry.principal, 0);
    running += amount;
    return { id: `c-${day}`, label: shortDay(day), amount: running, detail: amount > 0 ? `+ ${money(amount)}` : "Stable" };
  });
  const daily: Point[] = days.map(day => {
    const rows = approved.filter(entry => dayKey(entry.at) === day);
    return { id: `d-${day}`, label: shortDay(day), amount: rows.reduce((sum, entry) => sum + entry.principal, 0), detail: `${new Set(rows.map(row => row.memberId)).size} cotisant${new Set(rows.map(row => row.memberId)).size > 1 ? "s" : ""}` };
  });
  const members: Point[] = state.members.map(member => {
    const summary = memberSummary(state, member.id);
    return { id: member.id, label: member.name.split(" ")[0], amount: summary.principalPaid, detail: summary.principalPaid >= state.period.baseAmount ? "À jour" : `${Math.round(summary.principalPaid / state.period.baseAmount * 100)} %` };
  });
  const total = cumulative.at(-1)?.amount ?? 0;
  const bestDay = daily.reduce((best, point) => point.amount > best.amount ? point : best, daily[0] ?? { id: "none", label: "-", amount: 0 });
  const paidMembers = members.filter(member => member.amount >= state.period.baseAmount).length;

  return <section className="tracking-section" aria-label="Suivi visuel des cotisations">
    <div className="tracking-toolbar"><div><span className="eyebrow">ARGENT VISIBLE, PROGRESSION LISIBLE</span><h2>La cotisation prend de la hauteur.</h2><p>Chaque billet représente le registre validé. Les piles évoluent automatiquement dès qu’une cotisation est approuvée.</p></div><div className="tracking-range" role="group" aria-label="Période de suivi"><button className={range === "cycle" ? "selected" : ""} aria-pressed={range === "cycle"} onClick={() => setRange("cycle")}>Cycle actuel</button><button className={range === "7days" ? "selected" : ""} aria-pressed={range === "7days"} onClick={() => setRange("7days")}>7 derniers jours</button></div></div>
    <div className="tracking-live"><ArrowsClockwise size={18} weight="bold" /><strong>Suivi automatique</strong><span>Mis à jour avec le registre de Lomé</span></div>
    <div className="tracking-kpis"><article><Wallet size={22} /><span>Cagnotte validée</span><strong>{money(total)} <small>FCFA</small></strong><MoneyMiniature amount={total} /></article><article><CalendarBlank size={22} /><span>Meilleure journée</span><strong>{money(bestDay.amount)} <small>FCFA</small></strong><small>{bestDay.label}</small></article><article><UsersThree size={22} /><span>Membres à jour</span><strong>{paidMembers}<small> / {state.members.length}</small></strong></article></div>
    <MoneyGraph title="La cagnotte au fil des validations" eyebrow="CUMUL DU CYCLE" icon={<Wallet size={24} weight="duotone" />} points={cumulative} />
    <div className="tracking-secondary"><MoneyGraph title="Ce qui entre chaque jour" eyebrow="RYTHME DES COTISATIONS" icon={<CalendarBlank size={23} weight="duotone" />} points={daily} compact /><MoneyGraph title="La part de chaque membre" eyebrow="PROGRESSION INDIVIDUELLE" icon={<ChartBar size={23} weight="duotone" />} points={members} compact /></div>
    <p className="tracking-footnote">Lecture : la position verticale traduit le montant. Les billets et leurs compteurs indiquent le billetage exact. Les déclarations en attente, pénalités et arriérés restent hors de la cagnotte validée.</p>
  </section>;
}
