"use client";

const money = (amount: number) => new Intl.NumberFormat("fr-TG").format(amount);
export function cashBreakdown(total: number) {
  let rest = Math.max(0, Math.floor(total));
  return [10_000, 5_000, 2_000, 1_000, 500].map(value => {
    const count = Math.floor(rest / value); rest %= value; return { value, count };
  }).filter(item => item.count > 0);
}

function NotePile({ value, count }: { value: number; count: number }) {
  return <div className={`note-pile-wrap ${count === 10 ? "complete-pile" : "incomplete-pile"}`}><div className="note-pile" style={{ width: 178 + count * 3, height: 96 + count * 2 }}>
    {Array.from({ length: count }, (_, index) => <i key={index} className={`real-note note-${value}`} style={{ left: index * 3, top: index * 2, zIndex: index + 1 }} />)}
    {count === 10 ? <b className="counting-strap" aria-label="Liasse de 10 billets"><img src="/images/bank-strap-green-v2.png" alt="" /><span>10 BILLETS</span></b> : <b className="note-count-bubble">{count}<small>billet{count > 1 ? "s" : ""}</small></b>}
  </div></div>;
}

export default function CashVisual({ amount, layout = "portrait" }: { amount: number; layout?: "portrait" | "horizontal" }) {
  const bundles = amount >= 200_000 ? Math.floor(amount / 100_000) : 0;
  const loosePiles = cashBreakdown(bundles ? amount % 100_000 : amount).flatMap(item => {
    const chunks: { value: number; count: number }[] = [];
    for (let left = item.count; left > 0; left -= 10) chunks.push({ value: item.value, count: Math.min(10, left) });
    return chunks;
  });
  const residual = amount % 500;
  return <div className={`cash-stage real-cash-stage cash-layout-${layout} ${bundles ? "safe-container" : "glass-container"}`} role="img" aria-label={`Billetage de ${money(amount - residual)} francs CFA${residual ? ` et solde non représenté de ${money(residual)} francs CFA` : ""}`}>
    {amount === 0 ? <div className="cash-empty">La caisse attend sa première cotisation.</div> : <div className="real-cash-content">
      {bundles > 0 && <div className="bundle-zone">{Array.from({ length: bundles }, (_, bundle) => <div className="banknote-bundle" key={bundle}><div className="bundle-notes">{Array.from({ length: 10 }, (_, index) => <i key={index} className="real-note note-10000" style={{ left: index, top: index * 1.4, zIndex: index + 1 }} />)}<b className="real-bundle-strap" aria-label="Liasse de 10 billets"><img src="/images/bank-strap-green-v2.png" alt="" /><span>10 BILLETS</span></b></div></div>)}</div>}
      <div className="loose-zone">{loosePiles.map((pile, index) => <NotePile key={`${pile.value}-${index}`} value={pile.value} count={pile.count} />)}</div>
    </div>}
    {residual > 0 && <p className="cash-residual">Solde hors billets : {money(residual)} FCFA</p>}
  </div>;
}
