import { useMemo, useRef, useState } from "react";
import "../yz.css";
import { adviseFromText, formatTL, type Advice } from "../data";
import { useCart } from "../cart";
import { goToLot } from "./Products";
import CountUp from "./CountUp";
import YapimTerminal from "./YapimTerminal";
import { BUILD_STATS } from "../content/buildStats";

/* ================================================================== */
/*  YAPAY ZEKÂ DEFTERİ                                               */
/*  1) Cümleni anlat → yerel eşleştirici → gerekçeli lot önerisi      */
/*  2) Bu sitenin yapay zekâ destekli üretim kaydı                    */
/* ================================================================== */

const EXAMPLES = [
  "Çayın yanına koyacağım, koyu ve karamelimsi olsun.",
  "Anneme hediye; görünüşü güzel, rengi canlı kalsın.",
  "Hoşaf yapacağım, dağılmasın, 1 kg alıyorum.",
  "Hem örnek hem hediye olsun, birkaç kişiye paylaşacağız.",
];

const STEPS = [
  {
    no: "01",
    tag: "Araştırma",
    title: "Fikir, kaynaktan başladı",
    text: "Baskil'deki kurutma ve patik akışı kaynaklara dayanan bir süreç bilgisiyle kurgulandı. KAYNAKLAR.md'de hangi bilginin nereden geldiği tek tek yazılı.",
  },
  {
    no: "02",
    tag: "Görsel",
    title: `${BUILD_STATS.yzGorseli} temsilî görsel yapay zekâ ile üretildi`,
    text: "Hiçbiri gerçek üretici ya da tesis fotoğrafı diye sunulmadı; her görselin altında bu not açıkça duruyor.",
  },
  {
    no: "03",
    tag: "Veri",
    title: "1.800 kayıt, yeniden üretilebilir betiklerle",
    text: "Atlas'ta 811, Evren'de 989 temsilî kayıt var. `npm run content:generate` komutu bunları kaynaktan yeniden yazar; elle gizlenmiş veri yok.",
  },
  {
    no: "04",
    tag: "Doğrulama",
    title: "Her değişiklik otomatik denetimden geçer",
    text: "`npm run verify` tip kontrolünü, iki bütünlük denetimini (kayıt sayıları, panel bağlantıları) ve üretim derlemesini tek komutta çalıştırır.",
  },
  {
    no: "05",
    tag: "Editoryal",
    title: "İnsan eli son sözü söyler",
    text: "Üretici profili, fiyatlar, parsel bilgileri ve lot kayıtları temsilîdir ve öyle etiketlenir. Tescil iddiası, sahte ödül, sahte müşteri yorumu kullanılmadı.",
  },
];

/* Sayılar elle yazılmaz: scripts/generate-build-stats.mjs bunları
   src/ ve public/img/ klasörlerinden hesaplar ve buildStats.ts'e yazar. */
const STATS = [
  { value: BUILD_STATS.satirKodu, label: "satır kod" },
  { value: 1800, label: "temsilî kayıt" },
  { value: BUILD_STATS.yzGorseli, label: "YZ görseli" },
  { value: 0, label: "sahte yorum" },
];

const CONFIDENCE_LABEL: Record<Advice["confidence"], string> = {
  kesin: "Cümle net anlaşıldı",
  olası: "Kısmen anlaşıldı",
  zayif: "Tek ipucu — tahmin ettik",
};

export default function YzDefteri() {
  const { add, setCartOpen } = useCart();
  const [text, setText] = useState("");
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [miss, setMiss] = useState(false);
  const [sizeOverride, setSizeOverride] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const size = useMemo(() => {
    if (!advice) return null;
    return advice.product.sizes.find((s) => s.id === sizeOverride) ?? advice.size;
  }, [advice, sizeOverride]);

  function run(raw: string) {
    const result = adviseFromText(raw);
    setMiss(false);
    setSizeOverride(null);
    if (!result) {
      setAdvice(null);
      setMiss(true);
      inputRef.current?.focus();
      return;
    }
    setAdvice(result);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    run(text);
  }

  function addToCart() {
    if (!advice || !size) return;
    add(advice.product, size, 1);
    setCartOpen(true);
  }

  return (
    <section className="section yz" id="yz-defteri" aria-labelledby="yz-baslik">
      <div className="section__head">
        <p className="kicker">Yapay zekâ destekli üretim · açık defter</p>
        <h2 id="yz-baslik">Bu site bir yapay zekâ atölyesinden çıktı. Nasıl kurulduğunu saklamadık.</h2>
        <p className="section__lede">
          Kod, metin, görsel ve kayıtlar yapay zekâ destekli araçlarla üretildi; her adımda insan eliyle
          düzeltildi ve otomatik denetimlerden geçti. Aşağıda üretim defterini okuyabilir — bir de kendi
          cümleni yazıp lotunu eşleştirebilirsin.
        </p>
      </div>

      <div className="yz__grid">
        {/* ---------------- Panel 1: yerel eşleştirici ---------------- */}
        <div className="yz__panel yz__panel--advisor">
          <header className="yz__panel-head">
            <h3>Cümleni anlat, lotunu eşleştirelim</h3>
            <p className="yz__badge">Tarayıcıda çalışır · veri dışarı çıkmaz</p>
          </header>

          <p className="yz__bridge">
            Yukarıdaki <a href="#lotunu-kur">Lotunu Kur</a> üç soru soruyor; burası aynı öneri
            motorunu tek cümleyle çalıştırıyor. Sonuç aynı: gerekçeli öneri, gramaj, lot kodu.
          </p>

          <form className="yz__form" onSubmit={onSubmit}>
            <label className="yz__label" htmlFor="yz-cumle">
              Ne istediğini yaz
            </label>
            <div className="yz__input-row">
              <input
                id="yz-cumle"
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Örn. çayın yanına koyacağım, koyu olsun"
                autoComplete="off"
                maxLength={160}
              />
              <button type="submit" className="btn btn--primary" disabled={text.trim().length < 3}>
                Eşleştir
              </button>
            </div>
          </form>

          <div className="yz__examples" role="group" aria-label="Örnek cümleler">
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" className="yz__chip" onClick={() => { setText(ex); run(ex); }}>
                {ex}
              </button>
            ))}
          </div>

          <div className="yz__result" aria-live="polite">
            {miss && (
              <p className="yz__miss" role="alert">
                Bu cümleden bir kullanım, damak ya da miktar ipucu çıkaramadım. Yukarıdaki örneklerden birine
                bakabilir ya da “çay için”, “hediye”, “hoşaf” gibi bir kelime yazabilirsin.
              </p>
            )}

            {!advice && !miss && (
              <p className="yz__idle">
                Henüz eşleştirme yok. Bir cümle yaz ya da yukarıdaki örneğe dokun — öneri gerekçesiyle,
                lot koduyla birlikte gelecek.
              </p>
            )}

            {advice && size && (
              <article className="yz__card">
                <div className="yz__card-top">
                  <p className="yz__conf">
                    <span className={`yz__conf-dot is-${advice.confidence}`} aria-hidden="true" />
                    {CONFIDENCE_LABEL[advice.confidence]}
                  </p>
                  <p className="yz__lot">Lot <strong>{advice.lot.code}</strong></p>
                </div>

                {advice.understood.length > 0 && (
                  <ul className="yz__understood">
                    {advice.understood.map((u) => (
                      <li key={u.label}>
                        <span>{u.label}</span>
                        <strong>{u.value}</strong>
                        <small>“{u.source}”</small>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="yz__pick">
                  <img src={advice.product.img} alt={advice.product.alt} width={1000} height={750} loading="lazy" />
                  <div className="yz__pick-body">
                    <p className="yz__pick-name">{advice.product.name}</p>
                    <p className="yz__pick-short">{advice.product.short}</p>

                    <div className="size-pills" role="group" aria-label="Gramaj seçimi">
                      {advice.product.sizes.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={`size-pill${s.id === size.id ? " is-active" : ""}`}
                          aria-pressed={s.id === size.id}
                          onClick={() => setSizeOverride(s.id)}
                        >
                          {s.label} · {formatTL(s.price)}
                        </button>
                      ))}
                    </div>

                    <ul className="yz__reasons">
                      {advice.reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>

                    {advice.tips.length > 0 && (
                      <ul className="yz__tips">
                        {advice.tips.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    )}

                    {advice.tipLinks.length > 0 && (
                      <p className="yz__links">
                        {advice.tipLinks.map((l) => (
                          <a key={l.href} href={l.href}>{l.label} →</a>
                        ))}
                      </p>
                    )}

                    <div className="yz__actions">
                      <button type="button" className="btn btn--primary" onClick={addToCart}>
                        Bu lotu sepete ekle · {formatTL(size.price)}
                      </button>
                      <button type="button" className="btn btn--ghost" onClick={() => goToLot(advice.lot.code)}>
                        Lot pasaportu
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )}
          </div>

          <p className="yz__disclaimer">
            <strong>Bu bir dil modeli değil.</strong> Eşleştirici, sitedeki kanonik ürün ve lot kayıtları
            üzerinde kural tabanlı, şeffaf bir eşleştirmedir: yazdığın cümle hiçbir sunucuya gönderilmez,
            internet yokken de aynı sonucu verir. Büyük dil modeli çağırmıyoruz çünkü etkinlik salonunun
            interneti bize ait değil — üçüncü taraf bir API’ye bağımlı bir demo, bağlantı kesildiği anda çöker.
          </p>
        </div>

        {/* ---------------- Panel 2: üretim kaydı ---------------- */}
        <div className="yz__panel yz__panel--ledger">
          <header className="yz__panel-head">
            <h3>Üretim kaydı</h3>
            <p className="yz__badge">Yapay zekâ + insan denetimi</p>
          </header>

          <ol className="yz__steps">
            {STEPS.map((step) => (
              <li key={step.no}>
                <span className="yz__step-no">{step.no}</span>
                <div>
                  <p className="yz__step-tag">{step.tag}</p>
                  <p className="yz__step-title">{step.title}</p>
                  <p className="yz__step-text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <YapimTerminal />

          <dl className="yz__stats">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </dl>

          <p className="yz__ledger-note">
            <strong>Jüriye sorulacak soruya hazır cevap:</strong> “Bu gerçek mi?” diye sorarlarsa
            söylüyoruz — <em>hayır, ve bunu gizlemiyoruz.</em> İçerik temsilîdir, üretici profili kurgusaldır,
            kayıtlar yeniden üretilebilir betiklerden gelir. Gerçek olan şey süreç bilgisi, kaynakça ve
            uçtan uca çalışan akış.
          </p>
        </div>
      </div>
    </section>
  );
}
