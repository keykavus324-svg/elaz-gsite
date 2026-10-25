# PATİK — Baskil Kayısı Atölyesi

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
```

### Replit'te

1. Bu depoyu Replit'e "Import from GitHub" ile çekin (veya dosyaları yeni bir Repl'e kopyalayın).
2. **Run** düğmesine basın. `.replit` dosyası `npm run dev` çalıştırır; Vite, `0.0.0.0:5000`
   üzerinde her hosta açık ayarlanmıştır (`vite.config.ts`).
3. Bağımlılıklar ilk çalıştırmada otomatik kurulur (yalnızca React + Vite).

Başka hiçbir kurulum, API anahtarı veya veritabanı gerekmez. Google Fonts yüklenemezse
site yedek yazı tipleriyle aynen çalışır; görseller yereldir (`public/img/`).

## Yapı

```
index.html            Başlık, meta/OG etiketleri, yazı tipleri, favicon
public/img/           Yapay zekâ ile üretilmiş temsilî görseller (8 adet)
public/favicon.svg    El çizimi SVG kayısı amblemi
src/data.ts           Ürün, lot, süreç verileri + öneri motoru (tüm demo içeriği burada)
src/cart.tsx          Sepet durumu (localStorage) + kargo/toplam kuralları
src/components/       Header, Hero, Compare (gün/islim), Process (6 adım), Producer,
                      LotBuilder (imza), Products, LotLookup, LotPassport, Faq,
                      CartDrawer (demo sipariş), Footer
src/styles.css        Tasarım sistemi (sergi kremi / amber / çekirdek kahvesi), mobil önce
KAYNAKLAR.md          Kaynakça, görsel ve lisans notları, temsilî içerik listesi
DEMO-SENARYO.md       Etkinlik günü koşu planı: roller, saatler, riskler, jüri masası kiti
SUNUM.md              90 saniyelik jüri metni, 5 adımlık canlı demo, jüri soruları
```

## Çalışan akışlar

- Gün/islim karşılaştırma: sürüklenebilir görsel kaydırıcı + ayrıntı sekmeleri
- 6 adımlık etkileşimli üretim süreci, kayan yöresel sözlük şeridi, görünüm animasyonları
- **Çay Molası:** canlı radyo çaları (TRT Türkü HLS, Radyo FM 23 Elazığ; Radyo Fırat resmî
  site bağlantısı) ve iki mini oyun — *Patik Ustası* (30 sn refleks, rekor saklanır)
  ve *Baskil Bilgisi* (5 soruluk bilgi yarışması); radyoda hata durumunda anlaşılır
  yedek yolu gösterilir, sitenin geri kalanı internetsiz çalışmayı sürdürür
- Mobilde kaydırdıkça beliren "Lotunu Kur" yüzer eylem düğmesi
- Lotunu Kur: 3 soru → gerekçeli ürün/gramaj önerisi → çekirdek ekleme → sepete
- Mevsim & Mutfak: 5 mevsimlik hasat takvimi + Hoşaf Hesapçısı (kişi sayısı → gram/su/paket hesabı ve sepete bağlar)
- Lot pasaportunu paylaşma: `?lot=PT-26-047` derin bağlantısı, panoya kopyalama ve yazdırılabilir/PDF pasaport
- Ürün kartlarında gramaj seçimi, lot kodu ile pasaporta atlama
- Lot sorgulama: büyük/küçük harf ve boşluk toleranslı, hatalı kodda anlaşılır uyarı
- Sepet: adet artır/azalt/kaldır, ücretsiz kargo barı (750 ₺), kalıcı sepet (localStorage)
- Demo sipariş formu: Türkçe doğrulama ve hata mesajları → sipariş özeti + lot kodları

## Demo ve dürüstlük notları

- Bu site bir **yarışma demosudur**: gerçek satış, ödeme, üyelik ve takip kodu yoktur.
  Form verileri hiçbir yere gönderilmez.
- Üretici profili ("Fatma & Ali D."), fiyatlar, parsel bilgileri ve lot kayıtları
  **temsilîdir** ve sitede açıkça böyle etiketlenir.
- Sağlık/beslenme iddiası, sahte ödül/sertifika/müşteri yorumu kullanılmamıştır.
  Baskil kayısının coğrafi işaret durumu sitede dürüstçe anlatılır (bkz. SSS).
- Görseller yapay zekâ ile üretilmiştir; gerçek üretici veya tesis fotoğrafı olarak
  sunulmaz (alt yazılarda belirtilir). Ayrıntı: `KAYNAKLAR.md`.

## Erişilebilirlik

Anlamsal HTML, görünür odak halkası, klavye ile kullanılabilir tüm kontroller,
etiketli form alanları, `aria-live` geri bildirimleri, görsellerde alternatif metin,
yeterli kontrast ve `prefers-reduced-motion` desteği. 360 px mobil genişlik dahil
yatay taşma olmayacak şekilde tasarlanmıştır.
