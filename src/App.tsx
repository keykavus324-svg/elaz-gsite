import { useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Showcase from "./components/Showcase";
import ScrollProgress from "./components/ScrollProgress";
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
import { useCart } from "./cart";

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
      <ScrollProgress />
      <Header />
      <main id="icerik">
        <Hero />
        <Showcase />
        <Marquee />
        <Reveal><Compare /></Reveal>
        <Reveal><Process /></Reveal>
        <Reveal><Producer /></Reveal>
        <Reveal><Mola /></Reveal>
        <Reveal><LotBuilder /></Reveal>
        <Reveal><Products /></Reveal>
        <Reveal><Mutfak /></Reveal>
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
