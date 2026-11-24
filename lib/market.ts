import type { Role } from "./engine.ts";

export type ProductStatus = "active" | "draft";
export type ProductCategory = "Énergie" | "Téléphonie" | "Maison" | "Alimentation" | "Éducation" | "Activité";
export type MarketProduct = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  stock: number;
  status: ProductStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};
export type WalletTransaction = {
  id: string;
  memberId: string;
  kind: "credit" | "debit";
  amount: number;
  label: string;
  reference: string;
  at: string;
};
export type MarketOrder = {
  id: string;
  memberId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: "confirmed" | "cancelled";
  createdAt: string;
};
export type MarketState = {
  products: MarketProduct[];
  balances: Record<string, number>;
  transactions: WalletTransaction[];
  orders: MarketOrder[];
};
export type ProductInput = Omit<MarketProduct, "id" | "createdAt" | "updatedAt">;

const clone = (state: MarketState): MarketState => JSON.parse(JSON.stringify(state)) as MarketState;
const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const assertAdmin = (role: Role) => { if (role !== "admin") throw new Error("Cette action est réservée à l’administratrice."); };
const positiveInteger = (value: number, label: string) => { if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${label} doit être un entier positif.`); };

export function discountPercent(product: Pick<MarketProduct, "price" | "originalPrice">) {
  if (product.originalPrice <= product.price) return 0;
  return Math.round((1 - product.price / product.originalPrice) * 100);
}

export function createMarketState(): MarketState {
  const createdAt = "2026-11-24T09:00:00.000Z";
  const make = (idValue: string, name: string, description: string, category: ProductCategory, price: number, originalPrice: number, stock: number, featured = false): MarketProduct => ({ id: idValue, name, description, category, price, originalPrice, stock, status: "active", featured, createdAt, updatedAt: createdAt });
  return {
    products: [
      make("solar-kit", "Kit solaire compact", "Éclairage, recharge USB et petite radio pour le foyer.", "Énergie", 48_000, 60_000, 8, true),
      make("phone-access", "Smartphone essentiel", "Double SIM, batterie longue durée et accès aux services mobiles.", "Téléphonie", 72_000, 90_000, 5, true),
      make("rice-25", "Sac de riz 25 kg", "Format familial pour sécuriser les courses du mois.", "Alimentation", 18_500, 22_000, 14),
      make("fan-charge", "Ventilateur rechargeable", "Autonomie prolongée et lampe intégrée pour la maison.", "Maison", 29_000, 36_000, 9, true),
      make("school-kit", "Kit fournitures scolaires", "Cahiers, stylos, matériel de géométrie et sac résistant.", "Éducation", 12_500, 15_000, 18),
      make("sewing-mini", "Machine à coudre portable", "Un équipement compact pour lancer ou renforcer une activité.", "Activité", 65_000, 78_000, 4),
    ],
    balances: { a1: 250_000, m2: 50_000, f7: 25_000, y10: 0 },
    transactions: [
      { id: "wallet-seed-a1", memberId: "a1", kind: "credit", amount: 250_000, label: "Versement de tontine", reference: "EGA-TOUR-AFI-01", at: "2026-11-24T08:30:00.000Z" },
      { id: "wallet-seed-m2", memberId: "m2", kind: "credit", amount: 50_000, label: "Reliquat réinjecté", reference: "EGA-RELIQUAT-KOFFI", at: "2026-11-23T11:20:00.000Z" },
      { id: "wallet-seed-f7", memberId: "f7", kind: "credit", amount: 25_000, label: "Épargne disponible", reference: "EGA-EPARGNE-AMA", at: "2026-11-22T10:00:00.000Z" },
    ],
    orders: [],
  };
}

function validateProduct(input: ProductInput) {
  if (input.name.trim().length < 3) throw new Error("Le nom de l’article est trop court.");
  if (input.description.trim().length < 10) throw new Error("Ajoutez une description plus précise.");
  positiveInteger(input.price, "Le prix");
  positiveInteger(input.originalPrice, "Le prix initial");
  if (input.originalPrice < input.price) throw new Error("Le prix initial ne peut pas être inférieur au prix de vente.");
  if (!Number.isSafeInteger(input.stock) || input.stock < 0) throw new Error("Le stock doit être un entier positif ou nul.");
}

export function addProduct(state: MarketState, input: ProductInput, actorRole: Role): MarketState {
  assertAdmin(actorRole); validateProduct(input);
  const next = clone(state); const timestamp = now();
  next.products.unshift({ ...input, id: id("product"), name: input.name.trim(), description: input.description.trim(), createdAt: timestamp, updatedAt: timestamp });
  return next;
}

export function updateProduct(state: MarketState, productId: string, input: ProductInput, actorRole: Role): MarketState {
  assertAdmin(actorRole); validateProduct(input);
  const next = clone(state); const index = next.products.findIndex(product => product.id === productId);
  if (index < 0) throw new Error("Article introuvable.");
  next.products[index] = { ...next.products[index], ...input, name: input.name.trim(), description: input.description.trim(), updatedAt: now() };
  return next;
}

export function deleteProduct(state: MarketState, productId: string, actorRole: Role): MarketState {
  assertAdmin(actorRole);
  if (!state.products.some(product => product.id === productId)) throw new Error("Article introuvable.");
  const next = clone(state); next.products = next.products.filter(product => product.id !== productId); return next;
}

export function creditWallet(state: MarketState, memberId: string, amount: number, reference: string, actorRole: Role): MarketState {
  assertAdmin(actorRole); positiveInteger(amount, "Le montant");
  if (reference.trim().length < 4) throw new Error("Ajoutez une référence de versement.");
  const next = clone(state); next.balances[memberId] = (next.balances[memberId] ?? 0) + amount;
  next.transactions.unshift({ id: id("credit"), memberId, kind: "credit", amount, label: "Versement de tontine réinjecté", reference: reference.trim(), at: now() });
  return next;
}

export function purchaseProduct(state: MarketState, memberId: string, productId: string, quantity = 1): MarketState {
  positiveInteger(quantity, "La quantité");
  const next = clone(state); const product = next.products.find(item => item.id === productId);
  if (!product || product.status !== "active") throw new Error("Cet article n’est plus disponible.");
  if (product.stock < quantity) throw new Error("Le stock disponible est insuffisant.");
  const total = product.price * quantity; const balance = next.balances[memberId] ?? 0;
  if (balance < total) throw new Error("Votre portefeuille EGA ne couvre pas cet achat.");
  next.balances[memberId] = balance - total; product.stock -= quantity; product.updatedAt = now();
  const orderId = id("order"); const createdAt = now();
  next.orders.unshift({ id: orderId, memberId, productId, productName: product.name, quantity, unitPrice: product.price, total, status: "confirmed", createdAt });
  next.transactions.unshift({ id: id("debit"), memberId, kind: "debit", amount: total, label: `Achat : ${product.name}`, reference: orderId.toUpperCase(), at: createdAt });
  return next;
}
