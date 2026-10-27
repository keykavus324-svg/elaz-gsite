import { publicAsset } from "../assets";
import MaskText from "./MaskText";

/**
 * STATEMENT BAND — "Gece Sergisi" öncesi tam genişlik editoryal bant.
 *
 * Pinterest referanslarının en güçlü hamlelerinden biri: koyu, sıcak bir fotoğrafın
 * üstünden geçen dev display serif. Burada fotoğraf Baskil'in sergi bandı; yazı ise
 * markanın sloganı. Görsel yapay zekâ ile üretilmiş temsilî bir çekimdir ve
 * bunu bantta açıkça yazıyoruz.
 */
export default function Bant() {
  return (
    <section className="bant" aria-label="Bahçeden kutuna, lotuyla">
      <img
        className="bant__img"
        data-parallax="0.24"
        data-push="0.05"
        src={publicAsset("img/band-bahce.jpg")}
        alt="Baskil sergi bandında gün kurusu kayısılarının yayıldığı basamaklar, akşam ışığında"
        width={1376}
        height={768}
        loading="lazy"
        decoding="async"
      />
      <div className="bant__scrim" aria-hidden="true" />

      <div className="bant__inner">
        <p className="bant__label">
          <span aria-hidden="true">✦</span> Patik · Baskil kayısı atölyesi · 2026 hasadı
        </p>

        <MaskText
          as="h2"
          className="bant__title"
          lines={["Bahçeden", <><em>kutuna,</em> lotuyla.</>]}
        />

        <p className="bant__script" aria-hidden="true">
          gün kurur, kaydı kalır
        </p>

        <div className="bant__foot">
          <p className="bant__lede">
            Buradaki her kutu tek bir bahçeden, tek bir kurutma partisinden dolar. Kapağındaki
            kodu yazınca bahçe, hasat haftası, kurutma yolu ve patik günü açılır — işte
            {" "}
            <strong>izlenebilirliğin</strong> görünümü.
          </p>
          <a className="bant__btn" href="#lot-sorgula">
            Lot sorgula <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <p className="bant__credit">Sergi bandı — yapay zekâ ile üretilmiş temsilî çekimdir.</p>
    </section>
  );
}
