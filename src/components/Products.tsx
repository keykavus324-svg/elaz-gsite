import { useState } from "react";
import { PRODUCTS, formatTL, type Product } from "../data";
import { useCart } from "../cart";

export function goToLot(code: string) {
  document.getElementById("lot-sorgula")?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.dispatchEvent(new CustomEvent<string>("patik:lot", { detail: code }));
}

function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [sizeId, setSizeId] = useState(product.sizes[0].id);
  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0];

  return (
    <article className="product-card">
      <figure className="product-card__figure">
        <img src={product.img} alt={product.alt} width={1000} height={800} loading="lazy" />
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
      </figure>
      <div className="product-card__body">
        <h3>{product.name}</h3>
        <p className="product-card__short">{product.short}</p>
        <p className="product-card__desc">{product.desc}</p>
        <ul className="tag-list">
          {product.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <div className="size-pills" role="group" aria-label={`${product.name} gramaj seçimi`}>
          {product.sizes.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`size-pill${s.id === size.id ? " is-active" : ""}`}
              aria-pressed={s.id === size.id}
              onClick={() => setSizeId(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="product-card__foot">
          <p className="product-card__price">
            {formatTL(size.price)}
            <small>Demo fiyat</small>
          </p>
          <button type="button" className="btn btn--primary" onClick={() => add(product, size, 1)}>
            Sepete ekle
          </button>
        </div>

        <p className="product-card__lot">
          Lot:{" "}
          {product.lotCodes.map((c, i) => (
            <span key={c}>
              {i > 0 && " · "}
              <button type="button" className="lot-link" onClick={() => goToLot(c)}>
                {c} — pasaportu gör
              </button>
            </span>
          ))}
        </p>
        {product.note && <p className="product-card__note">{product.note}</p>}
      </div>
    </article>
  );
}

export default function Products() {
  return (
    <section className="section products" id="urunler" aria-labelledby="urunler-baslik">
      <div className="section__head">
        <p className="kicker">2026 hasadı · Demo vitrin</p>
        <h2 id="urunler-baslik">Dört kutu, üç lot, sıfır muğlaklık</h2>
        <p className="section__lede">
          Hepsi aynı hasattan. Aralarındaki tek fark, kurutma yolu ve gramaj — ikisi de etikette
          ve lot pasaportunda açıkça yazar. Fiyatlar yarışma demosu için temsili rakamlardır.
        </p>
      </div>
      <div className="products__grid">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
