export default function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-baslik">
      <div className="hero__text">
        <p className="kicker">Baskil · Elazığ — 2026 hasadı, demo lotlar</p>
        <h1 id="hero-baslik" className="hero__title">
          Baskil'de kurudu.
          <span className="hero__title-accent">Adıyla, lotuyla gelsin.</span>
        </h1>
        <p className="hero__sub">
          Patik, Baskil bahçelerinden gün kurusu ve islimli kayısıyı aracısız kutular.
          Her kutuda bahçenin, hasat haftasının ve kurutma geçmişinin yazılı olduğu bir{" "}
          <strong>lot pasaportu</strong> bulursun. Gün mü islim mi, sana göre olanı 3 soruda bulalım.
        </p>
        <div className="hero__ctas">
          <a href="#lotunu-kur" className="btn btn--primary btn--large">
            Lotunu Kur <span aria-hidden="true">→</span>
            <span className="btn__hint">30 saniye</span>
          </a>
          <a href="#karsilastir" className="btn btn--ghost btn--large">Gün mü islim mi? Farkı gör</a>
        </div>
        <ul className="hero__chips" aria-label="Öne çıkanlar">
          <li>Her kutuda lot pasaportu</li>
          <li>İslimli / gün kurusu ayrımı etikette açık</li>
          <li>Çekirdek de ziyan olmaz</li>
        </ul>
        <p className="hero__etymology">
          <strong>Patik ne demek?</strong> Baskil'de yarı kuru kayısının çekirdeğini tek tek elle çıkarma
          mesaisine patik denir. Markanın adı, o el emeğinden gelir.
        </p>
      </div>

      <figure className="hero__figure">
        <img
          src="/img/hero.jpg"
          alt="Ahşap kasadan keten bez üzerine dökülen gün kurusu ve islimli kayısılar ile kayısı çekirdeği içleri"
          width={1440}
          height={960}
          fetchPriority="high"
        />
        <figcaption className="hero__stamp" aria-hidden="true">
          <span>2026 HASADI</span>
          <span>BASKİL · ELAZIĞ</span>
        </figcaption>
        <figcaption className="hero__caption">
          Aynı hasat, iki karakter: soldaki koyular gün kurusu, parlaklar islimli. <span className="img-note">Görsel: Yapay zekâ ile üretilmiş temsilî çekim</span>
        </figcaption>
      </figure>
    </section>
  );
}
