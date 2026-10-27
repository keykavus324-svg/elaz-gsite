import { BUILD_STATS, trNumber } from "../content/buildStats";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogoMark } from "./Header";
import { TEAM } from "../team";

/**
 * Jüri Özeti — tek sayfalık, yazdırılabilir özet.
 *
 * Jüri salonunda "bunu nasıl anlatıyorsunuz?" sorusuna 30 saniyede
 * cevap verilebilen bir yaprak. PDF olarak da kaydedilebilir.
 */

const SIGNATURES = [
  {
    no: "01",
    name: "Lotunu Kur",
    text: "3 soru, 30 saniye. Ziyaretçi tadını, kullanımını ve bütçesini söyler; site ona uygun lotu ve pasaportu anında kurar.",
  },
  {
    no: "02",
    name: "Lot Pasaportu",
    text: "Her lotun kodu, bahçesi, hasat haftası ve izlenen yolu vardır. ?lot=PT-26-047 ile paylaşılır, yazdırılır.",
  },
  {
    no: "03",
    name: "Yapay Zekâ Defteri",
    text: "Cümleyle eşleştirme + açık üretim kaydı. Tamamen tarayıcıda çalışır; hiçbir veri dışarı çıkmaz.",
  },
];

const GAMES = [
  "İslim mi Gün mü — 16 saniyelik düello",
  "Patik Yolu — altı üretim durağını sırala",
  "Lot Pusulası — 204 lot kaydından bul",
  "Patik Ligi — 60 saniye + skor tablosu",
  "Patik Ustası — 30 saniye refleks",
  "Baskil Bilgisi — 10 soru, süreli",
];

const NUMBERS = [
  ["1.800", "temsilî kayıt"],
  ["204", "lot satırı"],
  ["144", "bilgi sorusu"],
  ["96", "tarif"],
  ["155", "terim"],
  ["365", "sezon günü"],
  [trNumber(BUILD_STATS.yzGorseli), "yapay zekâ görseli"],
  ["6", "oyun"],
];

export default function JuriOzeti() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("juri-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("juri-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const paper = (
    <div className="juri" role="dialog" aria-modal="true" aria-labelledby="juri-baslik">
      <div className="juri__bar">
        <button type="button" className="btn btn--primary" onClick={() => window.print()}>
          Yazdır / PDF kaydet <span aria-hidden="true">↓</span>
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>
          Kapat <span aria-hidden="true">✕</span>
        </button>
      </div>

      <article className="juri__paper">
        <header className="juri__head">
          <span className="juri__brand">
            <LogoMark size={38} />
            <span>
              <strong>PATİK</strong>
              <small>Baskil Kayısı Atölyesi · GakCoding 2026</small>
            </span>
          </span>
          <span className="juri__folio">Jüri Özeti · 01/01</span>
        </header>

        <h1 className="juri__title" id="juri-baslik">
          Kayısı kurur. <em>Kaydı kalır.</em>
        </h1>

        <p className="juri__idea">
          <strong>Fikir:</strong> Baskil kayısısını satan bir site değil, <em>kaydını</em> satan bir
          site kurduk. Her kutunun içinde bir lot pasaportu var: hangi bahçe, hangi hasat haftası,
          hangi kurutma yolu. Ziyaretçi kaydı okur, izi sürer, kendi lotunu kurar.
        </p>

        <section className="juri__block">
          <h2>Üç imza hareket</h2>
          <div className="juri__cards">
            {SIGNATURES.map((item) => (
              <div key={item.no} className="juri__card">
                <span className="juri__no">{item.no}</span>
                <h3>{item.name}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="juri__block">
          <h2>Oyun Masası — altı oyun, altı ders</h2>
          <ol className="juri__games">
            {GAMES.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ol>
        </section>

        <section className="juri__block juri__numbers">
          {NUMBERS.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="juri__block juri__honesty">
          <h2>Şeffaflık notu</h2>
          <p>
            Tüm ürün, fiyat, lot, üretici ve bahçe bilgileri <strong>temsilîdir</strong>; gerçek
            bir satış, ödeme, üyelik veya takip kodu yoktur. {trNumber(BUILD_STATS.yzGorseli)}{" "}
            görselin tamamı yapay zekâ ile
            üretilmiş temsilî çekimlerdir. Form verisi sunucuya gönderilmez. Yapay zekâ
            özelliği tarayıcı içinde, kural tabanlı çalışır.
          </p>
        </section>

        <footer className="juri__foot">
          <span>
            <strong>{TEAM.name}</strong> · Kaptan {TEAM.captain} · {TEAM.members.join(", ")}
          </span>
          <span className="juri__links">
            <span>{TEAM.live}</span>
            <span>{TEAM.repo}</span>
          </span>
        </footer>
      </article>
    </div>
  );

  return (
    <>
      <button type="button" className="juri__open" onClick={() => setOpen(true)}>
        <span aria-hidden="true">▤</span> Jüri Özeti
      </button>
      {open && createPortal(paper, document.body)}
    </>
  );
}
