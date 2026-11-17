"use client";

import { useMemo, useState } from "react";
import { CalendarBlank, CaretLeft, CaretRight, DownloadSimple, Wallet, UsersThree, Clock, ArrowUpRight } from "@phosphor-icons/react";
import type { State } from "@/lib/engine";
import { collectionEntries, collectionSummary, dayKey, selectionRange, shiftDay, type CalendarMode } from "@/lib/collection";
import CashVisual from "./cash-visual";
import MoneyMiniature from "./money-miniature";

const money = (n: number) => new Intl.NumberFormat("fr-TG").format(n);
const longDate = (s: string) => new Intl.DateTimeFormat("fr-TG", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lome" }).format(new Date(s + "T12:00:00Z"));
export default function CollectionCalendar({ state }: { state: State }) {
  const [selected, setSelected] = useState(dayKey(state.now));
  const [mode, setMode] = useState<CalendarMode>("month");
  const [status, setStatus] = useState("all");
  const entries = useMemo(() => collectionEntries(state), [state]);
  const range = selectionRange(selected, mode);
  const summary = collectionSummary(entries, range.start, range.end);
  const month = selectionRange(selected, "month");
  const d = new Date(month.start + "T12:00:00Z");
  const offset = (d.getUTCDay() + 6) % 7;
  const days = new Date(new Date(month.end).getTime() - 86400000).getUTCDate();
  const cells = Math.ceil((offset + days) / 7) * 7;
  const rows = summary.rows.filter(p => status === "all" || p.status === status);
  const monthLabel = new Intl.DateTimeFormat("fr-TG", { month: "long", year: "numeric", timeZone: "Africa/Lome" }).format(d);
  const title = mode === "month" ? monthLabel : mode === "day" ? longDate(selected) : `${longDate(range.start)} au ${longDate(shiftDay(range.end, -1))}`;
  function move(direction: number) {
    setSelected(mode === "month" ? dayKey(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + direction, 1))) : shiftDay(selected, direction * (mode === "week" ? 7 : 1)));
  }
  function exportRange() {
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = "\uFEFF" + [["Date (Lomé)", "Membre", "Montant FCFA", "Principal dans la caisse FCFA", "Statut", "Moyen"], ...rows.map(p => [p.at, state.members.find(m => m.id === p.memberId)?.name ?? "Membre", p.amount, p.principal, p.status === "approved" ? "Validée" : p.status === "pending" ? "À vérifier" : "Rejetée", p.method])].map(row => row.map(escape).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `EGA-${range.start}-${shiftDay(range.end, -1)}.csv`; link.click(); URL.revokeObjectURL(url);
  }
  return <section className="collection-section" aria-label="Calendrier des cotisations">
    <div className="section-heading"><div><h2>Chaque jour, on avance.</h2><p>Les cotisations du registre, à la date de leur validation. Horaires de Lomé, UTC+0.</p></div><button className="button button-white calendar-export" onClick={exportRange}><DownloadSimple size={20} />Exporter la sélection</button></div>
    <div className="calendar-toolbar"><div className="calendar-modes" role="group" aria-label="Échelle du suivi">{([{id:"month",label:"Mensuel"},{id:"week",label:"Hebdomadaire"},{id:"day",label:"Journalier"}] as const).map(item => <button key={item.id} aria-pressed={mode === item.id} className={mode === item.id ? "selected" : ""} onClick={() => setMode(item.id)}>{item.label}</button>)}</div><label className="calendar-date-picker"><CalendarBlank size={21} /><span>Choisir une date</span><input type="date" aria-label="Choisir une date de suivi" value={selected} onChange={e => { if (e.target.value) setSelected(e.target.value); }} /></label></div>
    <div className="calendar-summary" aria-live="polite"><article><Wallet size={22} /><span>Collecté sur la période</span><strong>{money(summary.collected)} <small>FCFA</small></strong><MoneyMiniature amount={summary.collected} /></article><article><UsersThree size={22} /><span>Membres ayant cotisé</span><strong>{summary.contributors}<small> / {state.members.length}</small></strong></article><article><Clock size={22} /><span>À vérifier sur la période</span><strong>{money(summary.pending)} <small>FCFA</small></strong><MoneyMiniature amount={summary.pending} /></article></div>
    <div className="calendar-layout"><section className="calendar-card"><div className="calendar-heading"><button className="icon-button" aria-label="Période précédente" onClick={() => move(-1)}><CaretLeft size={21} /></button><h3>{monthLabel}</h3><button className="icon-button" aria-label="Période suivante" onClick={() => move(1)}><CaretRight size={21} /></button></div><div className="calendar-weekdays" aria-hidden="true">{["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-days">
      {Array.from({length:cells}, (_, index) => {
        const key = shiftDay(month.start, index - offset);
        if (key < month.start || key >= month.end) return <span key={key} className="calendar-blank" />;
        const dayRows = entries.filter(e => dayKey(e.at) === key);
        const amount = dayRows.reduce((sum, e) => sum + e.principal, 0);
        const pending = dayRows.some(e => e.status === "pending");
        const active = mode === "month" ? key === selected : key >= range.start && key < range.end;
        return <button key={key} className={`calendar-day ${active ? "is-selected" : ""} ${amount ? "has-payment" : ""}`} aria-pressed={active} aria-label={`${longDate(key)}, ${money(amount)} FCFA validés${pending ? ", déclaration à vérifier" : ""}`} onClick={() => { setSelected(key); setMode("day"); }}><span>{Number(key.slice(-2))}</span>{amount > 0 && <small>{money(amount)}</small>}{!amount && pending && <small>À vérifier</small>}</button>;
      })}
    </div><div className="calendar-caption"><span>Montants validés en FCFA</span><button className="text-button" onClick={() => { setSelected(dayKey(state.now)); setMode("month"); }}>Dernière activité <ArrowUpRight size={16} /></button></div><div className="calendar-window"><CalendarBlank size={22} /><p><strong>Collecte de {state.period.label}</strong><span>Du {longDate(dayKey(state.period.opensAt))} au {longDate(shiftDay(dayKey(state.period.closesAt), -1))}.</span></p></div></section>
    <section className="calendar-cash"><div className="bowl-top"><span className="eyebrow">LA CAGNOTTE À CETTE DATE</span><Wallet size={24} /></div><p className="calendar-cash-date">Au {longDate(shiftDay(range.end, -1))}</p><CashVisual amount={summary.cumulative} /><div className="cash-total"><small>PRINCIPAL CUMULÉ VALIDÉ</small><strong>{money(summary.cumulative)} <span>FCFA</span></strong><p>{money(summary.opening)} FCFA avant la période + {money(summary.collected)} FCFA collectés</p></div><p className="calendar-footnote">Liasses de 10 billets. Les arriérés et majorations sont suivis séparément. Ce cumul représente les cotisations, avant tout versement à un bénéficiaire.</p></section></div>
    <section className="calendar-register"><div className="section-heading"><div><h2>{title}</h2><p>{rows.length} mouvement{rows.length > 1 ? "s" : ""} dans la sélection</p></div><label>Afficher<select aria-label="Filtrer les mouvements du calendrier" value={status} onChange={e => setStatus(e.target.value)}><option value="all">Tous les statuts</option><option value="approved">Validées</option><option value="pending">À vérifier</option><option value="rejected">Rejetées</option></select></label></div>
    {rows.length ? <div className="calendar-entries">{rows.map(p => { const member = state.members.find(m => m.id === p.memberId); return <article className="calendar-entry" key={p.id}><img src={`/images/members/${p.memberId}.png`} alt="" /><div><strong>{member?.name ?? "Membre"}</strong><span>{new Intl.DateTimeFormat("fr-TG", {day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Africa/Lome"}).format(new Date(p.at))} · {p.method}</span>{p.target === "arrears" && <small>Régularisation d’arriéré, hors cagnotte du cycle</small>}</div><span className="amount-with-notes calendar-entry-money"><strong>{money(p.amount)} <small>FCFA</small></strong><MoneyMiniature amount={p.amount} /></span><span className={`status ${p.status === "approved" ? "paid" : p.status === "pending" ? "pending" : "late"}`}>{p.status === "approved" ? "Validée" : p.status === "pending" ? "À vérifier" : "Rejetée"}</span></article>; })}</div> : <div className="empty-state"><CalendarBlank size={32} /><h3>Aucun mouvement sur cette période</h3><p>Choisissez un autre jour, une autre semaine ou un autre mois.</p></div>}
    </section>
  </section>;
}
