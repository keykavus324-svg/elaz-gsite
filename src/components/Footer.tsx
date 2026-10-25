import { LogoMark } from "./Header";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <span className="brand brand--footer">
            <LogoMark size={40} />
            <span className="brand__text">
              <span className="brand__name">PATİK</span>
              <span className="brand__sub">Baskil Kayısı Atölyesi</span>
            </span>
          </span>
          <p className="site-footer__motto">Bahçeden kutuna, lotuyla.</p>
          <p>
            Patik, Baskil kayısının kendi adıyla ve izlenebilir kurutma kaydıyla tüketiciye
            ulaşabileceğini gösteren bir GakCoding konseptidir.
          </p>
        </div>

        <nav className="site-footer__nav" aria-label="Alt bilgi menüsü">
          <h3>Gezin</h3>
          <a href="#saha">Saha Defteri: Günün Kayıtları</a>
          <a href="#karsilastir">Gün mü İslim mi?</a>
          <a href="#surec">Dalından Kutuna: Süreç</a>
          <a href="#uretici">Üretici Hikâyesi</a>
          <a href="#mola">Çay Molası: Radyo & Oyun</a>
          <a href="#lotunu-kur">Lotunu Kur</a>
          <a href="#urunler">Ürünler</a>
          <a href="#mutfak">Mevsim & Mutfak · Hoşaf Hesapçısı</a>
          <a href="#atlas">Patik Atlası: Lot Defteri ve Sözlük</a>
          <a href="#evren">Patik Evreni: Operasyon, Günlük ve Okul</a>
          <a href="#lot-sorgula">Lot Sorgula</a>
          <a href="#sss">Sık Sorulanlar</a>
        </nav>

        <div className="site-footer__demo">
          <h3>Şeffaflık notu</h3>
          <ul>
            <li>Bu site bir <strong>yarışma demosudur</strong>; gerçek satış, ödeme ve kargo yoktur.</li>
            <li>Üretici profili, fiyatlar ve lot kayıtları <strong>temsilîdir</strong>; gerçek kişi veya işletme değildir.</li>
            <li>Ürün süreçlerine dair genel bilgiler kaynaklara dayanır (depoda <em>KAYNAKLAR.md</em>).</li>
            <li>Görseller yapay zekâ ile üretilmiştir; gerçek üretici/tesis fotoğrafı değildir.</li>
            <li>Form verileri gönderilmez; sepet yalnızca tarayıcınızda saklanır.</li>
          </ul>
        </div>
      </div>
      <p className="site-footer__bottom">
        © 2026 Patik (kurgusal marka konsepti) · GakCoding — Elazığ · Kilimden koda, Baskil'den sofrana.
      </p>
    </footer>
  );
}
