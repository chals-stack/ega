import test from "node:test";
import assert from "node:assert/strict";
import { createDemoState, totals } from "./engine.ts";
import { collectionEntries, collectionSummary, selectionRange, shiftDay } from "./collection.ts";

test("calendar totals reconcile with the pot and use actual approval dates across months", () => {
  const state = createDemoState();
  const entries = collectionEntries(state);
  assert.equal(collectionSummary(entries, "2026-12-01", "2027-01-01").collected, totals(state).approved);
  assert.equal(collectionSummary(entries, "2026-11-01", "2026-12-01").collected, 0);
  const day = collectionSummary(entries, "2026-12-04", "2026-12-05");
  assert.equal(day.collected, 100_000);
  assert.equal(day.contributors, 5);
  assert.equal(day.opening + day.collected, day.cumulative);
});
test("weekly ranges use Monday including year and month boundaries", () => {
  assert.deepEqual(selectionRange("2027-01-01", "week"), { start:"2026-12-28", end:"2027-01-04" });
  assert.deepEqual(selectionRange("2026-12-06", "week"), { start:"2026-11-30", end:"2026-12-07" });
  assert.equal(shiftDay("2028-02-28", 1), "2028-02-29");
  assert.deepEqual(selectionRange("2028-02-29", "month"), { start:"2028-02-01", end:"2028-03-01" });
});
test("pending, rejected, arrears and penalties cannot inflate historical principal", () => {
  const state = createDemoState();
  state.payments.push(
    { id:"penalty",memberId:"a1",amount:1500,method:"Mixx",reference:"p",target:"current",status:"approved",declaredAt:"2026-12-05T10:00:00Z",reviewedAt:"2026-12-05T11:00:00Z" },
    { id:"arrears",memberId:"y10",amount:25000,method:"Mixx",reference:"a",target:"arrears",status:"approved",declaredAt:"2026-12-05T10:00:00Z" },
    { id:"rejected",memberId:"y10",amount:25000,method:"Mixx",reference:"r",target:"current",status:"rejected",declaredAt:"2026-12-05T10:00:00Z" },
  );
  const summary = collectionSummary(collectionEntries(state), "2026-12-05", "2026-12-06");
  assert.equal(summary.collected, 0);
  assert.equal(summary.pending, 25000);
  assert.equal(summary.cumulative, 175000);
});
test("cumulative pot uses approval time, not declaration time", () => {
  const state = createDemoState();
  state.payments[0].reviewedAt = "2026-12-06T00:01:00Z";
  const entries = collectionEntries(state);
  assert.equal(collectionSummary(entries,"2026-12-01","2026-12-02").collected, 0);
  assert.equal(collectionSummary(entries,"2026-12-06","2026-12-07").collected, 25000);
  assert.equal(collectionSummary(entries,"2026-12-01","2026-12-07").collected, totals(state).approved);
});
