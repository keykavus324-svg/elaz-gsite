import { useState } from "react";

const FAQS: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "Gün kurusu ile islimli arasındaki fark tam olarak ne?",
    a: (
      <>
        Gün kurusu, kükürt uygulaması (islim) görmeden doğrudan güneşte kurur; bu yüzden rengi koyu
        kahve-ambere döner, tadı yoğunlaşır, dokusu yumuşar. İslimli kayısı önce islim damında
        rengi korunarak hazırlanır, sonra güneşte kurur; parlak turuncu ve diri kalır, daha uzun
        dayanır. İkisi de Baskil'de standart üretim biçimleridir; Patik kutularında hangisini
        aldığınız lot pasaportunda açıkça yazar. Karşılaştırma için{" "}
        <a href="#karsilastir">yukarıdaki bölüme</a> bakabilirsiniz.
      </>
    ),
  },
  {
    q: "Baskil kayısısı coğrafi işaretli mi?",
    a: (
      <>
        Bu konuda dürüst olmak işin bir parçası: Baskil kayısısı bugün "Malatya Kayısısı"
        coğrafi işaretinin coğrafi sınırları içinde yer alan üretim alanlarından biri olarak
        anılıyor ve ilçede Baskil adının ayrıca tanınması için girişimler sürüyor. Patik bir
        tescil rozeti iddiasında bulunmaz; onun yerine her kutuda bahçeyi, hasat haftasını ve
        kurutma yolunu gösteren lot pasaportu sunar. Yani iddiamız belge değil, izlenebilirliktir.
      </>
    ),
  },
  {
    q: "Lot pasaportu ne işe yarıyor, nasıl çalışıyor?",
    a: (
      <>
        Her kutu, tek bir bahçe ve tek bir kurutma partisinden doldurulur; bu partiye lot denir.
        Kutudaki kodu <a href="#lot-sorgula">lot sorgulama bölümüne</a> yazdığınızda bahçe,
        köy, hasat haftası, kurutma süresi ve patik tarihi karşınıza çıkar. Beğendiğiniz kutuyu
        aynı lottan yeniden istemek ya da hediye ettiğiniz kişinin bahçeyi kendisinin görmesi
        de bu sayede mümkün olur. Demodaki lot kayıtları temsilîdir.
      </>
    ),
  },
  {
    q: "Kuru kayısıyı nasıl saklamalıyım?",
    a: (
      <>
        Serin ve kuru bir dolapta, ağzı kapalı bir kapta, güneşten uzakta. Pasaporttaki saklama
        satırı lottan lota değişebilir: gün kurusu islimliye göre daha hızlı tüketilmelidir.
        Uzun süre bekletecekseniz buzlukta hava almayan kapta saklamak dokusunu korur;
        yemeden önce oda sıcaklığına gelmesi yeterli.
      </>
    ),
  },
  {
    q: "Kayısı çekirdeği içini ne kadar tüketmeliyim?",
    a: (
      <>
        Kayısı çekirdeği içi Baskil'de sofrada yer bulur ama ölçülü tüketilir. Günde birkaç adedi
        aşmamanız önerilir; çekirdeği çocukların erişemeyeceği yerde tutun. Patik bu üründe
        sağlık faydası iddiası taşımaz — çekirdek, patikte ziyan olmasın diye sunulur.
      </>
    ),
  },
  {
    q: "Patik gerçek bir işletme mi, buradan sipariş verebilir miyim?",
    a: (
      <>
        Hayır. Patik, GakCoding etkinliği için bir günde tasarlanmış kurgusal bir marka
        konseptidir. Sitedeki üretici profili, fiyatlar, stok ve lot kayıtları temsilîdir;
        sepet ve sipariş akışı gerçeğine uygun çalışır ama gerçek sipariş/ödeme alınmaz,
        form verileriniz hiçbir yere gönderilmez. Konseptin amacı, Baskil kayısının adıyla
        satışının nasıl izlenebilir hâle gelebileceğini göstermektir.
      </>
    ),
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section faq" id="sss" aria-labelledby="sss-baslik">
      <div className="section__head">
        <p className="kicker">Açık yüreklilik köşesi</p>
        <h2 id="sss-baslik">Sık sorulanlar</h2>
      </div>
      <div className="faq__list">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className={`faq__item${isOpen ? " is-open" : ""}`}>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`sss-panel-${i}`}
                  id={`sss-btn-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{f.q}</span>
                  <span className="faq__icon" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
              </h3>
              <div
                id={`sss-panel-${i}`}
                role="region"
                aria-labelledby={`sss-btn-${i}`}
                hidden={!isOpen}
                className="faq__panel"
              >
                <p>{f.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
