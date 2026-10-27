import { useEffect, useState } from "react";
import { useCart } from "../cart";

const NAV = [
  { href: "#saha", label: "Saha" },
  { href: "#surec", label: "Süreç" },
  { href: "#lotunu-kur", label: "Lotunu Kur" },
  { href: "#yz-defteri", label: "Yapay Zekâ" },
  { href: "#urunler", label: "Kutular" },
  { href: "#mutfak", label: "Mutfak" },
  { href: "#mola", label: "Mola" },
  { href: "#atlas", label: "Atlas" },
  { href: "#evren", label: "Evren" },
  { href: "#lot-sorgula", label: "Pasaport" },
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
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className={`site-header site-header--ledger${scrolled ? " is-scrolled" : ""}`}>
      <a className="skip-link" href="#icerik">İçeriğe atla</a>
      <div className="site-header__ticker" role="note">
        <span>Elazığ · 23</span>
        <span aria-hidden="true">◆</span>
        <span>Baskil kayısısı</span>
        <span aria-hidden="true">◆</span>
        <span>1.800 temsilî kayıt</span>
        <span className="site-header__ticker-demo">Yarışma demosu — sahte sipariş yok</span>
      </div>

      <div className="site-header__bar">
        <a href="#top" className="brand" aria-label="Patik — Baskil Kayısı Atölyesi, ana sayfa">
          <span className="brand__mark" aria-hidden="true">P</span>
          <span className="brand__text">
            <strong>PATİK</strong>
            <span>Baskil Kayısı Atölyesi</span>
          </span>
        </a>

        <nav className="site-header__nav" aria-label="Ana menü">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="site-header__actions">
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobil-menu"
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? "✕" : "☰"}
            <span>Menü</span>
          </button>
          <button type="button" className="cart-btn" onClick={() => setCartOpen(true)} aria-label={`Sepeti aç, içinde ${count} ürün var`}>
            <span className="cart-btn__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            <span>Sepet</span>
            {count > 0 && <span className="cart-btn__badge">{count}</span>}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobil-menu" className="site-header__mobile-nav" aria-label="Mobil menü">
          {NAV.map((item, index) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
          <a href="#uretici" onClick={() => setMenuOpen(false)}>Üretici</a>
          <a href="#sss" onClick={() => setMenuOpen(false)}>Sorular</a>
        </nav>
      )}
    </header>
  );
}
