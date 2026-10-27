import { useCallback, useRef, useState } from "react";
import { LOT_LEDGER } from "../../content/lotLedger";
import { sfx } from "../../sfx";

/**
 * Lot Pusulası — 811 temsilî lot kaydından birini ipuçlarıyla bul.
 *
 * Kayıtların tamamı src/content/lotLedger.ts'ten gelir; oyun yeni veri
 * uydurmaz, sitedeki gerçek defteri oynatır. Doğru bulunan lotun pasaportu
 * "?lot=KOD" bağlantısıyla açılabilir.
 */

const ROUNDS = 6;

type Option = { code: string; right: boolean };

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function makeRound(seen: Set<string>) {
  const pool = LOT_LEDGER.filter((lot) => !seen.has(lot.code));
  const source = pool.length >= 4 ? pool : LOT_LEDGER;
  const lot = pick(source);
  const decoys: string[] = [];
  const used = new Set<string>([lot.code]);
  let guard = 0;
  while (decoys.length < 3 && guard < 400) {
    guard += 1;
    const other = pick(source);
    if (used.has(other.code)) continue;
    used.add(other.code);
    decoys.push(other.code);
  }
  const options: Option[] = [
    { code: lot.code, right: true },
    ...decoys.map((code) => ({ code, right: false })),
  ];
  // Karıştır ama doğru cevap hep aynı yerde kalmasın.
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { lot, options };
}

export default function LotPusulasi() {
  const [round, setRound] = useState(0);
  const [state, setState] = useState<"idle" | "play" | "done">("idle");
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [current, setCurrent] = useState<ReturnType<typeof makeRound> | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  const start = useCallback(() => {
    seenRef.current = new Set();
    setRound(0);
    setScore(0);
    setPicked(null);
    setCurrent(makeRound(seenRef.current));
    setState("play");
    sfx("click");
  }, []);

  const choose = (code: string) => {
    if (!current || picked) return;
    setPicked(code);
    if (code === current.lot.code) {
      setScore((s) => s + 1);
      sfx("good");
    } else {
      sfx("bad");
    }
  };

  const next = () => {
    sfx("click");
    setPicked(null);
    if (round + 1 >= ROUNDS) {
      setState("done");
      sfx("win");
    } else {
      seenRef.current = new Set(seenRef.current).add(current?.lot.code ?? "");
      setRound((r) => r + 1);
      setCurrent(makeRound(seenRef.current));
    }
  };

  if (state === "idle") {
    return (
      <div className="oyun__shell">
        <p className="oyun__shell-label">Lot Pusulası · {LOT_LEDGER.length} kayıt</p>
        <div className="oyun__intro">
          <h3 className="oyun__intro-title">Bu ipuçları hangi lot?</h3>
          <p className="oyun__intro-text">
            Bahçe, hasat haftası, kurutma yöntemi ve kutu bilgisi verilir; sen lot kodunu bulursun.
            Altı tur, altı gerçek kayıt — hepsi temsilî demo defterinden.
          </p>
          <button type="button" className="btn btn--primary btn--large" onClick={start}>
            Pusulayı çevir <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    );
  }

  if (state === "done") {
    const title = score === ROUNDS ? "Tam isabet" : score >= 4 ? "Pasaport okuru" : "Çırak";
    return (
      <div className="oyun__shell">
        <p className="oyun__shell-label">Lot Pusulası · bitti</p>
        <div className="oyun__result">
          <p className="oyun__result-kicker">Sonuç</p>
          <h4 className="oyun__result-title">{title}</h4>
          <p className="oyun__result-note">
            {score} / {ROUNDS} lot bulundu. Bu kayıtların tamamı site içindeki 811 satırlık
            temsilî defterden geldi; bir lotu bulmak, o defteri okumak demek.
          </p>
          <dl className="oyun__result-rows">
            <div>
              <dt>Doğru</dt>
              <dd>
                {score} / {ROUNDS}
              </dd>
            </div>
            <div>
              <dt>Defter</dt>
              <dd>{LOT_LEDGER.length} kayıt</dd>
            </div>
          </dl>
          <button type="button" className="btn btn--primary oyun__restart" onClick={start}>
            Yeni tur <span aria-hidden="true">↻</span>
          </button>
        </div>
      </div>
    );
  }

  if (!current) return <p className="oyun__loading">Kayıtlar hazırlanıyor…</p>;

  const lot = current.lot;
  const solved = picked !== null;

  return (
    <div className="oyun__shell">
      <p className="oyun__shell-label">
        Lot Pusulası · tur {round + 1} / {ROUNDS}
      </p>

      <div className="oyun__hud">
        <div className="oyun__stat">
          <span>Bulunan</span>
          <strong>
            {score} / {ROUNDS}
          </strong>
        </div>
        <div className="oyun__stat">
          <span>Defter</span>
          <strong className="oyun__stat--text">{lot.product}</strong>
        </div>
      </div>

      <div className="pusula">
        <p className="pusula__title">Bu kayıt hangi lot?</p>
        <dl className="pusula__clues">
          <div>
            <dt>Bahçe</dt>
            <dd>
              {lot.parcel} · {lot.location}
            </dd>
          </div>
          <div>
            <dt>Hasat</dt>
            <dd>
              {lot.harvestWindow} · {lot.sergiDays} gün sergi
            </dd>
          </div>
          <div>
            <dt>Yöntem</dt>
            <dd>{lot.methodLabel}</dd>
          </div>
          <div>
            <dt>Kutu</dt>
            <dd>
              {lot.boxSize} · {lot.boxCount} kutu · {lot.dryness}
            </dd>
          </div>
        </dl>
      </div>

      <div className="pusula__options">
        {current.options.map((opt) => {
          const isRight = opt.right;
          const stateClass =
            picked === null
              ? ""
              : isRight
                ? " is-right"
                : picked === opt.code
                  ? " is-wrong"
                  : "";
          return (
            <button
              key={opt.code}
              type="button"
              className={`pusula__code${stateClass}`}
              onClick={() => choose(opt.code)}
              disabled={solved}
            >
              {opt.code}
            </button>
          );
        })}
      </div>

      {solved && (
        <div className="pusula__after">
          <p className={`pusula__verdict${picked === lot.code ? " is-right" : " is-wrong"}`}>
            {picked === lot.code ? "Doğru: " : "Bu kayıt: "}
            <strong>{lot.code}</strong> — {lot.sortingNote}
          </p>
          <p className="pusula__link">
            <a href={`?lot=${lot.code}#lot-sorgula`} className="btn btn--ghost">
              Lot pasaportunu aç <span aria-hidden="true">→</span>
            </a>
          </p>
          <button type="button" className="btn btn--primary oyun__restart" onClick={next}>
            {round + 1 >= ROUNDS ? "Turu bitir" : "Sonraki lot"} <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
