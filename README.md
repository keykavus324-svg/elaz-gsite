# PATİK — Baskil Kayısı Atölyesi

**Canlı site:** https://keykavus324-svg.github.io/elaz-gsite/

**GitHub:** https://github.com/keykavus324-svg/elaz-gsite

**Vitrin:** *Kayısı kurur. Kaydı kalır.*

**Slogan:** *Bahçeden kutuna, lotuyla.*

Elazığ'ın Baskil kayısısı için tasarlanmış, tek sayfalık tanıtım ve demo sipariş sitesi.
GakCoding etkinliği (1 Kasım 2026, Elazığ) için yarışma konsepti olarak hazırlanmıştır.

## Fikir

Baskil'de kuruyan kayısı çoğunlukla tüccar üzerinden başka adlarla satılır; tüketicinin
"Gün kurusu mu islimli mi, hangi bahçeden?" sorusunun cevabı yoktur. **Patik** (Baskil'de
kayısının çekirdeğini elle çıkarma mesaisinin adı) bunu iki imzayla çözer:

1. **Lotunu Kur** — 3 soruluk seçici, kullanımına ve damak tadına uygun kurutma biçimini
   ve gramajı gerekçesiyle önerir.
2. **Lot Pasaportu** — her kutunun bahçesi, hasat haftası ve kurutma geçmişi kutudaki
   kodla (örn. `PT-26-047`) siteden sorgulanabilir.

## Çalıştırma

### Yerelde

```bash
npm install
npm run dev        # http://localhost:5000
npm run build      # dist/ altında üretim çıktısı
npm run preview    # üretim çıktısını önizle
npm run typecheck  # TypeScript tip kontrolü
npm run content:generate:all # Atlas + Evren veri dosyalarını kaynaktan yeniden üret
npm run verify:atlas         # 811 Atlas kaydı + 40.000 satır hedefini doğrula
npm run verify:universe      # 989 Evren kaydı, 365 gün ve panel bağlantılarını doğrula
npm run verify               # typecheck + Atlas + Evren denetimi + üretim derlemesi
```

### Replit'te

1. Bu depoyu Replit'e "Import from GitHub" ile çekin (veya dosyaları yeni bir Repl'e kopyalayın).
2. **Run** düğmesine basın. `.replit` dosyası `npm run dev` çalıştırır; Vite, `0.0.0.0:5000`
   üzerinde her hosta açık ayarlanmıştır (`vite.config.ts`).
3. Bağımlılıklar ilk çalıştırmada otomatik kurulur (yalnızca React + Vite).

Başka hiçbir kurulum, API anahtarı veya veritabanı gerekmez. Google Fonts yüklenemezse
site yedek yazı tipleriyle aynen çalışır; görseller yereldir (`public/img/`).

### GitHub Pages

`.github/workflows/deploy-pages.yml`, desteklenen dallara her gönderimde önce
`npm run verify` çalıştırır; doğrulama geçerse `VITE_BASE_PATH=/elaz-gsite/` ile
üretilen `dist/` çıktısını GitHub Pages'e yayınlar. Canlı adres:
https://keykavus324-svg.github.io/elaz-gsite/

## Yapı

```
index.html            Başlık, meta/OG etiketleri, yazı tipleri, favicon
public/img/           Yapay zekâ ile üretilmiş, optimize edilmiş temsilî görseller (11 adet)
public/favicon.svg    El çizimi SVG kayısı amblemi
src/data.ts           Ürün, lot, süreç verileri + öneri motoru (tüm demo içeriği burada)
src/cart.tsx          Sepet durumu (localStorage) + kargo/toplam kuralları
src/components/       Header, Hero, FieldDesk (Saha Defteri), ChapterRail, Compare, Process, Producer,
                      Mola (radyo/oyun), Atlas, Universe,
                      universe/ altında Operasyon, 365 Gün, Kalite, Kutu Hattı, Hediye ve Okul panelleri
                      LotBuilder (imza), YzDefteri (YZ Defteri), Products, Mutfak, LotLookup, LotPassport,
                      Faq, CartDrawer, Footer, Prova (gizli sunum konsolu)
src/content/          Atlas çekirdeği: 204 lot + 52 hafta + 155 kavram + 96 tarif +
                      160 bilgi kartı + 144 soru = 811 temsilî kayıt
                      Evren katmanı: 365 gün + 48 parsel + 192 kalite + 144 kutu +
                      120 hediye + 120 ders = 989 temsilî kayıt
src/atlas.css         Atlas için ayrı yüklenen sakin kâğıt tonlu arayüz stilleri
src/universe.css      Evren panellerinin ayrı yüklenen panoları, takvimleri ve simülasyon stilleri
src/yz.css            Yapay Zekâ Defteri paneli, eşleştirici kartı ve üretim kaydı stilleri
src/styles.css        Temel tasarım sistemi (sergi kremi / amber / çekirdek kahvesi), mobil önce
src/redesign.css      Hasat Defteri vitrini, Saha Defteri, bölüm rayı ve yeni sayfa ritmi
scripts/              Atlas veri üreticisi, kaynak listeleri ve bütünlük doğrulaması
KAYNAKLAR.md          Kaynakça, görsel ve lisans notları, temsilî içerik listesi
DEMO-SENARYO.md       Etkinlik günü koşu planı: roller, saatler, riskler, jüri masası kiti
SUNUM.md              90 saniyelik jüri metni, canlı demo sırası, jüri soruları
```

## Çalışan akışlar

- **Hasat Defteri vitrini:** Sergi + patik yakın çekimi, beş duraklı yol, çalışan lot bileti ve
  1.800 temsilî kayda açılan koyu kayıt şeridiyle yeni ilk ekran
- **Saha Defteri:** İlk ekranın hemen altında günün sezon kartını, bir lotu, tarif/sözlük fişini,
  kalite-kutu kaydını ve günün dersini ayrı veri paketleriyle çalıştıran altı istasyonlu konsol
- Geniş ekranda bölüm rayı ve kaydırma ilerlemesi; mobilde iki katmanlı üst bar ve numaralı menü
- Gün/islim karşılaştırma: sürüklenebilir görsel kaydırıcı + ayrıntı sekmeleri
- 6 adımlık etkileşimli üretim süreci, kayan yöresel sözlük şeridi, görünüm animasyonları
- **Çay Molası:** canlı radyo çaları (TRT Türkü HLS, Radyo FM 23 Elazığ; Radyo Fırat resmî
  site bağlantısı) ve iki mini oyun — *Patik Ustası* (30 sn refleks, rekor saklanır)
  ve *Baskil Bilgisi* (5 soruluk bilgi yarışması); radyoda hata durumunda anlaşılır
  yedek yolu gösterilir, sitenin geri kalanı internetsiz çalışmayı sürdürür
- Mobilde kaydırdıkça beliren "Lotunu Kur" yüzer eylem düğmesi
- Lotunu Kur: 3 soru → gerekçeli ürün/gramaj önerisi → çekirdek ekleme → sepete
- **Yapay Zekâ Defteri:** serbest cümleyi okuyup tarayıcıda, kural tabanlı ve çevrimdışı çalışan bir
  eşleştiriciyle gerekçeli lot önerisine çevirir (anlaşılan boyutlar, gramaj, lot kodu, pasaport ve
  sepete bağlanır); yanında sitenin yapay zekâ destekli üretim kaydı (5 adım + doğrulama sayıları) durur
- Mevsim & Mutfak: 5 mevsimlik hasat takvimi + Hoşaf Hesapçısı (kişi sayısı → gram/su/paket hesabı ve sepete bağlar)
- **Patik Evreni:** Atlas verisini işleten ikinci katman. Operasyon panosu ve teras haritası,
  365 günlük sezon planı, 192 kalite kontrolü, çalıştırılabilir kutu hattı simülasyonu,
  sepete bağlı 120 hediye senaryosu ve ilerlemesi tarayıcıda saklanan 120 derslik Patik Okulu
- **Patik Atlası:** 811 temsilî kayıt üzerinde çalışan aranabilir lot defteri, 52 haftalık
  sezon planı, 155 kavramlık sözlük, 96 tarif kartı, senaryolu bilgi kartları ve 144 soruluk
  çalışma bankası; ana paketi ağırlaştırmadan ayrı chunk olarak yüklenir
- Lot pasaportunu paylaşma: `?lot=PT-26-047` derin bağlantısı, panoya kopyalama ve yazdırılabilir/PDF pasaport
- Ürün kartlarında gramaj seçimi, lot kodu ile pasaporta atlama
- Lot sorgulama: büyük/küçük harf ve boşluk toleranslı, hatalı kodda anlaşılır uyarı
- Sepet: adet artır/azalt/kaldır, ücretsiz kargo barı (750 ₺), kalıcı sepet (localStorage)
- Demo sipariş formu: Türkçe doğrulama ve hata mesajları → sipariş özeti + lot kodları
- **Prova Modu (ekip içi):** adrese `?prova=1` eklenince 8 adımlı konuşmacı
  konsolu (son adım bonus: Yapay Zekâ Defteri), 105 saniye sayacı, klavye adımları (←/→) ve P ile
  küçültme açılır; normal ziyaretçi adresinde görünmez
- **Bağlantı dayanıklılığı:** Atlas/Evren/Saha Defteri paketleri sayfa boşta kaldığında önden
  indirilir; bir paket alınamazsa `SectionBoundary` o bölümü "yüklenemedi" mesajıyla kapatır —
  sayfa hiçbir koşulda tamamen boş kalmaz ve kanonik akış sürer

## Demo ve dürüstlük notları

- Bu site bir **yarışma demosudur**: gerçek satış, ödeme, üyelik ve takip kodu yoktur.
  Form verileri hiçbir yere gönderilmez.
- Üretici profili ("Fatma & Ali D."), fiyatlar, parsel bilgileri ve lot kayıtları
  **temsilîdir** ve sitede açıkça böyle etiketlenir. Atlas'taki 204 lotluk geniş defter
  ve operasyon miktarları da gerçek kayıt değildir. Evren'deki 989 parsel/günlük/kalite/kutu/
  hediye/ders kaydı da aynı temsilî çerçevededir; kanonik alışveriş akışı 3 demo lotla çalışır.
- Site **yapay zekâ destekli araçlarla** üretilmiştir (kod, metin, görsel, kayıt verisi). Bu, sitede
  "Yapay Zekâ Defteri" bölümünde açıkça anlatılır. Buna karşılık çalışma zamanında hiçbir dış API'ye
  bağımlılık yoktur: "Cümleni anlat" eşleştiricisi tarayıcıda, kural tabanlı ve çevrimdışı çalışır;
  bu yüzden bir dil modeli çağırdığımız iddiasında değiliz.
- Sağlık/beslenme iddiası, sahte ödül/sertifika/müşteri yorumu kullanılmamıştır.
  Baskil kayısının coğrafi işaret durumu sitede dürüstçe anlatılır (bkz. SSS).
- Görseller yapay zekâ ile üretilmiştir; gerçek üretici veya tesis fotoğrafı olarak
  sunulmaz (alt yazılarda belirtilir). Ayrıntı: `KAYNAKLAR.md`.

## Erişilebilirlik

Anlamsal HTML, görünür odak halkası, klavye ile kullanılabilir tüm kontroller,
etiketli form alanları, `aria-live` geri bildirimleri, görsellerde alternatif metin,
yeterli kontrast ve `prefers-reduced-motion` desteği. 320 px–1920 px arası tüm genişliklerde
yatay taşma yoktur (`overflow-x: clip` ile taşma görsel olarak korunur ama kaydırılamaz).
