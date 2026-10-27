import { publicAsset } from "../assets";

export default function Producer() {
  return (
    <section className="section producer" id="uretici" aria-labelledby="uretici-baslik">
      <div className="section__head">
        <p className="kicker">Neden Baskil, neden isim?</p>
        <h2 id="uretici-baslik">Kayısı burada kurur, adı başka yerde satılırdı</h2>
      </div>

      <figure className="producer__banner">
        <div className="producer__frame">
          <img
            src={publicAsset("img/sergi.jpg")}
            className="grade-ink"
            alt="Karakaya Baraj Gölü'ne bakan yamaç teraslarında bezlerle kayısı kurutulan sergi alanı"
            width={1920}
            height={1080}
            loading="lazy"
            data-push="0.07"
          />
        </div>
        <figcaption>
          Karakaya kıyısında sergi zamanı. <span className="img-note">Yapay zekâ ile üretilmiş temsilî görsel; gerçek bir bahçe fotoğrafı değildir.</span>
        </figcaption>
      </figure>

      <div className="producer__grid">
        <div className="producer__story">
          <h3>Bahçe Fırat'a bakar</h3>
          <p>
            Baskil, Elazığ'da kayısının kalbi. Karakaya Baraj Gölü kıyısındaki bahçelerden yüksek
            köylere kadar uzanan üretimde hasat temmuzda başlar; üretilen kayısının büyük bölümü
            kurutmalık olarak değerlendirilir. Kuru yaz havası ve bol güneş, sergideki kayısının
            en büyük ortağıdır.
          </p>
          <h3>Emek görünmezdi</h3>
          <p>
            Baskil'de kuruyan kayısı uzun yıllardır çoğunlukla tüccar üzerinden, başka adlarla
            pazara çıkar. Kutuyu açan kişi kayısının hangi bahçeden geldiğini bilmez; üretici de
            kayısısının kimin sofrasına gittiğini. Patik'in bütün fikri bu kopukluğu onarmak:
            bahçenin adı kutuya, kutunun kaydı da lot pasaportuna yazılır.
          </p>
          <h3>Tescil konusunda açık olalım</h3>
          <p>
            Baskil kayısısı bugün "Malatya Kayısısı" coğrafi işaretinin sınırları içinde anılıyor;
            ilçede Baskil adının ayrıca tanınması için girişimler sürüyor. Patik size bir tescil
            iddiası satmaz. Onun yerine doğrulanabilir bir şey sunar: bu kutu hangi bahçeden,
            hangi hafta, hangi yolla kurutuldu — hepsi lot pasaportunda. Ayrıntı için{" "}
            <a href="#sss">sık sorulanlara</a> bakabilirsiniz.
          </p>
        </div>

        <aside className="producer__card" aria-labelledby="uretici-kart-baslik">
          <img
            src={publicAsset("img/patik.jpg")}
            className="grade-ink"
            alt="Yarı kuru kayısıların çekirdeklerini tepsi başında elle çıkaran üretici elleri"
            width={1200}
            height={800}
            loading="lazy"
          />
          <div className="producer__card-body">
            <p className="producer__card-tag">Temsilî üretici profili · Demo içerik</p>
            <h3 id="uretici-kart-baslik">Fatma &amp; Ali D. — Çavuşlu Köyü</h3>
            <dl className="producer__facts">
              <div><dt>Bahçe</dt><dd>Göle bakan teras bahçeler (temsili)</dd></div>
              <div><dt>Üretim</dt><dd>Gün kurusu + islimli, aile ölçeğinde</dd></div>
              <div><dt>Patik</dt><dd>Aile ve köyden mevsimlik ellerle, tek tek</dd></div>
              <div><dt>Lotları</dt><dd>PT-26-047 · PT-26-112 · PT-26-089</dd></div>
            </dl>
            <blockquote>
              "Kayısıyı kasayla verir, adını bir daha duymazdık. Şimdi kodu okutan, bahçeye
              kadar gidiyor."
              <cite>— Temsilî anlatım (demo için yazılmıştır, gerçek kişi sözü değildir)</cite>
            </blockquote>
            <p className="producer__card-note">
              Bu sayfadaki üretici ismi, bahçe bilgileri, fiyatlar ve lot kayıtları yarışma demosu
              için hazırlanmış <strong>temsili</strong> içeriktir; gerçek kişiler değildir. Ürün ve
              üretim süreçlerine dair genel bilgiler kaynakçadadır (KAYNAKLAR.md).
            </p>
            <a href="#lot-sorgula" className="btn btn--ghost btn--small">Bu üreticinin lotunu sorgula →</a>
          </div>
        </aside>
      </div>
    </section>
  );
}
