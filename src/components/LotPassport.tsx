import type { Lot } from "../data";

/** Lot Pasaportu — perfore bilet tasarımlı izlenebilirlik kartı (demo kayıt). */
export default function LotPassport({ lot, compact = false }: { lot: Lot; compact?: boolean }) {
  const rows: Array<[string, string]> = [
    ["Bahçe / parsel", lot.bahce],
    ["Konum", lot.koy + " · Elazığ"],
    ["Hasat", lot.hasat],
    ["Kurutma", lot.kurutma],
    ["Patik", lot.patik],
    ["Eleme", lot.eleme],
    ["Saklama", lot.saklama],
  ];

  return (
    <article className={`passport${compact ? " passport--compact" : ""}`} aria-label={`Lot pasaportu ${lot.code}`}>
      <div className="passport__stub" aria-hidden="true">
        <span className="passport__brand">PATİK</span>
        <span className="passport__code-vertical">{lot.code}</span>
        <span className="passport__stub-note">Lot Pasaportu</span>
      </div>
      <div className="passport__body">
        <header className="passport__head">
          <div>
            <p className="passport__product">{lot.productName}</p>
            <p className="passport__method">{lot.method}</p>
          </div>
          <p className="passport__code">{lot.code}</p>
        </header>
        <dl className="passport__grid">
          {rows.map(([k, v]) => (
            <div key={k} className="passport__row">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <footer className="passport__foot">
          <span>{lot.uretici}</span>
          <span className="passport__demo">Temsilî demo kaydı</span>
        </footer>
      </div>
    </article>
  );
}
