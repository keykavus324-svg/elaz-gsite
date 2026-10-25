import { useMemo, useState } from "react";
import { PRODUCTS, type Product, type SizeOption } from "../../data";
import { useCart } from "../../cart";
import {
  GIFT_BUDGET_BANDS,
  GIFT_OCCASIONS,
  GIFT_RECIPIENTS,
  GIFT_SCENARIOS,
  type GiftScenario,
} from "../../content/giftScenarios";
import {
  UniEmpty,
  UniField,
  UniPagination,
  UniResultMeta,
  UniStat,
  universeMatches,
  universeNumber,
} from "./shared";

function resolveProduct(scenario: GiftScenario): { product: Product; size: SizeOption } {
  const product = PRODUCTS.find((item) => item.id === scenario.productId) ?? PRODUCTS[0];
  const size = product.sizes.find((item) => item.id === scenario.sizeId) ?? product.sizes[0];
  return { product, size };
}

export default function GiftStudio() {
  const { add, setCartOpen } = useCart();
  const [query, setQuery] = useState("");
  const [occasion, setOccasion] = useState("all");
  const [recipient, setRecipient] = useState("all");
  const [budget, setBudget] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(GIFT_SCENARIOS[0]?.id ?? "");
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [copyMessage, setCopyMessage] = useState("");

  const filtered = useMemo(
    () =>
      GIFT_SCENARIOS.filter((scenario) => {
        if (occasion !== "all" && scenario.occasion !== occasion) return false;
        if (recipient !== "all" && scenario.recipient !== recipient) return false;
        if (budget !== "all" && scenario.budgetBand !== budget) return false;
        return universeMatches(
          [scenario.headline, scenario.occasion, scenario.recipient, scenario.productName, scenario.noteTone, ...scenario.tags].join(" "),
          query
        );
      }),
    [budget, occasion, query, recipient]
  );

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const selected = filtered.find((scenario) => scenario.id === selectedId) ?? visible[0] ?? filtered[0];
  const resolved = selected ? resolveProduct(selected) : null;

  const finalNote = useMemo(() => {
    if (!selected) return "";
    const greeting = recipientName.trim() ? `Sevgili ${recipientName.trim()},` : "Merhaba,";
    const closing = senderName.trim() ? `\n\nSevgiler,\n${senderName.trim()}` : "\n\nSevgiler";
    return `${greeting}\n\n${selected.noteTemplate}${closing}`;
  }, [recipientName, selected, senderName]);

  function updateFilter<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
      setCopyMessage("");
    };
  }

  function chooseScenario(scenario: GiftScenario) {
    setSelectedId(scenario.id);
    setQuantity(1);
    setCopyMessage("");
  }

  async function copyNote() {
    if (!finalNote) return;
    try {
      await navigator.clipboard.writeText(finalNote);
      setCopyMessage("Hediye notu panoya kopyalandı.");
    } catch {
      setCopyMessage("Otomatik kopyalanamadı; kutudaki metni seçip kopyalayabilirsin.");
    }
  }

  function addSelectedToCart() {
    if (!resolved || !selected) return;
    add(resolved.product, resolved.size, quantity);
    setCopyMessage(`${quantity} kutu demo sepetine eklendi. Hediye notu burada saklanmıyor; istersen ayrıca kopyala.`);
  }

  const distinctProducts = new Set(filtered.map((scenario) => scenario.productId)).size;
  const minimumPrice = filtered.length ? Math.min(...filtered.map((scenario) => scenario.demoPrice)) : 0;
  const maximumPrice = filtered.length ? Math.max(...filtered.map((scenario) => scenario.demoPrice)) : 0;

  return (
    <div className="uni-panel">
      <div className="uni-stats">
        <UniStat value={universeNumber.format(filtered.length)} label="hediye senaryosu" />
        <UniStat value={String(distinctProducts)} label="ürün ailesi" />
        <UniStat value={filtered.length ? `₺${minimumPrice}–${maximumPrice}` : "—"} label="demo fiyat aralığı" />
        <UniStat value="6" label="not ve sunum alanı" hint="kişiselleştirilebilir" />
      </div>

      <div className="uni-toolbar uni-toolbar--gifts">
        <UniField label="Senaryo ara">
          <input type="search" value={query} onChange={(event) => updateFilter(setQuery)(event.target.value)} placeholder="Örn. teşekkür, çay, hikâye" />
        </UniField>
        <UniField label="Vesile">
          <select value={occasion} onChange={(event) => updateFilter(setOccasion)(event.target.value)}>
            <option value="all">Tüm vesileler</option>
            {GIFT_OCCASIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </UniField>
        <UniField label="Alan kişi">
          <select value={recipient} onChange={(event) => updateFilter(setRecipient)(event.target.value)}>
            <option value="all">Tüm profiller</option>
            {GIFT_RECIPIENTS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </UniField>
        <UniField label="Bütçe bandı">
          <select value={budget} onChange={(event) => updateFilter(setBudget)(event.target.value)}>
            <option value="all">Tümü</option>
            {GIFT_BUDGET_BANDS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </UniField>
      </div>

      <UniResultMeta shown={visible.length} total={filtered.length} unit="senaryo" />

      {filtered.length === 0 || !selected || !resolved ? (
        <UniEmpty title="Hediye senaryosu bulunamadı" text="Vesile veya bütçe filtresini genişlet; her vesile için on alıcı profili vardır." />
      ) : (
        <div className="uni-split">
          <div>
            <div className="uni-card-grid uni-card-grid--gifts">
              {visible.map((scenario) => (
                <article key={scenario.id} className={`uni-card${selected.id === scenario.id ? " is-selected" : ""}`}>
                  <div className="uni-card__topline"><span>{scenario.budgetBand}</span><em>₺{scenario.demoPrice} demo</em></div>
                  <h3>{scenario.headline}</h3>
                  <p>{scenario.recipient} · {scenario.sizeLabel}</p>
                  <p className="uni-card__hint">{scenario.noteTone} bir not ve {scenario.lotStoryAngle.toLocaleLowerCase("tr-TR")}</p>
                  <div className="uni-tags">{scenario.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
                  <button type="button" className="btn btn--small btn--ghost" onClick={() => chooseScenario(scenario)}>
                    Senaryoyu aç
                  </button>
                </article>
              ))}
            </div>
            <UniPagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>

          <aside className="uni-detail" aria-labelledby="uni-gift-title">
            <p className="uni-widget__kicker">{selected.occasion} · {selected.recipient}</p>
            <h3 id="uni-gift-title">{selected.headline}</h3>
            <div className="uni-gift-product">
              <img src={resolved.product.img} alt={resolved.product.alt} width={640} height={430} loading="lazy" />
              <div>
                <strong>{resolved.product.name} · {resolved.size.label}</strong>
                <span>₺{resolved.size.price} temsilî demo fiyat</span>
                <p>{resolved.product.short}</p>
              </div>
            </div>

            <dl className="uni-detail-dl">
              <div><dt>Sunum</dt><dd>{selected.presentation}</dd></div>
              <div><dt>Yanına</dt><dd>{selected.pairing}</dd></div>
              <div><dt>Lot hikâyesi</dt><dd>{selected.lotStoryAngle}</dd></div>
              <div><dt>Not tonu</dt><dd>{selected.noteTone}</dd></div>
            </dl>

            <div className="uni-form-grid">
              <UniField label="Alan kişinin adı (isteğe bağlı)">
                <input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} placeholder="Örn. Ayşe" autoComplete="off" />
              </UniField>
              <UniField label="İmzan (isteğe bağlı)">
                <input value={senderName} onChange={(event) => setSenderName(event.target.value)} placeholder="Örn. Deniz" autoComplete="off" />
              </UniField>
            </div>

            <UniField label="Hazır hediye notu">
              <textarea className="uni-note-input" value={finalNote} readOnly rows={8} />
            </UniField>

            <div className="uni-gift-actions">
              <UniField label="Adet">
                <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
                  {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </UniField>
              <button type="button" className="btn btn--small btn--primary" onClick={addSelectedToCart}>
                Demo sepetine ekle
              </button>
              <button type="button" className="btn btn--small btn--ghost" onClick={() => void copyNote()}>
                Notu kopyala
              </button>
              <button type="button" className="btn btn--small btn--ghost" onClick={() => setCartOpen(true)}>
                Sepeti aç
              </button>
            </div>

            {copyMessage && <p className="uni-note" role="status">{copyMessage}</p>}
            <p className="uni-note"><strong>Dikkat:</strong> {selected.caution}</p>
            <p className="uni-note uni-note--soft">Not ve isim alanları sunucuya gönderilmez; ad yalnızca bu ekrandaki önizlemede kullanılır.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
