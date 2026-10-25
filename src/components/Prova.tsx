import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "../cart";
import { goToLot } from "./Products";

/* ================================================================== */
/*  PROVA MODU — demo sürücüsü için gizli konuşmacı konsolu.          */
/*  Açmak için adrese ?prova=1 ekleyin (örn. /?prova=1).              */
/*  Adımlar, süre sayacı (90 sn) ve klavye (←/→) ile gezinme içerir.  */
/* ================================================================== */

interface Step {
  title: string;
  line: string;
  anchor?: string;
  action?: "cart" | "lot";
}

const STEPS: Step[] = [
  {
    title: "1/6 · Açılış — Vitrin",
    anchor: "#top",
    line: "Söyle: “Baskil'de kurudu, adıyla gelsin.” Sorunu kur: emek başka adla satılıyor, alıcı gün/islim farkını bilmiyor. Patik kelimesinin anlamını sarı kutudan ver.",
  },
  {
    title: "2/6 · Sorun — Gün mü İslim mi?",
    anchor: "#karsilastir",
    line: "Kaydırıcıyı sağa-sola oynat: “Aynı kase, aynı ışık; tek fark kurutma yolu.” Sonra sekmelerde bir satır oku (doku ya da saklama), abartma.",
  },
  {
    title: "3/6 · İmza — Lotunu Kur",
    anchor: "#lotunu-kur",
    line: "3 soruyu cevapla: Atıştırmalık → Koyu/yoğun → Aileyle paylaşılır. Gerekçeleri işaret et, pasaport önizlemesini göster, çekirdeği de ekleyip “Bu lotu sepete ekle”ye bas.",
  },
  {
    title: "4/6 · Sepet & Demo Sipariş",
    action: "cart",
    line: "Sepet açık: kargo barını göster, adedi bir artır. “Demo siparişe geç” → formu bir kez boş gönder (doğrulama kanıtı), hızlıca doldur ve özeti al.",
  },
  {
    title: "5/6 · Lot Pasaportu (altın vuruş)",
    action: "lot",
    line: "Pasaport açık: “Hediyeyi alan kişi tam bunu görür.” Şimdi basılı pasaportu jüriye elden uzat; isteyen telefonundan ?lot=PT-26-047 ile açsın.",
  },
  {
    title: "6/6 · Kapanış — Çay Molası",
    anchor: "#mola",
    line: "TRT Türkü'yü kısık sesle aç, bir jüri üyesini Patik Ustası'nda 30 sn oynat: “Gerçek patik böyle hızlı olmaz ama refleksinizi gördük.” Final: “Patik — bahçeden kutuna, lotuyla. Teşekkürler.”",
  },
];

const TOTAL = 90;

export default function Prova() {
  const { setCartOpen } = useCart();
  const [enabled] = useState(() => {
    try { return new URLSearchParams(window.location.search).has("prova"); } catch { return false; }
  });
  const [open, setOpen] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [i, setI] = useState(0);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const startRef = useRef<number>(0);
  const timerRef = useRef<number | undefined>(undefined);

  const goto = useCallback((idx: number) => {
    const n = Math.min(STEPS.length - 1, Math.max(0, idx));
    setI(n);
    const step = STEPS[n];
    if (step.action === "cart") {
      setCartOpen(true);
    } else if (step.action === "lot") {
      setCartOpen(false);
      window.setTimeout(() => goToLot("PT-26-047"), 150);
    } else if (step.anchor) {
      document.querySelector(step.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [setCartOpen]);

  useEffect(() => {
    if (!enabled || !open) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") goto(i + 1);
      if (e.key === "ArrowLeft") goto(i - 1);
      if (e.key.toLocaleLowerCase("tr-TR") === "p") setMinimized((m) => !m);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, open, i, goto]);

  function toggleTimer() {
    if (elapsed === null) {
      startRef.current = Date.now();
      setElapsed(0);
      window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }, 250);
    } else {
      window.clearInterval(timerRef.current);
      setElapsed(null);
    }
  }

  useEffect(() => () => window.clearInterval(timerRef.current), []);

  if (!enabled || !open) return null;
  const step = STEPS[i];
  const pct = elapsed === null ? 0 : Math.min(100, (elapsed / TOTAL) * 100);
  const over = elapsed !== null && elapsed > TOTAL;
  const clockText = elapsed === null ? "00:00" : `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  if (minimized) {
    return (
      <button
        type="button"
        className={`prova-mini${over ? " is-over" : ""}`}
        onClick={() => setMinimized(false)}
        aria-label={`Prova konsolunu büyüt. Adım ${i + 1}/${STEPS.length}, süre ${clockText}`}
      >
        PROVA {i + 1}/{STEPS.length} · {clockText}
      </button>
    );
  }

  return (
    <aside className="prova" aria-label="Prova modu konuşmacı konsolu">
      <div className="prova__bar" aria-hidden="true">
        <span className={over ? "is-over" : elapsed !== null && elapsed > 65 ? "is-warn" : ""} style={{ width: `${pct}%` }} />
      </div>
      <div className="prova__head">
        <p className="prova__title">{step.title}</p>
        <p className={`prova__clock${over ? " is-over" : ""}`} aria-live="off">
          {`${clockText} / 01:30${over ? " (süre aşıldı)" : ""}`}
        </p>
      </div>
      <p className="prova__line">{step.line}</p>
      <div className="prova__controls">
        <button type="button" className="prova__btn" onClick={() => goto(i - 1)} disabled={i === 0}>← Önceki</button>
        <button type="button" className="prova__btn prova__btn--main" onClick={() => goto(i + 1)} disabled={i === STEPS.length - 1}>Sonraki →</button>
        <button type="button" className="prova__btn" onClick={toggleTimer} aria-pressed={elapsed !== null}>
          {elapsed === null ? "Sayacı başlat" : "Sayacı sıfırla"}
        </button>
        <button type="button" className="prova__btn" onClick={() => setMinimized(true)}>
          Küçült
        </button>
        <button
          type="button"
          className="prova__btn prova__btn--close"
          onClick={() => setOpen(false)}
          aria-label="Prova modunu kapat"
        >
          Kapat ✕
        </button>
      </div>
      <p className="prova__hint">İpucu: klavyede ← → ile adım değiştir, P ile konsolu küçült/büyüt. Bu konsol yalnızca adresinde <code>?prova=1</code> varken görünür; sahnede küçültülmüş hâli kullanın.</p>
    </aside>
  );
}
