import { useEffect, useMemo, useRef, useState } from "react";
import { CHAPTERS } from "../chapters";

/**
 * Defterin bölüm rayı.
 * Geniş ekranda sol kenarda durur; küçük ekranda yalnızca üst ilerleme çizgisi kalır.
 */
export default function ChapterRail() {
  const [active, setActive] = useState("top");
  const [progress, setProgress] = useState(0);
  const [isProva, setIsProva] = useState(false);
  const rafRef = useRef(0);

  const activeChapter = useMemo(
    () => CHAPTERS.find((chapter) => chapter.id === active) ?? CHAPTERS[0],
    [active]
  );

  useEffect(() => {
    try {
      setIsProva(new URLSearchParams(window.location.search).has("prova"));
    } catch {
      setIsProva(false);
    }
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - window.innerHeight);
        setProgress(Math.min(1, Math.max(0, window.scrollY / max)));

        // Lazy bölümler yüklenirken aynı ID'li öğe değişebilir; bu yüzden
        // aktif bölüm her karede taze DOM sorgusuyla bulunur.
        const marker = window.scrollY + window.innerHeight * 0.42;
        let current = CHAPTERS[0].id;
        for (const chapter of CHAPTERS) {
          const element = document.getElementById(chapter.id);
          if (!element) continue;
          const top = element.getBoundingClientRect().top + window.scrollY;
          if (top <= marker) current = chapter.id;
        }
        setActive((previous) => (previous === current ? previous : current));
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  if (isProva) return null;

  return (
    <>
      <div className="chapter-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <nav className="chapter-rail" aria-label="Sayfa bölümleri">
        <p className="chapter-rail__eyebrow">Defter</p>
        <ol>
          {CHAPTERS.map((chapter) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={chapter.id === active ? "is-active" : ""}
                aria-current={chapter.id === active ? "location" : undefined}
              >
                <span className="chapter-rail__no">{chapter.no}</span>
                <span className="chapter-rail__label">{chapter.label}</span>
              </a>
            </li>
          ))}
        </ol>
        <p className="chapter-rail__now" aria-live="polite">
          <span>Şu an</span>
          <strong>{activeChapter.label}</strong>
        </p>
      </nav>
    </>
  );
}
