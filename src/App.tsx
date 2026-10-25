import { Suspense, lazy, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Compare from "./components/Compare";
import Process from "./components/Process";
import Producer from "./components/Producer";
import Mola from "./components/Mola";
import Mutfak from "./components/Mutfak";
import LotBuilder from "./components/LotBuilder";
import Products from "./components/Products";
import LotLookup from "./components/LotLookup";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Reveal from "./components/Reveal";
import Prova from "./components/Prova";
import ChapterRail from "./components/ChapterRail";
import { useCart } from "./cart";

const Atlas = lazy(() => import("./components/Atlas"));
const Universe = lazy(() => import("./components/Universe"));
const FieldDesk = lazy(() => import("./components/FieldDesk"));

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
        <Universe />
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

export default function App() {
  return (
    <>
      <Header />
      <ChapterRail />
      <main id="icerik">
        <Hero />
        <Marquee />
        <Suspense fallback={<FieldDeskFallback />}><FieldDesk /></Suspense>
        <Reveal><Compare /></Reveal>
        <Reveal><Process /></Reveal>
        <Reveal><Producer /></Reveal>
        <Reveal><Mola /></Reveal>
        <Reveal><LotBuilder /></Reveal>
        <Reveal><Products /></Reveal>
        <Reveal><Mutfak /></Reveal>
        <Suspense fallback={<AtlasFallback />}><Atlas /></Suspense>
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
