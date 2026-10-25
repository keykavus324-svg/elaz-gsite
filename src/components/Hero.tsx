import { goToLot } from "./Products";
import { publicAsset } from "../assets";

const LEDGER_LINKS = [
  { value: "1.800", label: "temsilî kayıt", href: "#saha", note: "Saha Defteri'nde aç" },
  { value: "204", label: "lot satırı", href: "#atlas", note: "Lot Defteri" },
  { value: "365", label: "sezon günü", href: "#evren", note: "Günlüğü gör" },
  { value: "120", label: "ders", href: "#evren", note: "Patik Okulu" },
];

const ROUTE = ["Dal", "Sergi", "Patik", "Çir", "Pasaport"];

export default function Hero() {
  return (
    <section className="hero hero--ledger" id="top" aria-labelledby="hero-baslik">
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
            Kayısı kurur.
            <span className="hero__title-accent">Kaydı kalır.</span>
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

          <p className="hero__etymology">
            <strong>Patik:</strong> Yarı kuru kayısının çekirdeğini tek tek elle çıkarma
            mesaisi. Markanın adı da kaydın özeni de o el emeğinden gelir.
          </p>
        </div>

        <div className="hero__collage" aria-label="Patik görsel vitrini">
          <figure className="hero__photo hero__photo--main">
            <img
              src={publicAsset("img/sergi.jpg")}
              alt="Karakaya kıyısındaki teraslarda bezler üzerinde kuruyan kayısı sergileri"
              width={1600}
              height={1000}
              fetchPriority="high"
            />
            <figcaption>
              <strong>Sergi zamanı</strong>
              <span>Teraslarda güneş mesaisi</span>
            </figcaption>
          </figure>

          <figure className="hero__photo hero__photo--hands">
            <img
              src={publicAsset("img/patik.jpg")}
              alt="Tepsideki yarı kuru kayısıların çekirdeklerini elle çıkaran üretici elleri"
              width={1200}
              height={800}
              loading="eager"
            />
            <figcaption>Patik · tek tek elle</figcaption>
          </figure>

          <aside className="hero__ticket" aria-label="Örnek lot pasaportu bileti">
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
            <button type="button" onClick={() => goToLot("PT-26-047")}>
              Pasaportu aç <span aria-hidden="true">→</span>
            </button>
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
