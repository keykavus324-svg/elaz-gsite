import { Suspense, lazy, useState } from "react";
import "../universe.css";
import SectionBoundary from "./SectionBoundary";

const OperationsDashboard = lazy(() => import("./universe/OperationsDashboard"));
const DailyJournal = lazy(() => import("./universe/DailyJournal"));
const QualityLab = lazy(() => import("./universe/QualityLab"));
const PackingLine = lazy(() => import("./universe/PackingLine"));
const GiftStudio = lazy(() => import("./universe/GiftStudio"));
const LearningSchool = lazy(() => import("./universe/LearningSchool"));

type UniverseTab = "operasyon" | "gunluk" | "kalite" | "kutu" | "hediye" | "okul";

const TABS: Array<{
  id: UniverseTab;
  label: string;
  count: string;
  description: string;
}> = [
  {
    id: "operasyon",
    label: "Operasyon",
    count: "204 lot + 48 blok",
    description: "Temsilî lot defterinden canlı hesaplanan panolar ve tıklanabilir teras haritası",
  },
  {
    id: "gunluk",
    label: "365 Gün",
    count: "365 günlük plan",
    description: "Her güne bahçe, atölye, kayıt, mutfak işi ve işaretlenebilir kontrol listesi",
  },
  {
    id: "kalite",
    label: "Kalite Labı",
    count: "192 kontrol",
    description: "Numune, sınıf dağılımı ve karar mantığını filtreleyerek inceleme masası",
  },
  {
    id: "kutu",
    label: "Kutu Hattı",
    count: "144 koşu",
    description: "İstasyon yükleri ve adım adım çalıştırılabilen temsilî kutulama simülasyonu",
  },
  {
    id: "hediye",
    label: "Hediye Stüdyosu",
    count: "120 senaryo",
    description: "Vesile ve alıcı profiline göre ürün, hazır not ve demo sepet akışı",
  },
  {
    id: "okul",
    label: "Patik Okulu",
    count: "120 ders",
    description: "12 yolda ilerleme, rozet ve sayfada uygulama görevleriyle kısa öğrenme sistemi",
  },
];

function PanelFallback({ label }: { label: string }) {
  return (
    <div className="uni-panel-loading" role="status">
      <strong>{label} yükleniyor</strong>
      <p>Bu modül ayrı paket hâlinde geliyor; ana sayfa bekletilmiyor.</p>
    </div>
  );
}

export default function Universe() {
  const [tab, setTab] = useState<UniverseTab>("operasyon");
  const active = TABS.find((item) => item.id === tab) ?? TABS[0];

  return (
    <section className="section universe" id="evren" aria-labelledby="evren-baslik">
      <div className="universe__head">
        <p className="kicker">Patik Evreni · Atlas'ın bir kat altı</p>
        <h2 id="evren-baslik">Kayıt odasından çalışma sahasına in.</h2>
        <p className="section__lede">
          Atlas sana kaydı gösteriyordu; Evren o kaydı <strong>işletiyor</strong>:
          panoda hesapla, günlüğe gir, kalite kararı ver, kutu hattını çalıştır,
          hediyeyi kişiselleştir ve Patik Okulu'nda ilerle.
        </p>
      </div>

      <div className="universe__stats" aria-label="Patik Evreni kayıt özeti">
        <div><strong>989</strong><span>yeni temsilî kayıt</span></div>
        <div><strong>365</strong><span>günlük sezon planı</span></div>
        <div><strong>336</strong><span>kalite + kutu kaydı</span></div>
        <div><strong>240</strong><span>hediye + ders senaryosu</span></div>
      </div>

      <div className="universe__warning">
        <strong>Önce çerçeve:</strong> Bu sahnedeki parsel, kalite, kutu ve günlük sayıları
        temsilîdir. Amaç uydurulmuş sayıları gerçek gibi satmak değil; gerçek veri geldiğinde
        aynı arayüzün hangi kararları destekleyebileceğini çalışır hâlde göstermektir.
      </div>

      <div className="universe__tabs" role="group" aria-label="Patik Evreni modülleri">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`universe__tab${tab === item.id ? " is-active" : ""}`}
            aria-pressed={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{item.count}</span>
          </button>
        ))}
      </div>

      <div className="universe__active" aria-live="polite">
        <h3>{active.label}</h3>
        <p>{active.description}</p>
      </div>

      <Suspense fallback={<PanelFallback label={active.label} />}>
        <SectionBoundary
          title={active.label}
          note="Bu modül ayrı paket hâlinde geliyor; yüklenemezse diğer modüller çalışmaya devam eder."
        >
          {tab === "operasyon" && <OperationsDashboard />}
          {tab === "gunluk" && <DailyJournal />}
          {tab === "kalite" && <QualityLab />}
          {tab === "kutu" && <PackingLine />}
          {tab === "hediye" && <GiftStudio />}
          {tab === "okul" && <LearningSchool />}
        </SectionBoundary>
      </Suspense>
    </section>
  );
}
