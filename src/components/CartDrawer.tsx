import { useEffect, useRef, useState } from "react";
import { useCart, type CartItem } from "../cart";
import { FREE_SHIPPING_LIMIT, formatTL } from "../data";
import { goToLot } from "./Products";

type View = "cart" | "form" | "done";

interface FormState {
  name: string;
  phone: string;
  city: string;
  address: string;
  note: string;
}

interface DoneSnapshot {
  no: string;
  name: string;
  items: CartItem[];
  total: number;
  shipping: number;
  subtotal: number;
}

const EMPTY: FormState = { name: "", phone: "", city: "", address: "", note: "" };

function validate(f: FormState): Partial<Record<keyof FormState, string>> {
  const errs: Partial<Record<keyof FormState, string>> = {};
  if (f.name.trim().length < 3) errs.name = "Ad soyadınızı yazın (en az 3 karakter).";
  const digits = f.phone.replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "");
  if (!/^5\d{9}$/.test(digits)) errs.phone = "Telefonu 05xx xxx xx xx biçiminde yazın.";
  if (f.city.trim().length < 2) errs.city = "Teslimat şehrini yazın.";
  if (f.address.trim().length < 10) errs.address = "Açık adresi detaylandırın (mahalle, sokak, kapı no).";
  return errs;
}

export default function CartDrawer() {
  const { items, setQty, remove, clear, subtotal, shipping, total, cartOpen, setCartOpen } = useCart();
  const [view, setView] = useState<View>("cart");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [done, setDone] = useState<DoneSnapshot | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!cartOpen) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartOpen]);

  function close() {
    setCartOpen(false);
    window.setTimeout(() => {
      setView("cart");
      setErrors({});
    }, 250);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    const firstKey = (Object.keys(errs) as Array<keyof FormState>)[0];
    if (firstKey) {
      document.getElementById(`field-${firstKey}`)?.focus();
      return;
    }
    const no = `PT-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
    setDone({ no, name: form.name.trim(), items: [...items], total, shipping, subtotal });
    setView("done");
    clear();
    setForm(EMPTY);
  }

  function field(key: keyof FormState, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <div className="form-field">
        <label htmlFor={`field-${key}`}>{label}</label>
        <input
          id={`field-${key}`}
          value={form[key]}
          onChange={(e) => {
            setForm((f) => ({ ...f, [key]: e.target.value }));
            setErrors((er) => ({ ...er, [key]: undefined }));
          }}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? `err-${key}` : undefined}
          {...props}
        />
        {errors[key] && (
          <p id={`err-${key}`} className="form-error" role="alert">{errors[key]}</p>
        )}
      </div>
    );
  }

  if (!cartOpen) return null;

  const remaining = Math.max(0, FREE_SHIPPING_LIMIT - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_LIMIT) * 100);

  return (
    <div className="drawer-wrap" role="presentation" onClick={close}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-baslik"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer__head">
          <h2 id="drawer-baslik">
            {view === "done" ? "Demo sipariş özeti" : view === "form" ? "Teslimat bilgileri (demo)" : "Sepetin"}
          </h2>
          <button ref={closeRef} type="button" className="drawer__close" onClick={close} aria-label="Sepeti kapat">
            ✕
          </button>
        </header>

        {view === "done" && done ? (
          <div className="drawer__body done-view">
            <p className="done-view__badge">Bu bir yarışma demosudur — gerçek sipariş ve ödeme alınmamıştır.</p>
            <h3>Teşekkürler {done.name.split(" ")[0]}, demo siparişin oluşturuldu.</h3>
            <p className="done-view__no">Sipariş no: <strong>{done.no}</strong></p>
            <ul className="done-view__items">
              {done.items.map((i) => (
                <li key={i.key}>
                  <span>{i.qty} × {i.name} · {i.sizeLabel}</span>
                  <span>{formatTL(i.unitPrice * i.qty)}</span>
                </li>
              ))}
              <li><span>Kargo</span><span>{done.shipping === 0 ? "Ücretsiz" : formatTL(done.shipping)}</span></li>
              <li className="done-view__total"><span>Genel toplam</span><span>{formatTL(done.total)}</span></li>
            </ul>
            <div className="done-view__lots">
              <p>Kutularına işlenecek lot kodları:</p>
              <ul>
                {Array.from(new Set(done.items.flatMap((i) => i.lotCodes))).map((c) => (
                  <li key={c}>
                    <button type="button" className="lot-link" onClick={() => { close(); goToLot(c); }}>
                      {c} — pasaportu gör
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <p className="done-view__note">
              Formda yazdığınız bilgiler hiçbir yere gönderilmedi; tarayıcınızda bile saklanmadı.
              Gerçek bir projede bu adımda güvenli ödeme ve sipariş onayı yer alırdı.
            </p>
            <button type="button" className="btn btn--primary" onClick={close}>Alışverişe dön</button>
          </div>
        ) : items.length === 0 && view === "cart" ? (
          <div className="drawer__body drawer__empty">
            <p className="drawer__empty-big">Sepet şimdilik boş</p>
            <p>Henüz bir lot seçmedin. 30 saniyede sana uyan kutuyu kuralım mı?</p>
            <a href="#lotunu-kur" className="btn btn--primary" onClick={close}>Lotunu Kur →</a>
            <a href="#urunler" className="btn btn--ghost" onClick={close}>Ürünlere bak</a>
          </div>
        ) : (
          <>
            <div className="drawer__body">
              {view === "cart" && (
                <>
                  <div className="ship-progress" aria-live="polite">
                    {remaining > 0 ? (
                      <p>Ücretsiz kargoya <strong>{formatTL(remaining)}</strong> kaldı (demo kuralı: {formatTL(FREE_SHIPPING_LIMIT)} ve üzeri ücretsiz).</p>
                    ) : (
                      <p>Kargon ücretsiz oldu. İyi bir sergi günü gibi.</p>
                    )}
                    <div className="ship-progress__bar" aria-hidden="true">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <ul className="cart-items">
                    {items.map((i) => (
                      <li key={i.key} className="cart-item">
                        <img src={i.img} alt="" width={72} height={72} loading="lazy" />
                        <div className="cart-item__info">
                          <p className="cart-item__name">{i.name} <span>· {i.sizeLabel}</span></p>
                          <p className="cart-item__lot">Lot: {i.lotCodes.join(", ")}</p>
                          <div className="cart-item__controls">
                            <div className="qty-stepper qty-stepper--small" aria-label={`${i.name} adeti`}>
                              <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label="Azalt">−</button>
                              <span>{i.qty}</span>
                              <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label="Artır">+</button>
                            </div>
                            <button type="button" className="cart-item__remove" onClick={() => remove(i.key)}>
                              Kaldır
                            </button>
                          </div>
                        </div>
                        <p className="cart-item__sum">{formatTL(i.unitPrice * i.qty)}</p>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {view === "form" && (
                <form id="demo-form" onSubmit={submit} noValidate>
                  <p className="form-demo-note" role="note">
                    Demo form: bilgiler gönderilmez, saklanmaz. Doğrulama mantığını denemek için alanı boş bırakıp göndermeyi deneyebilirsiniz.
                  </p>
                  {field("name", "Ad soyad *", { autoComplete: "name", placeholder: "Örn. Zeynep Kaya" })}
                  {field("phone", "Telefon *", { autoComplete: "tel", inputMode: "tel", placeholder: "05xx xxx xx xx" })}
                  {field("city", "Şehir *", { autoComplete: "address-level1", placeholder: "Örn. İstanbul" })}
                  {field("address", "Açık adres *", { autoComplete: "street-address", placeholder: "Mahalle, sokak, bina ve daire no" })}
                  {field("note", "Hediye notu / sipariş notu (isteğe bağlı)", { placeholder: "Kutunun içine yazmamızı istediğin not" })}
                </form>
              )}
            </div>

            <footer className="drawer__foot">
              <dl className="cart-totals">
                <div><dt>Ara toplam</dt><dd>{formatTL(subtotal)}</dd></div>
                <div><dt>Kargo</dt><dd>{shipping === 0 ? "Ücretsiz" : formatTL(shipping)}</dd></div>
                <div className="cart-totals__grand"><dt>Genel toplam</dt><dd>{formatTL(total)}</dd></div>
              </dl>
              {view === "cart" ? (
                <button type="button" className="btn btn--primary btn--large btn--block" onClick={() => setView("form")}>
                  Demo siparişe geç →
                </button>
              ) : (
                <div className="drawer__form-actions">
                  <button type="button" className="btn btn--ghost" onClick={() => setView("cart")}>← Sepete dön</button>
                  <button type="submit" form="demo-form" className="btn btn--primary btn--large">
                    Demo siparişi onayla
                  </button>
                </div>
              )}
              <p className="drawer__demo-note">Ödeme alınmaz; bu akış yalnızca yarışma demosudur.</p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
