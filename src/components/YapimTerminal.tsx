import { useEffect, useRef, useState } from "react";
import { BUILD_STATS } from "../content/buildStats";

/**
 * ÜRETİM TERMİNALİ
 *
 * Bu penceredeki satırlar uydurma değil: `scripts/generate-build-stats.mjs`
 * betiği, depodaki üretim ve doğrulama betiklerini gerçekten çalıştırıp
 * çıktılarını `src/content/buildStats.ts` içine yazar. Site o kaydı harfi
 * harfini gösterir. Jüri "bunu kendi makinenizde de çalıştırabilirsiniz"
 * dediğinde aynı satırları görür.
 */
export default function YapimTerminal() {
  const lines = BUILD_STATS.terminal;
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLPreElement>(null);

  /* Görünür alana girince yazmaya başla. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(lines.length);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setShown(lines.length);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        setShown(0);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lines.length]);

  /* Satır satır yaz. */
  useEffect(() => {
    if (shown >= lines.length) return;
    const id = window.setTimeout(() => setShown((value) => value + 1), 65);
    return () => window.clearTimeout(id);
  }, [shown, lines.length]);

  /* Terminali en son satırda tut. */
  useEffect(() => {
    const pre = scrollRef.current;
    if (pre) pre.scrollTop = pre.scrollHeight;
  }, [shown]);

  const bitti = shown >= lines.length;

  return (
    <div className="term" ref={ref}>
      <div className="term__bar">
        <span className="term__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="term__title">patik — üretim terminali</span>
        <button
          type="button"
          className="term__replay"
          onClick={() => setShown(0)}
          aria-label="Terminal çıktısını baştan oynat"
        >
          ↻ tekrar
        </button>
      </div>

      <pre className="term__out" ref={scrollRef} tabIndex={0} aria-label="Üretim betiklerinin gerçek konsol çıktısı">
        {lines.slice(0, shown).map((line, i) => (
          <span key={`${i}-${line}`} className={line.startsWith("$") ? "term__cmd" : line.startsWith("✓") ? "term__ok" : "term__line"}>
            {line || " "}
            {"\n"}
          </span>
        ))}
        <span className="term__cursor" aria-hidden="true" />
      </pre>

      <p className="term__note">
        <strong>Bu gerçek çıktı.</strong> Satırlar `npm run content:stats` sırasında
        depodaki betikler çalıştırılarak alınır; <code>npm run content:generate</code> ve{" "}
        <code>npm run verify</code> komutlarını sen de çalıştırabilirsin — aynı sayılar çıkar.
      </p>
    </div>
  );
}
