# DEMO SENARYOSU — Etkinlik Günü Koşu Planı (1 Kasım 2026)

Patik takımı için günün akışı. Amaç: sunum anına sıfır sürprizle çıkmak.
Etkinlik: Ahmet Tevfik Ozan Fuar ve Kongre Merkezi, 11.00–18.00 (resmî sayfa).

## Roller (4 kişi)

| Rol | İş |
|---|---|
| **Kaptan / Sunucu** | 90 sn metin (SUNUM.md), jüri sorularında ilk söz |
| **Demo Sürücüsü** | Sunum sırasında siteyi kullanan kişi; provayı o yapar, siteyi `?prova=1` ile açar |
| **Teknik** | Replit kopyası, ağ/yedek plan, radyo ses testi |
| **İçerik & Masa** | Basılı lot pasaportu, son metin okuması, jüri soru yedekleri |

## Saat saat

- **11.00–11.30 Kurulum:** Masaya yerleş, priz/üçlü, su. Projeyi Replit'e aktar:
  *Import from GitHub* → `main` dalı → Run. Açılışı telefon
  ve dizüstünden doğrula. (Yedek: USB'de repo zip'i + telefonda akış videosu çekili.)
- **11.30–12.30 Canlı test:** SUNUM.md §E listesini koş. Radyoyu salonda dene:
  TRT Türkü açılıyor mu, ses hoparlöre gidiyor mu? Açılmıyorsa sunumda radyo
  bölümünü "çevrimiçi katman" diye anlat, ekran görüntüsü göster — panik yok.
- **12.30–13.30 İçerik rötuşu:** Takım adını, kaptan adını footer'a işle; fiyatlara
  son göz; yazılı pasaport çıktısı al (Lot Sorgula → Yazdır) — jüri masasına bırakılacak.
  (Takım bilgisi artık `src/team.ts` içindeki `TEAM` sabitinde; alt bilgi ve Jüri Özeti
  aynı yerden besleniyor. Sunumdan önce isimleri son kez gözden geçir.)
- **13.30–15.30 Geliştirme penceresi:** Yalnızca küçük, güvenli işler. Büyük özellik
  eklemek yok; her değişiklikten sonra `npm run build` + ana akış testi.
- **15.30–16.30 Prova ×3:** Prova Modu'nun yerleşik 105 saniye sayacıyla. Sürücü tıklama sırasını ezberler
  (SUNUM.md §B). Biri jüri rolüyle §C'deki 5 soruyu sorar.
- **16.30–17.00 Dondur:** Kod değişikliği bitti. `npm run verify` çıktısını sakla; son build, son bakış, pasaport
  baskıları hazır, telefon sessizde, su içildi.
- **Sunum:** Derin nefes. Prova konsolunu P ile küçült. Önce sorun cümlesi, sonra canlı akış. Radyoyu bonus
  bölümde aç; jüriden bir kişiyi Patik Ustası'nda oynatmak buzları eritir.

## Risk tablosu

| Risk | Önlem |
|---|---|
| Salon interneti yok/zayıf | Site yerelden çalışır; radyo hariç her şey çevrimdışı. Atlas/Evren paketleri sayfa boşta kaldığında önden indirilir; bir paket alınamazsa o bölüm "yüklenemedi" mesajıyla kapanır, **sayfanın geri kalanı çalışmaya devam eder** (sayfa asla boş kalmaz). Telefon hotspot hazır |
| Replit yavaş açılıyor | Yedek: telefonda önceden çekilmiş 60 sn akış videosu + ekran görüntüleri |
| Projeksiyon renkleri bozuk | Koyu metin/açık krem zaten kontrastı yüksek; parlaklığı kontrol et |
| Radyo HTTPS'te açılmaz | TRT Türkü birincil; FM 23 takılırsa çalar açıklar, resmî siteye geç |
| Sepet eski veriyle dolu | Sunum öncesi gizli sekme kullan (temiz localStorage) |
| Jüri "gerçek mi?" derse | Gülümse: "Açıkça etiketledik" → §C/2 cevabı + KAYNAKLAR.md göster |
| Atlas/Evren sayıları gerçek sanılırsa | 811 Atlas + 989 Evren kaydının temsilî arayüz ölçeği olduğunu ilk cümlede söyle; kanonik akışın 3 lotla çalıştığını göster |
| Sayfa uzunluğu jüriyi yorarsa | Vitrin + Saha Defteri ile ölçeği ilk dakikada göster; ana akışı Lotunu Kur → Sepet → Pasaport sırasıyla bitir, Oyun Masası'nı 14 saniyede göster, Atlas ve Evreni bonus bırak |
| Jüri oyunları "boş yere" sanırsa | Lot Pusulası'nın ipuç kartını göster: "204 lot kaydının hepsi sitede"; oyunun veriyi okuttuğunu söyle (SUNUM.md §C/4) |
| Jüri "sitede gerçekten yapay zekâ var mı?" derse | "Üretimde kullandık, çalışma zamanında bilerek çağırmıyoruz" → Yapay Zekâ Defteri'ndeki 5 adımlı üretim kaydını göster, sonra eşleştiricinin çevrimdışı çalıştığını göster (SUNUM.md §C/7) |
| Eşleştirici cümleyi yanlış anlarsa | Örnek cümleler (4 hazır chip) her zaman doğru sonucu verir; jüri bunlardan birine tıklarsa öneri kesin çıkar |
| Oyun Masası açılmazsa (ağ paketi) | Oyunlar ayrı paketten gelir; açılmazsa bölüm boş kalır ama sayfa çalışmaya devam eder. Yedek: Çay Molası'ndaki *Patik Ustası* ve *Baskil Bilgisi* her zaman ana pakette |
| Oyun sesi rahatsız ederse | Bölümde "Ses açık / kapalı" düğmesi var; sunumdan önce kapalıya al |

## Jüri masası kiti

1. Basılı lot pasaportu (PT-26-047) — elden ele geçsin
2. Açık site (dizüstü + telefon yedeği)
3. Tek sayfa not: slogan, üç cümlelik fikir, iletişim/takım adı
4. **Jüri Özeti**'nin basılı kopyası (sitedeki "Jüri Özeti" düğmesi → Yazdır / PDF kaydet)
5. (Varsa) gerçek bir avuç kuru kayısı — tadımlık küçük kase. *Not: fiziksel
   ürün getirirseniz "bunlar temsilî ürün değil, Baskil esnafından demo
   tadımlığı" diye ayırın; markanın kendi ürünüymüş gibi sunmayın.*

## Sahnede son cümle

> "Patik: bahçeden kutuna, lotuyla. Teşekkürler — şimdi isterseniz kendi
> lotunuzu 30 saniyede kuralım."
