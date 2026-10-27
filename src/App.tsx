import { Suspense, lazy, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Bant from "./components/Bant";
import Hero from "./components/Hero";
import Compare from "./components/Compare";
import Process from "./components/Process";
import Producer from "./components/Producer";
import Mola from "./components/Mola";
import OyunMasasi from "./components/OyunMasasi";
import Mutfak from "./components/Mutfak";
import LotBuilder from "./components/LotBuilder";
import YzDefteri from "./components/YzDefteri";
import Products from "./components/Products";
import LotLookup from "./components/LotLookup";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Reveal from "./components/Reveal";
import Prova from "./components/Prova";
import ChapterRail from "./components/ChapterRail";
import SectionBoundary from "./components/SectionBoundary";
import { useCart } from "./cart";

/* Ağır bölümler ayrı paketlerden tembel yüklenir. Fabrikalar ayrı tutulur ki
   hem önden ısıtılabilsin (idle ön yükleme) hem de paket alınamazsa
   hata sınıra düşüp yalnızca o bölümü etkilesin. */
const loadFieldDesk = () => import("./components/FieldDesk");
const loadAtlas = () => import("./components/Atlas");
const loadUniverse = () => import("./components/Universe");

const Atlas = lazy(loadAtlas);
const Universe = lazy(loadUniverse);
const FieldDesk = lazy(loadFieldDesk);

const WORDS = [
  "PATİK", "tek tek elle", "GÜN KURUSU", "islimsiz güneş", "İSLİM DAMI", "canlı renk",
  "SERGİ", "Fırat'a bakan bahçeler", "ÇİR", "kutuya hazır", "LOT PASAPORTU", "bahçeden kutuna",
  "BASKİL", "Elazığ · 23",
];

/** Yöresel sözlüğü taşıyan kayan şerit (dekoratif, ekran okuyucudan gizli kopya ile). */
function Marquee() {
  const row = WORDS.map((w, i) => (
    <span key={i} className={i % 2 === 0 ? "marquee__word" : "marquee__hint"}>
      {w}
      <span className="marquee__dot" aria-hidden="true">◆</span>
    </span>
  ));
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        <div className="marquee__row">{row}</div>
        <div className="marquee__row">{row}</div>
      </div>
    </div>
  );
}

/** Mobilde, hero geçildikten sonra beliren ve Lotunu Kur görünürken saklanan yüzer eylem düğmesi. */
function FloatingCta() {
  const { cartOpen, toast } = useCart();
  const [past, setPast] = useState(false);
  const [builderVisible, setBuilderVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > 650);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const target = document.getElementById("lotunu-kur");
    let io: IntersectionObserver | undefined;
    if (target && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([e]) => setBuilderVisible(e.isIntersecting));
      io.observe(target);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  const provaMode = (() => { try { return new URLSearchParams(window.location.search).has("prova"); } catch { return false; } })();
  if (!past || builderVisible || cartOpen || toast || provaMode) return null;
  return (
    <a href="#lotunu-kur" className="floating-cta">
      Lotunu Kur <span aria-hidden="true">→</span> <small>30 saniye</small>
    </a>
  );
}

function FieldDeskFallback() {
  return (
    <section className="section fielddesk fielddesk--loading" id="saha" aria-labelledby="saha-yukleme-baslik">
      <p className="kicker">Saha Defteri</p>
      <h2 id="saha-yukleme-baslik">Günün kayıtları tezgâha geliyor</h2>
      <p className="section__lede">Günlük, lot, tarif, kalite ve ders fişleri ana paket şişmeden ayrı ayrı yüklenir.</p>
    </section>
  );
}

function AtlasFallback() {
  return (
    <section className="section atlas atlas--loading" id="atlas" aria-labelledby="atlas-yukleme-baslik">
      <p className="kicker">Patik Atlası</p>
      <h2 id="atlas-yukleme-baslik">Kayıt odası hazırlanıyor</h2>
      <p className="section__lede">811 temsilî kayıt, ana sayfanın ilk açılışını ağırlaştırmadan ayrı paketten geliyor.</p>
    </section>
  );
}

function UniverseFallback() {
  return (
    <section className="section universe universe--loading" id="evren" aria-labelledby="evren-yukleme-baslik">
      <p className="kicker">Patik Evreni</p>
      <h2 id="evren-yukleme-baslik">Çalışma sahası hazırlanıyor</h2>
      <p className="section__lede">Operasyon panosu, 365 günlük plan ve okul modülleri ayrı paketlerle geliyor.</p>
    </section>
  );
}

/** Evren yalnızca ziyaretçi bölüme yaklaşınca ya da düğmeye basınca yüklenir. */
function DeferredUniverse() {
  const shellRef = useRef<HTMLElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;
    const target = shellRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "900px 0px" }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [shouldLoad]);

  if (shouldLoad) {
    return (
      <Suspense fallback={<UniverseFallback />}>
        <SectionBoundary
          title="Patik Evreni"
          note="Operasyon panosu, 365 günlük plan, kalite masası, kutu hattı, hediye stüdyosu ve Patik Okulu."
        >
          <Universe />
        </SectionBoundary>
      </Suspense>
    );
  }

  return (
    <section ref={shellRef} className="section universe universe--loading" id="evren" aria-labelledby="evren-acilis-baslik">
      <p className="kicker">Patik Evreni</p>
      <h2 id="evren-acilis-baslik">Kayıt odasından çalışma sahasına in.</h2>
      <p className="section__lede">
        989 yeni temsilî kayıt; operasyon panosu, 365 günlük plan, kalite masası,
        kutu hattı simülasyonu, hediye stüdyosu ve Patik Okulu ile çalışır.
      </p>
      <p>
        <button type="button" className="btn btn--primary btn--large" onClick={() => setShouldLoad(true)}>
          Patik Evreni'ni Aç →
        </button>
      </p>
    </section>
  );
}

function Toast() {
  const { toast, setCartOpen, cartOpen } = useCart();
  if (!toast || cartOpen) return null;
  return (
    <div className="toast" role="status">
      <span>{toast}</span>
      <button type="button" className="toast__btn" onClick={() => setCartOpen(true)}>
        Sepeti gör
      </button>
    </div>
  );
}

/**
 * Ağır bölümlerin paketlerini sayfa boşta kaldığında önden getirir.
 * Amaç: etkinlik salonunda internet kesilirse bile bölümler açılabilsin —
 * tarayıcı paketleri önbelleğe almış olur. Başarısız olursa sessizce geçilir;
 * yüklenemeyen bölüm SectionBoundary tarafından yakalanır.
 */
function useIdlePrefetch() {
  useEffect(() => {
    const timers: number[] = [];
    const warm = (fn: () => Promise<unknown>) => {
      fn().catch(() => {
        /* ön yükleme başarısız olursa bölüm sınırı devreye girer */
      });
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(
        () => {
          warm(loadFieldDesk);
          timers.push(window.setTimeout(() => warm(loadAtlas), 600));
          timers.push(window.setTimeout(() => warm(loadUniverse), 1400));
        },
        { timeout: 3000 },
      );
      return () => {
        w.cancelIdleCallback?.(id);
        timers.forEach((t) => window.clearTimeout(t));
      };
    }
    timers.push(window.setTimeout(() => warm(loadFieldDesk), 800));
    timers.push(window.setTimeout(() => warm(loadAtlas), 1600));
    timers.push(window.setTimeout(() => warm(loadUniverse), 2600));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);
}

/** Sol kenarda dikey yazan sabit kenar etiketi (geniş ekranlarda). */
function SideRail() {
  return (
    <p className="patik-rail" aria-hidden="true">
      <span>Patik · Baskil Kayısı Atölyesi</span>
      <span>2026</span>
    </p>
  );
}

export default function App() {
  useIdlePrefetch();
  return (
    <>
      <Header />
      <ChapterRail />
      <SideRail />
      <main id="icerik">
        <Hero />
        <Marquee />
        <Bant />
        <Suspense fallback={<FieldDeskFallback />}>
          <SectionBoundary title="Saha Defteri" note="Günün kayıt fişleri burada çalışıyor.">
            <FieldDesk />
          </SectionBoundary>
        </Suspense>
        <Reveal><Compare /></Reveal>
        <Reveal><Process /></Reveal>
        <Reveal><Producer /></Reveal>
        <Reveal><Mola /></Reveal>
        <Reveal><OyunMasasi /></Reveal>
        <Reveal><LotBuilder /></Reveal>
        <Reveal><YzDefteri /></Reveal>
        <Reveal><Products /></Reveal>
        <Reveal><Mutfak /></Reveal>
        <Suspense fallback={<AtlasFallback />}>
          <SectionBoundary title="Patik Atlası" note="204 lotluk temsilî kayıt defteri ve sözlük.">
            <Atlas />
          </SectionBoundary>
        </Suspense>
        <DeferredUniverse />
        <Reveal><LotLookup /></Reveal>
        <Reveal><Faq /></Reveal>
      </main>
      <Footer />
      <CartDrawer />
      <Prova />
      <FloatingCta />
      <Toast />
    </>
  );
}
