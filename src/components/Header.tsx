import { useEffect, useState } from "react";
import { useCart } from "../cart";

const LINKS = [
  { href: "#karsilastir", label: "Gün/İslim" },
  { href: "#surec", label: "Süreç" },
  { href: "#uretici", label: "Üretici" },
  { href: "#mola", label: "Çay Molası" },
  { href: "#urunler", label: "Ürünler" },
  { href: "#lot-sorgula", label: "Lot Sorgula" },
  { href: "#sss", label: "SSS" },
];

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="#FBF3E4" />
      <path d="M32 10c10 0 18 9.5 18 22 0 13.5-8.5 22-18 22S14 45.5 14 32c0-12.5 8-22 18-22Z" fill="#E8762C" />
      <path d="M32 10c-2.5 7-2.5 37 0 44" fill="none" stroke="#B5501B" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="32" cy="34" rx="6.5" ry="9" fill="#5A3A22" />
      <path d="M33 6c3-2.5 8-3 11-1-1 3.5-4.5 6-9 6" fill="#5B7231" />
    </svg>
  );
}

export default function Header() {
  const { count, setCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <p className="demo-strip" role="note">
        GakCoding yarışma demosu — gerçek satış yapılmaz, üretici ve lot içerikleri temsilîdir.
      </p>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <a className="skip-link" href="#icerik">İçeriğe atla</a>
        <div className="site-header__inner">
          <a href="#top" className="brand" aria-label="Patik — ana sayfa">
            <LogoMark />
            <span className="brand__text">
              <span className="brand__name">PATİK</span>
              <span className="brand__sub">Baskil Kayısı Atölyesi</span>
            </span>
          </a>

          <nav className="main-nav" aria-label="Ana menü">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>

          <div className="header-actions">
            <a href="#lotunu-kur" className="btn btn--primary btn--small header-cta">Lotunu Kur</a>
            <button
              type="button"
              className="cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label={`Sepeti aç, içinde ${count} ürün var`}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 7h15l-1.5 8.5a2 2 0 0 1-2 1.5h-7.4a2 2 0 0 1-2-1.7L5 3H2.5" />
                <circle cx="9.5" cy="20.5" r="1.3" fill="currentColor" stroke="none" />
                <circle cx="17" cy="20.5" r="1.3" fill="currentColor" stroke="none" />
              </svg>
              <span>Sepet</span>
              {count > 0 && <span className="cart-btn__badge" aria-hidden="true">{count}</span>}
            </button>
            <button
              type="button"
              className="menu-btn"
              aria-expanded={menuOpen}
              aria-controls="mobil-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="sr-only">{menuOpen ? "Menüyü kapat" : "Menüyü aç"}</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {menuOpen ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobil-menu" className="mobile-nav" aria-label="Mobil menü">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
            <a href="#lotunu-kur" className="btn btn--primary" onClick={() => setMenuOpen(false)}>
              Lotunu Kur — 30 saniye
            </a>
          </nav>
        )}
      </header>
    </>
  );
}
