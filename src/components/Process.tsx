import { useState } from "react";
import { PROCESS } from "../data";

export default function Process() {
  const [active, setActive] = useState(0);
  const step = PROCESS[active];

  return (
    <section className="section process" id="surec" aria-labelledby="surec-baslik">
      <div className="section__head">
        <p className="kicker">Dalından kutuna</p>
        <h2 id="surec-baslik">Bir kutu Patik, altı durak yol alır</h2>
        <p className="section__lede">
          Adımları seç, Baskil'de kayısının yaz mesaisini sırayla izle. Bu akış, lot pasaportundaki
          kayıtların ta kendisidir.
        </p>
      </div>

      <div className="process__layout">
        <ol className="process__list" aria-label="Üretim adımları">
          {PROCESS.map((s, i) => (
            <li key={s.no}>
              <button
                type="button"
                className={`process__step-btn${i === active ? " is-active" : ""}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                <span className="process__no" aria-hidden="true">{s.no}</span>
                <span className="process__step-text">
                  <span className="process__step-title">{s.title}</span>
                  <span className="process__step-kicker">{s.kicker}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <article className="process__panel" key={step.no} aria-live="polite">
          <figure className="process__figure">
            <img src={step.img} alt={step.alt} width={1440} height={960} loading="lazy" />
            <span className="process__chip">{step.chip}</span>
          </figure>
          <div className="process__body">
            <p className="process__panel-kicker">{step.no} — {step.kicker}</p>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            <div className="process__nav">
              <button
                type="button"
                className="btn btn--ghost btn--small"
                disabled={active === 0}
                onClick={() => setActive((v) => Math.max(0, v - 1))}
              >
                ← Önceki adım
              </button>
              <span className="process__counter" aria-hidden="true">{active + 1} / {PROCESS.length}</span>
              {active < PROCESS.length - 1 ? (
                <button
                  type="button"
                  className="btn btn--primary btn--small"
                  onClick={() => setActive((v) => Math.min(PROCESS.length - 1, v + 1))}
                >
                  Sonraki adım →
                </button>
              ) : (
                <a href="#lotunu-kur" className="btn btn--primary btn--small">Şimdi lotunu kur →</a>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
