import { test } from "node:test";
import assert from "node:assert/strict";
import { addProduct, createMarketState, creditWallet, deleteProduct, discountPercent, purchaseProduct, updateProduct, type ProductInput } from "./market.ts";

const input: ProductInput = { name: "Réchaud économique", description: "Réchaud compact pour les besoins du foyer.", category: "Maison", price: 20_000, originalPrice: 25_000, stock: 3, status: "active", featured: false };

test("admin CRUD keeps input immutable and validates permissions", () => {
  const initial = createMarketState();
  assert.throws(() => addProduct(initial, input, "member"));
  let state = addProduct(initial, input, "admin");
  assert.equal(initial.products.length, 6);
  assert.equal(state.products.length, 7);
  const created = state.products[0];
  state = updateProduct(state, created.id, { ...input, price: 18_000, stock: 5 }, "admin");
  assert.equal(state.products[0].price, 18_000);
  assert.equal(discountPercent(state.products[0]), 28);
  state = deleteProduct(state, created.id, "admin");
  assert.equal(state.products.length, 6);
});

test("tontine credit then purchase updates wallet, stock, order and ledger atomically", () => {
  const initial = createMarketState();
  let state = creditWallet(initial, "y10", 50_000, "TOUR-YAO-01", "admin");
  assert.equal(state.balances.y10, 50_000);
  const product = state.products.find(item => item.id === "rice-25")!;
  state = purchaseProduct(state, "y10", product.id);
  assert.equal(state.balances.y10, 31_500);
  assert.equal(state.products.find(item => item.id === product.id)!.stock, product.stock - 1);
  assert.equal(state.orders[0].total, 18_500);
  assert.equal(state.transactions[0].kind, "debit");
  assert.equal(initial.orders.length, 0);
});

test("purchase rejects insufficient balance, missing stock and inactive products", () => {
  const initial = createMarketState();
  assert.throws(() => purchaseProduct(initial, "y10", "solar-kit"));
  const noStock = updateProduct(initial, "solar-kit", { ...initial.products[0], stock: 0 }, "admin");
  assert.throws(() => purchaseProduct(noStock, "a1", "solar-kit"));
  const draft = updateProduct(initial, "solar-kit", { ...initial.products[0], status: "draft" }, "admin");
  assert.throws(() => purchaseProduct(draft, "a1", "solar-kit"));
});
