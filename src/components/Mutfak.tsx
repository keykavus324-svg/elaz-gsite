import { useMemo, useState } from "react";
import { PRODUCTS, SEASONS, hosafFor } from "../data";
import { useCart } from "../cart";
import { publicAsset } from "../assets";

export default function Mutfak() {
  const { add } = useCart();
  const [seasonId, setSeasonId] = useState(SEASONS[2].id);
  const season = SEASONS.find((s) => s.id === seasonId) ?? SEASONS[0];

  const [persons, setPersons] = useState(4);
  const [kind, setKind] = useState<"islimli" | "gun">("islimli");
  const h = useMemo(() => hosafFor(persons, kind), [persons, kind]);
  const product = PRODUCTS.find((p) => p.id === (kind === "islimli" ? "islimli" : "gun-kurusu"))!;
  const pack = product.sizes[0]; // 500 g

  return (
    <section className="section mutfak" id="mutfak" aria-labelledby="mutfak-baslik">
      <div className="section__head">
        <p className="kicker">Mevsim &amp; mutfak</p>
        <h2 id="mutfak-baslik">Bir kayısının yılı, bir kasenin hesabı</h2>
        <p className="section__lede">
          Kutunun içindeki lezzet tek bir yazın değil, koca bir yılın işi. Mevsimleri gez,
          sonra hoşaf için kaç kişilik hesap yapalım diye bize sor.
        </p>
      </div>

      <div className="mutfak__grid">
        {/* -------- Mevsim takvimi -------- */}
        <div className="season-card">
          <div className="season-chips" role="group" aria-label="Mevsim seçimi">
            {SEASONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`season-chip${s.id === seasonId ? " is-active" : ""}`}
                aria-pressed={s.id === seasonId}
                onClick={() => setSeasonId(s.id)}
              >
                <span className="season-chip__chip">{s.chip}</span>
                <span className="season-chip__name">{s.name}</span>
              </button>
            ))}
          </div>
          <figure className="season-panel" key={season.id} aria-live="polite">
            <img src={season.img} alt={season.alt} width={1400} height={900} loading="lazy" />
            <figcaption>
              <strong>{season.name}</strong>
              <span>{season.text}</span>
            </figcaption>
          </figure>
        </div>

        {/* -------- Hoşaf hesapçısı -------- */}
        <div className="hosaf-card">
          <img src={publicAsset("img/hosaf.jpg")} alt="Cam kasede altın rengi kayısı hoşafı" width={1200} height={800} loading="lazy" className="hosaf-card__img" />
          <div className="hosaf-card__body">
            <h3>Hoşaf Hesapçısı</h3>
            <p className="hosaf-card__sub">Patik mutfağının ölçüsü: kişi sayısını seç, gerisini biz hesaplayalım.</p>

            <div className="size-pills" role="group" aria-label="Kayısı türü">
              <button type="button" className={`size-pill${kind === "islimli" ? " is-active" : ""}`} aria-pressed={kind === "islimli"} onClick={() => setKind("islimli")}>
                İslimliyle (klasik)
              </button>
              <button type="button" className={`size-pill${kind === "gun" ? " is-active" : ""}`} aria-pressed={kind === "gun"} onClick={() => setKind("gun")}>
                Gün kurusuyla (koyu &amp; yoğun)
              </button>
            </div>

            <label className="hosaf-card__slider-label" htmlFor="kisi-aralik">
              Kaç kişilik? <strong>{persons} kişi</strong>
            </label>
            <input
              id="kisi-aralik"
              type="range"
              min={1}
              max={12}
              step={1}
              value={persons}
              onChange={(e) => setPersons(Number(e.target.value))}
              className="hosaf-card__slider"
              aria-valuetext={`${persons} kişilik`}
            />

            <dl className="hosaf-card__results" aria-live="polite">
              <div><dt>Kuru kayısı</dt><dd><strong>{h.grams} g</strong> <span>≈ {h.pieces} adet</span></dd></div>
              <div><dt>Su</dt><dd><strong>{h.waterMl.toLocaleString("tr-TR")} ml</strong> <span>≈ {Math.round((h.waterMl / 200) * 10) / 10} su bardağı</span></dd></div>
              <div><dt>Şeker (isteğe bağlı)</dt><dd><strong>{h.sugarTsp} tatlı kaşığı</strong> <span>şekersiz de olur, tat kayısıda</span></dd></div>
              <div><dt>Pişirme</dt><dd>Kaynamaya başlayınca <strong>12–15 dk</strong> kısık; soğuyunca dolaba</dd></div>
            </dl>

            <div className="hosaf-card__cta">
              <p>
                Bu hesap için {h.packs500} × 500 g <strong>{product.name}</strong> paketi gerekir
                {h.packs500 === 1 ? ` (bir paket ${Math.floor(500 / (kind === "islimli" ? 45 : 40))} kişiye kadar yeter)` : ""}.
              </p>
              <button type="button" className="btn btn--primary" onClick={() => add(product, pack, h.packs500)}>
                {h.packs500} paket sepete ekle
              </button>
            </div>
            <p className="hosaf-card__tip">
              Usta ipucu: hoşaf bir gece dolapta beklerse kayısı suyunu iyice salıp parlar; üstüne
              birkaç çekirdek içi serpmek Baskil usulü son dokunuștur (çekirdekte ölçü: günde birkaç adet).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
