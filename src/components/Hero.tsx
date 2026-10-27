import { useEffect, useRef, useState } from "react";
import { goToLot } from "./Products";
import { publicAsset } from "../assets";
import { sfx } from "../sfx";
import { useScrollFrame } from "../scrollEngine";

const LEDGER_LINKS = [
  { value: "1.800", label: "temsilî kayıt", href: "#saha", note: "Saha Defteri'nde aç" },
  { value: "204", label: "lot satırı", href: "#atlas", note: "Lot Defteri" },
  { value: "365", label: "sezon günü", href: "#evren", note: "Günlüğü gör" },
  { value: "120", label: "ders", href: "#evren", note: "Patik Okulu" },
];

const ROUTE = ["Dal", "Sergi", "Patik", "Çir", "Pasaport"];

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const collageRef = useRef<HTMLDivElement | null>(null);
  const [stamped, setStamped] = useState(false);

  /* Katmanlı paralaks: kahramanın her katmanı farklı hızda kayar —
     fotoğraflar, bilet ve dev PATİK yazısı ayrı derinliklerde.
     Tek kaydırma motoru besler; React yeniden çizilmez. */
  useScrollFrame((vh) => {
    const el = heroRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    const ratio = Math.max(-1, Math.min(1, top / Math.max(1, vh)));
    el.style.setProperty("--hero-d", (ratio * 100).toFixed(2));
  });

  /* İmleci izleyen sıcak ışık: vitrin fotoğrafları üzerinde yumuşak bir
     parlaklık. Yalnızca ince imleçli cihazlarda; hareket azaltmada kapalı. */
  useEffect(() => {
    const el = glowRef.current;
    const area = collageRef.current;
    if (!el || !area) return;
    if (!window.matchMedia?.("(pointer: fine)").matches) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onMove = (event: PointerEvent) => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--gx", `${event.clientX - rect.left}px`);
        el.style.setProperty("--gy", `${event.clientY - rect.top}px`);
        el.classList.add("is-on");
      });
    };
    const onLeave = () => el.classList.remove("is-on");

    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerleave", onLeave);
    return () => {
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      className="hero hero--ledger"
      id="top"
      aria-labelledby="hero-baslik"
      ref={heroRef}
    >
      <div className="hero__wordmark" aria-hidden="true">PATİK</div>
      <div className="hero__ledger-lines" aria-hidden="true" />

      <div className="hero__masthead" aria-label="Patik hasat defteri üst bilgisi">
        <span>Elazığ · 23</span>
        <strong>2026 Hasat Defteri</strong>
        <span>Yarışma demosu baskısı</span>
      </div>

      <div className="hero__layout">
        <div className="hero__text">
          <p className="hero__issue">
            <span>Baskil Kayısı Atölyesi</span>
            <span aria-hidden="true">◆</span>
            <span>Lot Pasaportlu</span>
          </p>

          <h1 id="hero-baslik" className="hero__title">
            <span className="hero__title-line">Kayısı kurur.</span>
            <span className="hero__title-line hero__title-accent">Kaydı kalır.</span>
          </h1>

          <p className="hero__sub">
            Patik, Baskil kayısısını yalnızca kutuya koymaz; bahçesini, hasat haftasını,
            kurutma yolunu ve patik gününü kutunun içine yazar. Aşağıda o kaydın tamamını
            gezebilir, çalıştırabilir ve kendi lotunu kurabilirsin.
          </p>

          <div className="hero__ctas">
            <a href="#lotunu-kur" className="btn btn--primary btn--large">
              Lotunu Kur <span aria-hidden="true">→</span>
              <span className="btn__hint">30 saniye</span>
            </a>
            <a href="#saha" className="btn btn--ghost btn--large">
              Saha Defteri'ni Aç <span aria-hidden="true">↓</span>
            </a>
          </div>

          <ol className="hero__route" aria-label="Daldan pasaporta Patik yolu">
            {ROUTE.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>

          <p className="hand-note hero__scribble">
            Güneş kayısıyı kurutur — biz kaydını kurutuyoruz.
          </p>

          <p className="hero__etymology">
            <strong>Patik:</strong> Yarı kuru kayısının çekirdeğini tek tek elle çıkarma
            mesaisi. Markanın adı da kaydın özeni de o el emeğinden gelir.
          </p>
        </div>

        <div className="hero__collage" aria-label="Patik görsel vitrini" ref={collageRef}>
          <span className="hero__overlay" aria-hidden="true">BASKIL</span>
          <span className="hero__glow" aria-hidden="true" ref={glowRef} />
          <figure className="hero__photo hero__photo--main">
            <img
              src={publicAsset("img/sergi.jpg")}
              className="grade-warm"
              alt="Karakaya kıyısındaki teraslarda bezler üzerinde kuruyan kayısı sergileri"
              width={1600}
              height={1000}
              /* React 18'de öznitelik küçük harfle geçirilmeli; aksi hâlde konsola uyarı düşer. */
              {...({ fetchpriority: "high" } as Record<string, string>)}
            />
            <figcaption>
              <strong>Sergi zamanı</strong>
              <span>Teraslarda güneş mesaisi</span>
            </figcaption>
          </figure>

          <figure className="hero__photo hero__photo--hands">
            <img
              src={publicAsset("img/patik.jpg")}
              className="grade-warm"
              alt="Tepsideki yarı kuru kayısıların çekirdeklerini elle çıkaran üretici elleri"
              width={1200}
              height={800}
              loading="eager"
            />
            <figcaption>Patik · tek tek elle</figcaption>
          </figure>

          <aside className={`hero__ticket${stamped ? " is-stamped" : ""}`} aria-label="Örnek lot pasaportu bileti">
            <div className="hero__ticket-head">
              <span>LOT BİLETİ</span>
              <strong>PT-26-047</strong>
            </div>
            <dl>
              <div>
                <dt>Bahçe</dt>
                <dd>Gölyaka Parseli</dd>
              </div>
              <div>
                <dt>Hasat</dt>
                <dd>29. hafta</dd>
              </div>
              <div>
                <dt>Yol</dt>
                <dd>Gün kurusu · 5 gün</dd>
              </div>
            </dl>
            <div className="hero__ticket-actions">
              <button
                type="button"
                className="hero__ticket-verify"
                onClick={() => {
                  setStamped(true);
                  sfx("stamp");
                }}
              >
                Kaydı sorgula
              </button>
              <button type="button" onClick={() => goToLot("PT-26-047")}>
                Pasaportu aç <span aria-hidden="true">→</span>
              </button>
            </div>
            {stamped && (
              <p className="hero__ticket-seal" role="status">
                <strong>SORGULANDI</strong>
                <span>Demo kaydı · 29. hafta · Gölyaka Parseli</span>
              </p>
            )}
            <small>Temsilî demo kaydı</small>
          </aside>

          <div className="hero__round-stamp" aria-hidden="true">
            <span>Baskil</span>
            <strong>23</strong>
            <span>Elazığ</span>
          </div>
        </div>
      </div>

      <nav className="hero__ledger-strip" aria-label="Patik kayıt evrenine hızlı giriş">
        {LEDGER_LINKS.map((item) => (
          <a key={`${item.label}-${item.href}`} href={item.href}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
            <small>{item.note} →</small>
          </a>
        ))}
      </nav>

      <p className="hero__visual-note">
        Görseller yapay zekâ ile üretilmiş temsilî çekimlerdir; gerçek bahçe veya üretici fotoğrafı değildir.
      </p>
    </section>
  );
}
