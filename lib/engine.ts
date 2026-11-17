/** Pure, dependency-free demo ledger. Amounts are integer XOF. All mutations return a new State. */
export type Role = "admin" | "treasurer" | "member";
export type Member = { id: string; name: string; initials: string; role: Role; color: string };
export type Period = { id: string; label: string; opensAt: string; closesAt: string; baseAmount: number; target: number };
export type Payment = {
  id: string; memberId: string; amount: number; method: string; reference: string;
  proofName?: string; target: "current" | "arrears";
  status: "pending" | "approved" | "rejected"; declaredAt: string;
  reviewedAt?: string; reviewedBy?: string; reason?: string;
};
export type Penalty = {
  id: string; memberId: string; sourcePeriodId: string; duePeriodId: string;
  amount: number; createdAt: string;
};
export type Arrear = { id: string; memberId: string; periodId: string; label: string; amount: number; paid: number };
export type Audit = { id: string; at: string; actorId: string; action: string; detail: string };
export type State = {
  members: Member[]; payments: Payment[]; penalties: Penalty[]; arrears: Arrear[];
  period: Period; audit: Audit[]; now: string; closed: boolean;
};

const DEMO_NOW = "2026-12-05T10:32:00.000Z";
export const LATE_FEE = 1_500;
const money = (amount: number) => new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
const clone = (state: State): State => JSON.parse(JSON.stringify(state)) as State;
const nextId = (state: State, prefix: string) => `${prefix}-${state.payments.length}-${state.audit.length}-${state.penalties.length}`;
const assertMember = (state: State, id: string) => {
  const member = state.members.find((item) => item.id === id);
  if (!member) throw new Error("Membre introuvable.");
  return member;
};
const financeActor = (state: State, id: string) => {
  const actor = assertMember(state, id);
  if (actor.role !== "treasurer" && actor.role !== "admin") throw new Error("Cette action est réservée au trésorier ou à l’administratrice.");
  return actor;
};
function log(state: State, actorId: string, action: string, detail: string) {
  state.audit.unshift({ id: nextId(state, "audit"), at: state.now, actorId, action, detail });
}

/** Lomé uses UTC: open on day 30 (February's final day), close on next month's 8th, exclusive. month is 1-based. */
export function makePeriod(year: number, month: number, memberCount = 10, baseAmount = 25_000): Period {
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year)) throw new Error("Période invalide.");
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const opensAt = new Date(Date.UTC(year, month - 1, Math.min(30, lastDay))).toISOString();
  const closesAt = new Date(Date.UTC(year, month, 8)).toISOString();
  const label = new Intl.DateTimeFormat("fr-TG", { month: "long", year: "numeric", timeZone: "Africa/Lome" }).format(new Date(opensAt));
  return { id: `${year}-${String(month).padStart(2, "0")}`, label, opensAt, closesAt, baseAmount, target: memberCount * baseAmount };
}

export function createDemoState(): State {
  const members: Member[] = [
    { id: "a1", name: "Afi Mensah", initials: "AM", role: "admin", color: "#e6b99c" },
    { id: "m2", name: "Koffi Agbeko", initials: "KA", role: "treasurer", color: "#a7c4b5" },
    { id: "a3", name: "Akouvi Lawson", initials: "AL", role: "member", color: "#d2b2d0" },
    { id: "m4", name: "Komlan Amouzou", initials: "KA", role: "member", color: "#b5bfd8" },
    { id: "i5", name: "Sena Akakpo", initials: "SA", role: "member", color: "#d9c497" },
    { id: "m6", name: "Yawa Adom", initials: "YA", role: "member", color: "#b6cec7" },
    { id: "f7", name: "Ama Dossou", initials: "AD", role: "member", color: "#cbb4e5" },
    { id: "i8", name: "Kodjo Kossi", initials: "KK", role: "member", color: "#d9b4a9" },
    { id: "k9", name: "Dédé Amegah", initials: "DA", role: "member", color: "#b9d6c8" },
    { id: "y10", name: "Yao Adjovi", initials: "YA", role: "member", color: "#c3c7dd" },
  ];
  const payments: Payment[] = members.slice(0, 8).map((member, i) => ({
    id: `seed-${member.id}`, memberId: member.id, amount: i < 6 ? 25_000 : i === 6 ? 15_000 : 10_000,
    method: i % 2 ? "Moov Money Flooz" : "Mixx by Yas", reference: `EGA-NOV-${1001 + i}`,
    target: "current", status: "approved", declaredAt: `2026-12-0${Math.min(i + 1, 4)}T08:00:00.000Z`,
    reviewedAt: `2026-12-0${Math.min(i + 1, 4)}T09:00:00.000Z`, reviewedBy: "m2",
  }));
  payments.push({ id: "seed-k9", memberId: "k9", amount: 25_000, method: "Mixx by Yas", reference: "MIXX-771294", proofName: "recu-kadiatou.jpg", target: "current", status: "pending", declaredAt: "2026-12-05T09:10:00.000Z" });
  return {
    members, payments, period: makePeriod(2026, 11), now: DEMO_NOW, closed: false,
    penalties: [{ id: "penalty-oct-y10", memberId: "y10", sourcePeriodId: "2026-10", duePeriodId: "2026-11", amount: LATE_FEE, createdAt: "2026-11-08T00:00:00.000Z" }],
    arrears: [{ id: "arrear-oct-y10", memberId: "y10", periodId: "2026-10", label: "octobre 2026", amount: 25_000, paid: 0 }],
    audit: [
      { id: "audit-seed-1", at: "2026-12-05T09:10:00.000Z", actorId: "k9", action: "Cotisation déclarée", detail: "Dédé Amegah · 25 000 FCFA · en attente de validation" },
      { id: "audit-seed-2", at: "2026-12-04T09:00:00.000Z", actorId: "m2", action: "Cotisation validée", detail: "Ama Dossou · 15 000 FCFA" },
      { id: "audit-seed-3", at: "2026-11-30T00:00:00.000Z", actorId: "a1", action: "Période ouverte", detail: "Novembre 2026 · clôture le 7 décembre à 23 h 59 (Lomé)" },
    ],
  };
}

/** Current principal and penalties stay separate. arrearsDue excludes the displayed current period to avoid double counting. */
export function memberSummary(state: State, memberId: string) {
  assertMember(state, memberId);
  const current = state.payments.filter((p) => p.memberId === memberId && p.target === "current");
  const approved = current.filter((p) => p.status === "approved").reduce((sum, p) => sum + p.amount, 0);
  const pending = current.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const penaltyTotal = state.penalties.filter((p) => p.memberId === memberId && p.duePeriodId === state.period.id).reduce((sum, p) => sum + p.amount, 0);
  const principalPaid = Math.min(state.period.baseAmount, approved);
  const principalDue = state.period.baseAmount - principalPaid;
  const penaltyPaid = Math.min(penaltyTotal, Math.max(0, approved - state.period.baseAmount));
  const penaltyDue = penaltyTotal - penaltyPaid;
  const penaltyNext = state.penalties.filter((p) => p.memberId === memberId && p.sourcePeriodId === state.period.id && p.duePeriodId !== state.period.id).reduce((sum, p) => sum + p.amount, 0);
  const remaining = principalDue + penaltyDue;
  const arrearsDue = state.arrears.filter((a) => a.memberId === memberId && a.periodId !== state.period.id).reduce((sum, a) => sum + Math.max(0, a.amount - a.paid), 0);
  const arrearsPending = state.payments.filter((p) => p.memberId === memberId && p.target === "arrears" && p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const late = state.arrears.some((a) => a.memberId === memberId && a.paid < a.amount);
  const awaitingReview = state.closed && principalDue > 0 && timelyPending(state, memberId) >= principalDue;
  const status: "paid" | "pending" | "partial" | "unpaid" = remaining === 0 ? "paid" : pending > 0 ? "pending" : approved > 0 ? "partial" : "unpaid";
  return { principalPaid, principalDue, penaltyTotal, penaltyDue, penaltyPaid, penaltyNext, pending, approved, remaining, arrearsDue, arrearsPending, totalDue: remaining + arrearsDue, status, late, awaitingReview };
}

export function totals(state: State) {
  const summaries = state.members.map((member) => memberSummary(state, member.id));
  const approved = summaries.reduce((sum, s) => sum + s.principalPaid, 0);
  const pending = summaries.reduce((sum, s) => sum + Math.min(s.principalDue, s.pending), 0);
  return {
    target: state.period.target, approved, pending, remaining: Math.max(0, state.period.target - approved),
    progress: Math.round(approved / state.period.target * 100),
    penaltiesDue: summaries.reduce((sum, s) => sum + s.penaltyDue, 0),
    arrearsDue: summaries.reduce((sum, s) => sum + s.arrearsDue, 0),
    paidCount: summaries.filter((s) => s.remaining === 0).length,
    pendingCount: summaries.filter((s) => s.pending > 0).length,
    lateCount: summaries.filter((s) => s.late).length,
  };
}

function timelyPending(state: State, memberId: string) {
  return state.payments.filter((p) => p.memberId === memberId && p.target === "current" && p.status === "pending" && p.declaredAt < state.period.closesAt).reduce((sum, p) => sum + p.amount, 0);
}

/** Reconciles confirmed default once per member/period; pending sufficient principal defers the decision. */
function assessDefault(state: State, memberId: string) {
  if (!state.closed) return;
  const summary = memberSummary(state, memberId);
  const arrear = state.arrears.find((a) => a.memberId === memberId && a.periodId === state.period.id);
  if (arrear) { arrear.paid = summary.principalPaid; return; }
  const timelyApproved = state.payments.filter((p) => p.memberId === memberId && p.target === "current" && p.status === "approved" && p.declaredAt < state.period.closesAt).reduce((sum, p) => sum + p.amount, 0);
  if (timelyApproved + timelyPending(state, memberId) >= state.period.baseAmount) return;
  state.arrears.push({ id: `arrear-${state.period.id}-${memberId}`, memberId, periodId: state.period.id, label: state.period.label, amount: state.period.baseAmount, paid: summary.principalPaid });
  if (!state.penalties.some((p) => p.memberId === memberId && p.sourcePeriodId === state.period.id)) {
    const [year, month] = state.period.id.split("-").map(Number);
    const next = makePeriod(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, state.members.length, state.period.baseAmount);
    state.penalties.push({ id: `penalty-${state.period.id}-${memberId}`, memberId, sourcePeriodId: state.period.id, duePeriodId: next.id, amount: LATE_FEE, createdAt: state.period.closesAt });
    log(state, "system", "Retard confirmé", `${assertMember(state, memberId).name} · pénalité forfaitaire unique de ${money(LATE_FEE)} sur ${next.label}`);
  }
}

export type DeclareInput = { memberId: string; amount: number; method: string; reference: string; proofName?: string; target?: "current" | "arrears" };
/** Caller identifies the member; UI binds memberId to the selected demo identity. Declarations never increase confirmed totals. */
export function declarePayment(state: State, input: DeclareInput): State {
  const member = assertMember(state, input.memberId);
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) throw new Error("Saisissez un montant entier positif en FCFA.");
  if (!input.method.trim() || !input.reference.trim()) throw new Error("La méthode et la référence sont obligatoires.");
  if (state.now < state.period.opensAt && (input.target ?? "current") === "current") throw new Error("La période de cotisation n’est pas encore ouverte.");
  const summary = memberSummary(state, input.memberId);
  const target = input.target ?? "current";
  const available = target === "current" ? summary.remaining - summary.pending : summary.arrearsDue - summary.arrearsPending;
  if (input.amount > available) throw new Error(`Le montant disponible à déclarer est de ${money(Math.max(0, available))}.`);
  if (state.payments.some((p) => p.memberId === input.memberId && p.reference.toLowerCase() === input.reference.trim().toLowerCase() && p.status !== "rejected")) throw new Error("Cette référence a déjà été utilisée.");
  const next = clone(state);
  next.payments.push({ id: nextId(next, "payment"), memberId: input.memberId, amount: input.amount, method: input.method.trim(), reference: input.reference.trim(), proofName: input.proofName, target, status: "pending", declaredAt: state.now });
  log(next, member.id, "Cotisation déclarée", `${member.name} · ${money(input.amount)} · ${target === "arrears" ? "régularisation d’arriéré" : "en attente de validation"}`);
  return next;
}

export function reviewPayment(state: State, id: string, approve: boolean, actorId: string, reason?: string): State {
  financeActor(state, actorId);
  const existing = state.payments.find((p) => p.id === id);
  if (!existing) throw new Error("Paiement introuvable.");
  if (existing.status !== "pending") throw new Error("Ce paiement a déjà été traité.");
  if (!approve && !reason?.trim()) throw new Error("Un motif est obligatoire pour rejeter une cotisation.");
  const next = clone(state);
  const payment = next.payments.find((p) => p.id === id)!;
  payment.status = approve ? "approved" : "rejected";
  payment.reviewedAt = next.now;
  payment.reviewedBy = actorId;
  payment.reason = approve ? undefined : reason!.trim();
  if (approve && payment.target === "arrears") {
    let remaining = payment.amount;
    for (const debt of next.arrears.filter((a) => a.memberId === payment.memberId && a.periodId !== next.period.id).sort((a, b) => a.periodId.localeCompare(b.periodId))) {
      const applied = Math.min(remaining, debt.amount - debt.paid);
      debt.paid += applied; remaining -= applied;
    }
  }
  log(next, actorId, approve ? "Cotisation validée" : "Cotisation rejetée", `${assertMember(next, payment.memberId).name} · ${money(payment.amount)}${approve ? "" : ` · ${reason!.trim()}`}`);
  assessDefault(next, payment.memberId);
  return next;
}

/** Explicit demo clock jump to December 8; idempotent, with one assessment per obligation. */
export function closePeriod(state: State, actorId: string): State {
  financeActor(state, actorId);
  if (state.closed) return state;
  const next = clone(state);
  next.closed = true;
  next.now = next.period.closesAt;
  const closeLabel = new Intl.DateTimeFormat("fr-TG", { day: "numeric", month: "long", timeZone: "Africa/Lome" }).format(new Date(next.now));
  log(next, actorId, "Clôture simulée", `${next.period.label} · passage au ${closeLabel} · vérification des retards`);
  for (const member of next.members) assessDefault(next, member.id);
  return next;
}

/** Reset is intentionally a fresh seed, without mutating the previous state. */
export const resetDemo = createDemoState;

/** Updates locally persisted records created before the 1,500 FCFA flat late-fee policy. */
export function migratePenaltyPolicy(state: State): State {
  const next = clone(state);
  next.penalties = next.penalties.map((penalty) => ({ ...penalty, amount: LATE_FEE }));
  return next;
}
