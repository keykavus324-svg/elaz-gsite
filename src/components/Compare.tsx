import { useState } from "react";

type TabId = "gun" | "islim";

const DATA: Record<
  TabId,
  {
    title: string;
    lede: string;
    img: string;
    alt: string;
    rows: Array<[string, string]>;
    verdict: string;
  }
> = {
  gun: {
    title: "Gün Kurusu",
    lede: "İslim damına hiç girmeden, doğrudan güneşle kurur.",
    img: "/img/gun-kurusu.jpg",
    alt: "Koyu kahve-amber renkli gün kurusu kayısılarla dolu seramik kase",
    rows: [
      ["Renk", "Koyu kahve-amber. Parlak değildir; koyulaşması gün kurusunun doğasıdır."],
      ["Doku", "Yumuşak, lokum gibi; elinizde kolayca kopar."],
      ["Tat profili", "Yoğun, karamelimsi ve derin. Kayısı tadı daha konsantre hissedilir."],
      ["Nasıl kurur?", "İslim uygulanmadan sergide güneşte kurutulur."],
      ["Saklama", "İslimliye göre daha özen ister; serin, kuru, ağzı kapalı. Önce bunu tüketin."],
      ["Kim sever?", "Çayın yanına, gün içinde atıştırmalık olarak, tat yoğunluğu arayanlar."],
    ],
    verdict: "Görünümden çok tat senin için önemliyse gün kurusu.",
  },
  islim: {
    title: "İslimli",
    lede: "Kükürt odasında (islim damı) rengi korunarak kurutulur; üretimin büyük kısmı bu yolla yapılır.",
    img: "/img/islimli.jpg",
    alt: "Parlak turuncu renkte islimli kuru kayısı yarılarıyla dolu seramik kase",
    rows: [
      ["Renk", "Canlı, parlak turuncu. Taze kayısının rengine en yakın hâli."],
      ["Doku", "Daha diri ve esnek; dişinize hafif direnç verir, dağılmaz."],
      ["Tat profili", "Taze kayısıya yakın, daha ferah ve hafif bir tat."],
      ["Nasıl kurur?", "Önce islim damında yaklaşık bir gün, sonra sergide güneşte."],
      ["Saklama", "Rengi korunduğu için daha uzun ömürlüdür; serin ve kuru yerde tutun."],
      ["Kim sever?", "Tatlıda, hoşafta, sunumda ve hediye kutusunda rengi önemseyenler."],
    ],
    verdict: "Renk, dayanıklılık ve sunum önceliğinse islimli.",
  },
};

export default function Compare() {
  const [tab, setTab] = useState<TabId>("gun");
  const d = DATA[tab];

  return (
    <section className="section compare" id="karsilastir" aria-labelledby="karsilastir-baslik">
      <div className="section__head">
        <p className="kicker">Alırken herkesin takıldığı soru</p>
        <h2 id="karsilastir-baslik">Gün kurusu mu, islimli mi?</h2>
        <p className="section__lede">
          İkisi de aynı dalın kayısısı; fark, kurutma yolunda. Biri diğerinden "daha iyi" değil —
          damak tadına ve kullanımına göre doğru olan değişir. İşte saklamadan, açık açık farkları:
        </p>
      </div>

      <div className="compare__tabs" role="tablist" aria-label="Kurutma türü seçimi">
        {(Object.keys(DATA) as TabId[]).map((id) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            className={`compare__tab${tab === id ? " is-active" : ""}`}
            onClick={() => setTab(id)}
          >
            {DATA[id].title}
            <span className="compare__tab-sub">{id === "gun" ? "İslimsiz" : "Rengi korunmuş"}</span>
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="compare__panel"
        key={tab}
      >
        <figure className="compare__figure">
          <img src={d.img} alt={d.alt} width={1200} height={900} loading="lazy" />
          <figcaption className="compare__verdict">{d.verdict}</figcaption>
        </figure>
        <div className="compare__body">
          <h3>{d.title}</h3>
          <p className="compare__lede">{d.lede}</p>
          <dl className="compare__rows">
            {d.rows.map(([k, v]) => (
              <div key={k} className="compare__row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <a href="#lotunu-kur" className="btn btn--primary">
            Hangisi bana göre? 3 soruda bul <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
