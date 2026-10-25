import { useEffect, useRef, type MouseEvent } from "react";
import { goToLot } from "./Products";

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el) return;
        const y = Math.min(window.scrollY, 900);
        el.style.setProperty("--hero-y", `${y * 0.16}px`);
        el.style.setProperty("--hero-scale", `${1.04 + y * 0.00008}`);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
    };
  }, []);

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--mx", x.toFixed(3));
    el.style.setProperty("--my", y.toFixed(3));
  }

  return (
    <section
      ref={sectionRef}
      className="hero hero--cinematic"
      id="top"
      aria-labelledby="hero-baslik"
      onMouseMove={handleMouseMove}
    >
      <figure className="hero__media" aria-hidden="false">
        <img
          src="/img/studio-hero.jpg"
          alt="Açık renk stüdyo fonunda havada süzülen parlak kuru kayısılar ve kayısı çekirdeği içleri"
          width={1600}
          height={1000}
          fetchPriority="high"
        />
        <span className="hero__shade" aria-hidden="true" />
      </figure>

      <div className="hero__content">
        <p className="hero__eyebrow">
          <span aria-hidden="true" />
          Baskil · Elazığ · 2026 hasadı
        </p>
        <p className="hero__product">PATİK</p>
        <h1 id="hero-baslik" className="hero__title">
          Baskil'de kurudu.
          <span className="hero__title-accent">Adıyla geldi.</span>
        </h1>
        <p className="hero__sub">
          Kayısı tek bahçeden kutuya girer. Hasat haftası, kurutma yolu ve patik günü
          lot pasaportunda seninle gelir.
        </p>

        <div className="hero__ctas">
          <a href="#lotunu-kur" className="btn btn--primary btn--large">
            Lotunu Kur <span aria-hidden="true">→</span>
            <span className="btn__hint">30 saniye</span>
          </a>
          <a href="#film" className="btn btn--ghost btn--large">
            Hikâyeyi izle <span aria-hidden="true">↓</span>
          </a>
        </div>

        <ul className="hero__metrics" aria-label="Patik deneyiminin özeti">
          <li>
            <strong>3</strong>
            <span>soruda sana uyan kutu</span>
          </li>
          <li>
            <strong>2</strong>
            <span>kurutma karakteri</span>
          </li>
          <li>
            <strong>1</strong>
            <span>kutuda lot pasaportu</span>
          </li>
        </ul>

        <p className="hero__etymology">
          <strong>Patik:</strong> Baskil'de yarı kuru kayısının çekirdeğini tek tek elle
          çıkarma mesaisi. Markanın adı, o el emeğinden.
        </p>
      </div>

      <aside className="hero__passport" aria-label="Örnek lot pasaportu önizlemesi">
        <div className="hero__passport-head">
          <span>LOT PASAPORTU</span>
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
            <dt>Kurutma</dt>
            <dd>Gün kurusu · 5 gün</dd>
          </div>
        </dl>
        <button type="button" onClick={() => goToLot("PT-26-047")}>
          Canlı pasaportu aç <span aria-hidden="true">→</span>
        </button>
        <small>Temsilî demo kaydı</small>
      </aside>

      <a className="hero__scroll" href="#film" aria-label="Hikâye bölümüne kaydır">
        <span>Keşfetmek için kaydır</span>
        <i aria-hidden="true" />
      </a>

      <p className="hero__visual-note">Stüdyo görseli: yapay zekâ ile üretilmiş temsilî çekim</p>
    </section>
  );
}
