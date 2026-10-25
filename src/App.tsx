import Header from "./components/Header";
import Hero from "./components/Hero";
import Compare from "./components/Compare";
import Process from "./components/Process";
import Producer from "./components/Producer";
import LotBuilder from "./components/LotBuilder";
import Products from "./components/Products";
import LotLookup from "./components/LotLookup";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import { useCart } from "./cart";

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
      <main id="icerik">
        <Hero />
        <Compare />
        <Process />
        <Producer />
        <LotBuilder />
        <Products />
        <LotLookup />
        <Faq />
      </main>
      <Footer />
      <CartDrawer />
      <Toast />
    </>
  );
}
