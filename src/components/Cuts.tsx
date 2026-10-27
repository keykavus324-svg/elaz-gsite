import { useEffect, useRef, useState } from "react";
import { CHAPTERS } from "../chapters";
import { sfx } from "../sfx";
import { useReducedMotion, useScrollFrame } from "../scrollEngine";

/* ==================================================================
   KESME — BÖLÜMLER ARASI SİNEMATİK GEÇİŞ
   ------------------------------------------------------------------
   Site bir film gibi okunsun diye bölüm değişimleri bir "perde"
   ile kesilir: ekranın ortasından geçen koyu bir bant yukarı
   doğru süpürülür, bandın üstünde o bölümün kartı belirir —
   numara, başlık ve tek satırlık tarif.

   Kurallar:
     • Kart dekoratiftir (aria-hidden), ekran okuyucuya hiçbir
       yeni bilgi taşımaz; site kendi başlığını zaten söyler.
     • Hareket azaltma tercihinde hiç görünmez.
     • Prova modunda (sunum akışı) hiç görünmez — sunum sırasında
       bant ekranda kalmasın.
     • Tıklama/odak hiçbir zaman engellenmez (pointer-events: none).
   ================================================================== */

type Cut = {
  no: string;
  label: string;
  tag?: string;
  /** Anahtar: her kesmede yeniden başlatmak için. */
  key: number;
};

/** İki kesme arasındaki en kısa süre (ms) — hızlı kaydırmada üst üste binmesin. */
const MIN_GAP = 1600;

export default function Cuts() {
  const [cut, setCut] = useState<Cut | null>(null);
  const [armed, setArmed] = useState(false);
  const [isProva, setIsProva] = useState(false);
  const reduced = useReducedMotion();

  /** Kesmesi gösterilen son bölüm. */
  const shown = useRef<string>("top");
  /** Son kesmenin zamanı. */
  const lastAt = useRef(0);
  /** Kartın kapanma zamanlayıcısı. */
  const closer = useRef(0);

  useEffect(() => {
    try {
      setIsProva(new URLSearchParams(window.location.search).has("prova"));
    } catch {
      setIsProva(false);
    }
  }, []);

  /* Açılışta ilk karede kesme oynamasın; sayfa oturana kadar bekle. */
  useEffect(() => {
    const timer = window.setTimeout(() => setArmed(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => window.clearTimeout(closer.current), []);

  useScrollFrame(
    () => {
      if (!armed || isProva || reduced) return;

      /* Kesme çizgisi: ekranın gövde yarısı. */
      const line = window.scrollY + window.innerHeight * 0.5;
      let current = CHAPTERS[0].id;
      for (const chapter of CHAPTERS) {
        const element = document.getElementById(chapter.id);
        if (!element) continue;
        const top = element.getBoundingClientRect().top + window.scrollY;
        if (top <= line) current = chapter.id;
      }

      if (current === shown.current) return;

      const now = performance.now();
      if (now - lastAt.current < MIN_GAP) return;

      const chapter = CHAPTERS.find((item) => item.id === current);
      if (!chapter) return;

      shown.current = current;
      lastAt.current = now;
      setCut({ no: chapter.no, label: chapter.label, tag: chapter.tag, key: now });
      sfx("cut");

      window.clearTimeout(closer.current);
      closer.current = window.setTimeout(() => setCut(null), 2100);
    },
    [armed, isProva, reduced],
  );

  if (isProva || reduced) return null;

  return (
    <div className="cuts" aria-hidden="true" data-cut={cut ? `${cut.no} ${cut.label}` : ""}>
      {cut && (
        <div className="cuts__band" key={cut.key}>
          <div className="cuts__card">
            <p className="cuts__meta">
              <span className="cuts__no">{cut.no}</span>
              <span className="cuts__rule" />
              <span className="cuts__word">Sahne</span>
            </p>
            <p className="cuts__title">{cut.label}</p>
            {cut.tag && <p className="cuts__tag">{cut.tag}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
