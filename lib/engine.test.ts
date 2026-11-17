import { test } from "node:test";
import assert from "node:assert/strict";
import { createDemoState, totals, memberSummary, declarePayment, reviewPayment, closePeriod, makePeriod, migratePenaltyPolicy } from "./engine.ts";

test("seed totals, principal, penalties and arrears stay separate", () => {
  const state = createDemoState();
  assert.equal(totals(state).approved, 175_000);
  assert.equal(totals(state).target, 250_000);
  assert.equal(totals(state).progress, 70);
  assert.equal(totals(state).pending, 25_000);
  assert.equal(totals(state).penaltiesDue, 1_500);
  assert.equal(totals(state).arrearsDue, 25_000);
  assert.equal(memberSummary(state, "y10").totalDue, 51_500);
  assert.equal(memberSummary(state, "y10").late, true);
});

test("Ama declares then treasurer approves; repeated review cannot double totals", () => {
  const initial = createDemoState();
  let state = declarePayment(initial, { memberId: "f7", amount: 10_000, method: "Wave", reference: "FATOU-2" });
  const id = state.payments.at(-1)!.id;
  assert.equal(totals(state).approved, 175_000);
  assert.equal(totals(state).pending, 35_000);
  state = reviewPayment(state, id, true, "m2");
  assert.equal(totals(state).approved, 185_000);
  assert.equal(totals(state).progress, 74);
  assert.equal(memberSummary(state, "f7").status, "paid");
  assert.throws(() => reviewPayment(state, id, true, "m2"));
  assert.equal(totals(initial).approved, 175_000, "input remains immutable");
  state = reviewPayment(state, "seed-k9", true, "m2");
  assert.equal(totals(state).approved, 210_000);
  assert.equal(totals(state).remaining, 40_000);
});

test("validates roles, amount, reference, rejection reason and pending reservation", () => {
  const state = createDemoState();
  assert.throws(() => reviewPayment(state, "seed-k9", true, "f7"));
  assert.throws(() => closePeriod(state, "f7"));
  assert.throws(() => declarePayment(state, { memberId: "f7", amount: 10_001, method: "Wave", reference: "A" }));
  assert.throws(() => declarePayment(state, { memberId: "f7", amount: 0.5, method: "Wave", reference: "A" }));
  assert.throws(() => declarePayment(state, { memberId: "k9", amount: 1, method: "Wave", reference: "A" }));
  assert.throws(() => reviewPayment(state, "seed-k9", false, "m2", " "));
  const rejected = reviewPayment(state, "seed-k9", false, "m2", "Référence illisible");
  assert.equal(totals(rejected).approved, 175_000);
  assert.equal(memberSummary(rejected, "k9").pending, 0);
});

test("Lome windows handle February, leap year, year rollover and exclusive close", () => {
  assert.equal(makePeriod(2027, 2).opensAt, "2027-02-28T00:00:00.000Z");
  assert.equal(makePeriod(2028, 2).opensAt, "2028-02-29T00:00:00.000Z");
  assert.equal(makePeriod(2026, 11).closesAt, "2026-12-08T00:00:00.000Z");
  assert.equal(makePeriod(2026, 12).closesAt, "2027-01-08T00:00:00.000Z");
});

test("close is idempotent, sufficient pending defers default, rejection confirms once", () => {
  const state = closePeriod(createDemoState(), "a1");
  assert.equal(state.now, "2026-12-08T00:00:00.000Z");
  assert.equal(memberSummary(state, "k9").awaitingReview, true);
  assert.equal(memberSummary(state, "k9").late, false);
  assert.equal(memberSummary(state, "f7").late, true);
  assert.equal(state.penalties.filter((p) => p.sourcePeriodId === "2026-11").length, 3);
  assert.deepEqual(closePeriod(state, "a1"), state);
  const rejected = reviewPayment(state, "seed-k9", false, "m2", "Paiement non reçu");
  assert.equal(memberSummary(rejected, "k9").late, true);
  assert.equal(rejected.penalties.filter((p) => p.memberId === "k9" && p.sourcePeriodId === "2026-11").length, 1);
  assert.equal(rejected.penalties.find((p) => p.memberId === "k9")?.amount, 1_500);
});

test("timely pending approved after close has no penalty", () => {
  const closed = closePeriod(createDemoState(), "m2");
  const approved = reviewPayment(closed, "seed-k9", true, "m2");
  assert.equal(memberSummary(approved, "k9").late, false);
  assert.equal(approved.penalties.some((p) => p.memberId === "k9"), false);
});

test("late payment clears badge but preserves next period penalty without compounding", () => {
  let state = closePeriod(createDemoState(), "m2");
  state = declarePayment(state, { memberId: "f7", amount: 10_000, method: "Wave", reference: "LATE-FATOU" });
  state = reviewPayment(state, state.payments.at(-1)!.id, true, "m2");
  assert.equal(memberSummary(state, "f7").late, false);
  assert.equal(state.penalties.filter((p) => p.memberId === "f7").length, 1);
  assert.equal(state.penalties.find((p) => p.memberId === "f7")?.amount, 1_500);
  assert.equal(state.penalties.find((p) => p.memberId === "f7")?.duePeriodId, "2026-12");
});

test("prior arrear payment clears old debt without affecting current collection", () => {
  let state = declarePayment(createDemoState(), { memberId: "y10", amount: 25_000, method: "Orange Money", reference: "YAO-OCT", target: "arrears" });
  state = reviewPayment(state, state.payments.at(-1)!.id, true, "m2");
  assert.equal(totals(state).approved, 175_000);
  assert.equal(memberSummary(state, "y10").arrearsDue, 0);
  assert.equal(memberSummary(state, "y10").late, false);
  assert.equal(memberSummary(state, "y10").penaltyDue, 1_500);
});

test("late replacement does not erase default when timely declaration was rejected", () => {
  let state = closePeriod(createDemoState(), "m2");
  state = reviewPayment(state, "seed-k9", false, "m2", "Référence incorrecte");
  state = declarePayment(state, { memberId: "k9", amount: 25_000, method: "Wave", reference: "KADIATOU-LATE" });
  state = reviewPayment(state, state.payments.at(-1)!.id, true, "m2");
  assert.equal(memberSummary(state, "k9").late, false);
  assert.equal(memberSummary(state, "k9").penaltyNext, 1_500);
  assert.equal(memberSummary(state, "k9").penaltyDue, 0, "future penalty is excluded from current amount");
  assert.equal(state.penalties.filter((p) => p.memberId === "k9").length, 1);
});

test("unpaid penalty alone never compounds or creates a new late badge", () => {
  let state = declarePayment(createDemoState(), { memberId: "y10", amount: 25_000, method: "Wave", reference: "YAO-CURRENT" });
  state = reviewPayment(state, state.payments.at(-1)!.id, true, "m2");
  state = declarePayment(state, { memberId: "y10", amount: 25_000, method: "Wave", reference: "YAO-OLD", target: "arrears" });
  state = reviewPayment(state, state.payments.at(-1)!.id, true, "m2");
  state = closePeriod(state, "m2");
  assert.equal(memberSummary(state, "y10").penaltyDue, 1_500);
  assert.equal(memberSummary(state, "y10").penaltyNext, 0);
  assert.equal(memberSummary(state, "y10").late, false);
});

test("persisted records migrate to the 1,500 FCFA flat penalty", () => {
  const legacy = createDemoState();
  legacy.penalties[0].amount = 1_250;
  const migrated = migratePenaltyPolicy(legacy);
  assert.equal(migrated.penalties[0].amount, 1_500);
  assert.equal(legacy.penalties[0].amount, 1_250, "migration must not mutate persisted input");
});
