import { useMemo, useRef, useState } from "react";
import {
  PRODUCTS,
  findLot,
  formatTL,
  recommend,
  type Amount,
  type QuizAnswers,
  type SizeOption,
  type Taste,
  type UseCase,
} from "../data";
import { useCart } from "../cart";
import LotPassport from "./LotPassport";

interface Option<T extends string> {
  value: T;
  title: string;
  hint: string;
}

const Q1: Array<Option<UseCase>> = [
  { value: "atistirmalik", title: "Çayın yanına, günlük atıştırmalık", hint: "Kavanozda dursun, el gittikçe alınsın" },
  { value: "hediye", title: "Hediye göndereceğim", hint: "Sunumu şık, hikâyesi içinde olsun" },
  { value: "mutfak", title: "Mutfakta: hoşaf, tatlı, yemek", hint: "Pişince dağılmasın, tarifte dursun" },
  { value: "deneme", title: "Kararsızım, hepsini denemek isterim", hint: "Gün mü islim mi, tadarak karar vereyim" },
];

const Q2: Array<Option<Taste>> = [
  { value: "koyu", title: "Koyu, yoğun, karamelimsi", hint: "Yumuşak doku, derin tat — gün kurusu tarafı" },
  { value: "parlak", title: "Parlak, diri, tazeye yakın", hint: "Canlı renk, hafif direnç — islimli tarafı" },
  { value: "fark-etmez", title: "Fark etmez, öneriye açığım", hint: "Kullanımıma göre siz seçin" },
];

const Q3: Array<Option<Amount>> = [
  { value: "kucuk", title: "Kendim için, küçük başlayayım", hint: "500 gramlık başlangıç" },
  { value: "aile", title: "Evde aileyle paylaşılır", hint: "1 kilogramlık, uzun ömürlü seçim" },
  { value: "coklu", title: "Birkaç kişiyle / birkaç eve", hint: "Paylaşımlık bölmeli kutu" },
];

export default function LotBuilder() {
  const { add, setCartOpen } = useCart();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [answers, setAnswers] = useState<QuizAnswers>({ use: null, taste: null, amount: null });
  const [sizeOverride, setSizeOverride] = useState<SizeOption | null>(null);
  const [qty, setQty] = useState(1);
  const [withKernel, setWithKernel] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const rec = useMemo(() => {
    if (!answers.use || !answers.taste || !answers.amount) return null;
    return recommend({ use: answers.use, taste: answers.taste, amount: answers.amount });
  }, [answers]);

  const size: SizeOption | null = sizeOverride ?? rec?.size ?? null;
  const kernel = PRODUCTS.find((p) => p.id === "cekirdek")!;
  const kernelSize = kernel.sizes[0];

  function goto(next: 0 | 1 | 2 | 3) {
    setStep(next);
    window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 60);
  }

  function pick<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    setSizeOverride(null);
    if (step < 2) goto((step + 1) as 1 | 2);
    else goto(3);
  }

  function reset() {
    setAnswers({ use: null, taste: null, amount: null });
    setSizeOverride(null);
    setQty(1);
    setWithKernel(false);
    goto(0);
  }

  function handleAdd() {
    if (!rec || !size) return;
    add(rec.product, size, qty);
    if (withKernel && rec.kernelTip) add(kernel, kernelSize, 1);
    setCartOpen(true);
  }

  const questions = [
    { legend: "Kayısıyı en çok nasıl tüketeceksin?", options: Q1, key: "use" as const, current: answers.use },
    { legend: "Damakta hangisini arıyorsun?", options: Q2, key: "taste" as const, current: answers.taste },
    { legend: "Kutu kimin için, ne kadar gitsin?", options: Q3, key: "amount" as const, current: answers.amount },
  ];

  return (
    <section className="section lot-builder" id="lotunu-kur" aria-labelledby="lot-kur-baslik">
      <div className="lot-builder__inner">
        <div className="section__head">
          <p className="kicker">İmza özellik · 3 soru, 30 saniye</p>
          <h2 id="lot-kur-baslik">Lotunu Kur</h2>
          <p className="section__lede">
            Herkese aynı kutu yok. Nasıl tüketeceğini söyle; kurutma biçimini, boyu ve gramajı
            gerekçesiyle önerelim, lot pasaportunu da önden gösterelim.
          </p>
        </div>

        {step < 3 ? (
          <div className="quiz">
            <div className="quiz__progress" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`quiz__dot${i <= step ? " is-done" : ""}`} />
              ))}
              <span className="quiz__progress-label">Soru {step + 1} / 3</span>
            </div>

            <fieldset className="quiz__fieldset" key={step}>
              <legend>
                <h3 ref={headingRef} tabIndex={-1} className="quiz__question">
                  {questions[step].legend}
                </h3>
              </legend>
              <div className="quiz__options">
                {questions[step].options.map((o) => {
                  const checked = questions[step].current === o.value;
                  return (
                    <label key={o.value} className={`quiz__option${checked ? " is-checked" : ""}`}>
                      <input
                        type="radio"
                        name={`q-${questions[step].key}`}
                        value={o.value}
                        checked={checked}
                        onChange={() => pick(questions[step].key, o.value as never)}
                      />
                      <span className="quiz__option-title">{o.title}</span>
                      <span className="quiz__option-hint">{o.hint}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="quiz__nav">
              {step > 0 ? (
                <button type="button" className="btn btn--ghost btn--small" onClick={() => goto((step - 1) as 0 | 1)}>
                  ← Geri
                </button>
              ) : (
                <span />
              )}
              {rec && (
                <button type="button" className="btn btn--primary btn--small" onClick={() => goto(3)}>
                  Sonucumu gör →
                </button>
              )}
            </div>
          </div>
        ) : rec && size ? (
          <div className="quiz-result" aria-live="polite">
            <h3 ref={headingRef} tabIndex={-1} className="quiz-result__title">
              Senin lotun hazır <span aria-hidden="true">↓</span>
            </h3>
            <div className="quiz-result__grid">
              <div className="quiz-result__card">
                <img src={rec.product.img} alt={rec.product.alt} width={1000} height={750} loading="lazy" />
                <div className="quiz-result__body">
                  <p className="quiz-result__name">{rec.product.name}</p>
                  <p className="quiz-result__short">{rec.product.short}</p>

                  <div className="size-pills" role="group" aria-label="Gramaj seçimi">
                    {rec.product.sizes.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`size-pill${s.id === size.id ? " is-active" : ""}`}
                        aria-pressed={s.id === size.id}
                        onClick={() => setSizeOverride(s)}
                      >
                        {s.label} · {formatTL(s.price)}
                      </button>
                    ))}
                  </div>

                  <ul className="quiz-result__reasons">
                    {rec.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>

                  {rec.kernelTip && (
                    <label className="kernel-tip">
                      <input
                        type="checkbox"
                        checked={withKernel}
                        onChange={(e) => setWithKernel(e.target.checked)}
                      />
                      <span>
                        Yanına aynı hasadın çekirdek içini de ekle ({kernelSize.label} · {formatTL(kernelSize.price)})
                        <small>Patikte çıkan çekirdek, ziyan olmasın. Az miktarda tüketin.</small>
                      </span>
                    </label>
                  )}

                  <div className="quiz-result__buy">
                    <div className="qty-stepper" aria-label="Adet">
                      <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Adedi azalt">−</button>
                      <span aria-live="polite">{qty} kutu</span>
                      <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Adedi artır">+</button>
                    </div>
                    <p className="quiz-result__price">
                      {formatTL(size.price * qty + (withKernel && rec.kernelTip ? kernelSize.price : 0))}
                      <small>Demo fiyat · kargo sepet adımında</small>
                    </p>
                  </div>

                  <div className="quiz-result__actions">
                    <button type="button" className="btn btn--primary btn--large" onClick={handleAdd}>
                      Bu lotu sepete ekle
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={reset}>
                      Baştan kur
                    </button>
                  </div>
                </div>
              </div>

              <div className="quiz-result__passport">
                <p className="quiz-result__passport-label">Kutunun içinden çıkacak pasaport (önizleme)</p>
                <LotPassport lot={findLot(rec.product.lotCodes[0])!} compact />
                {rec.product.lotCodes.length > 1 && (
                  <p className="quiz-result__more-lots">
                    Bu kutuda {rec.product.lotCodes.length} lot var: {rec.product.lotCodes.join(" · ")}.
                    Diğerlerini <a href="#lot-sorgula">lot sorgulamadan</a> tek tek görebilirsin.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
