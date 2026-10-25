/* ------------------------------------------------------------------ */
/*  PATİK — veri katmanı                                              */
/*  Ürün, lot ve üretici kayıtları GakCoding demosu için hazırlanmış   */
/*  temsilî içeriktir. Gerçek kişi, işletme veya satış verisi değildir.*/
/* ------------------------------------------------------------------ */

export interface SizeOption {
  id: string;
  label: string;
  price: number; // TL, tam sayı (demo fiyat)
}

export interface Product {
  id: string;
  name: string;
  short: string;
  desc: string;
  img: string;
  alt: string;
  badge?: string;
  lotCodes: string[];
  sizes: SizeOption[];
  note?: string;
  tags: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "gun-kurusu",
    name: "Gün Kurusu",
    short: "İslimsiz, doğrudan güneşle",
    desc: "Kükürt odasına girmeden sergide kurur; rengi koyulaşır, tadı yoğunlaşır. Koyu amber görünümü kusur değil, gün kurusunun imzasıdır.",
    img: "/img/gun-kurusu.jpg",
    alt: "Seramik kasede koyu amber renkli gün kurusu kayısılar",
    badge: "İslimsiz",
    lotCodes: ["PT-26-047"],
    sizes: [
      { id: "g500", label: "500 g", price: 385 },
      { id: "g1000", label: "1 kg", price: 720 },
    ],
    note: "Açıldıktan sonra serin ve kuru yerde, ağzı kapalı saklayın; gün kurusu islimliye göre daha özen ister.",
    tags: ["Yumuşak doku", "Yoğun tat", "Çay yanı"],
  },
  {
    id: "islimli",
    name: "İslimli Jumbo",
    short: "Rengi korunmuş, iri boy",
    desc: "Hasat sonrası islim damında rengi korunarak kurutulur. Canlı turuncu rengi ve diri dokusuyla tatlılarda, hoşafta ve sunumda şeklini korur.",
    img: "/img/islimli.jpg",
    alt: "Seramik kasede parlak turuncu islimli kuru kayısı yarıları",
    badge: "Jumbo boy",
    lotCodes: ["PT-26-112"],
    sizes: [
      { id: "i500", label: "500 g", price: 340 },
      { id: "i1000", label: "1 kg", price: 640 },
    ],
    note: "Serin ve kuru yerde saklayın. İslimli kayısı, rengini koruduğu için hediyelik sunumlarda da tercih edilir.",
    tags: ["Diri doku", "Canlı renk", "Mutfak & tatlı"],
  },
  {
    id: "cekirdek",
    name: "Kayısı Çekirdeği İçi",
    short: "Patikten artan çekirdek, ziyan olmaz",
    desc: "Patik mesaisinde çıkan çekirdekler kırılır, içi ayıklanır. Baskil'de kayısının çekirdeği de değerlidir; bu kutuda o emek de sofraya gelir.",
    img: "/img/cekirdek.jpg",
    alt: "Ahşap kasede kayısı çekirdeği içleri ve yanında kırılmış çekirdekler",
    badge: "Sıfır atık",
    lotCodes: ["PT-26-089"],
    sizes: [
      { id: "c250", label: "250 g", price: 210 },
      { id: "c500", label: "500 g", price: 390 },
    ],
    note: "Sorumlu tüketim: kayısı çekirdeği içini az miktarda, günde birkaç adedi aşmadan tüketmeniz önerilir.",
    tags: ["Az miktarda tüketin", "Kırılmış & ayıklanmış"],
  },
  {
    id: "hediye",
    name: "Fırat Sergisi Kutusu",
    short: "Üç lot, tek hediye kutusu",
    desc: "Gün kurusu (400 g), islimli jumbo (400 g) ve çekirdek içi (200 g) aynı kutuda. Üç lotun pasaportu da kutunun içinde gelir; hediye ettiğiniz kişi bahçeyi kendisi sorgulayabilir.",
    img: "/img/hediye.jpg",
    alt: "İçinde gün kurusu, islimli kayısı ve çekirdek kesesi görünen kraft hediye kutusu",
    badge: "Hediyelik",
    lotCodes: ["PT-26-047", "PT-26-112", "PT-26-089"],
    sizes: [{ id: "h1000", label: "1 kg · 3 bölmeli", price: 890 }],
    note: "Hediye notunuzu sipariş adımında yazabilirsiniz (demo).",
    tags: ["3 lot pasaportu", "Deneme üçlüsü", "Hediye sunumu"],
  },
];

/* ---------------------------- Lotlar ------------------------------ */

export interface Lot {
  code: string;
  productName: string;
  method: string;
  bahce: string;
  koy: string;
  hasat: string;
  kurutma: string;
  patik: string;
  eleme: string;
  uretici: string;
  saklama: string;
}

export const LOTS: Lot[] = [
  {
    code: "PT-26-047",
    productName: "Gün Kurusu — İslimsiz",
    method: "Güneşte kurutma (islimsiz)",
    bahce: "Gölyaka Parseli, teras 3 (temsili kayıt)",
    koy: "Çavuşlu Köyü, Baskil",
    hasat: "2026 · 29. hafta (Temmuz)",
    kurutma: "Sergide 5 gün, islim uygulanmadı",
    patik: "Hasattan 2 gün sonra, elle çıkarıldı",
    eleme: "Orta-jumbo karışık boy, el elemesi",
    uretici: "Temsili üretici künyesi: Fatma & Ali D. ailesi",
    saklama: "Serin, kuru, ışık almayan yerde; açtıktan sonra ağzı kapalı",
  },
  {
    code: "PT-26-112",
    productName: "İslimli Jumbo",
    method: "İslim (kükürt odası) + güneşte kurutma",
    bahce: "Kıyıdüzü Parseli, sıra 7–12 (temsili kayıt)",
    koy: "Karakaya kıyısı, Baskil",
    hasat: "2026 · 30. hafta (Temmuz)",
    kurutma: "İslim damında 1 gün, ardından sergide toplam 5 gün",
    patik: "İlk kurumadan sonra, elle çıkarıldı",
    eleme: "Jumbo boy, tek tek elden geçirildi",
    uretici: "Temsili üretici künyesi: Fatma & Ali D. ailesi",
    saklama: "Serin ve kuru yerde; güneşten uzak tutun",
  },
  {
    code: "PT-26-089",
    productName: "Kayısı Çekirdeği İçi",
    method: "Patik çekirdeklerinden, kırılmış ve ayıklanmış",
    bahce: "Gölyaka + Kıyıdüzü parselleri (temsili kayıt)",
    koy: "Çavuşlu Köyü, Baskil",
    hasat: "2026 · 29–30. haftalar",
    kurutma: "Çekirdekler gölgede kurutuldu, sonra kırıldı",
    patik: "Bu lot, iki kayısı lotunun patik çıktısıdır",
    eleme: "Kırık içler ayıklandı, bütün içler paketlendi",
    uretici: "Temsili üretici künyesi: Fatma & Ali D. ailesi",
    saklama: "Ağzı kapalı, serin yerde; günde birkaç adedi aşmayın",
  },
];

export function findLot(raw: string): Lot | undefined {
  const norm = raw.trim().toLocaleUpperCase("tr-TR").replace(/\s+/g, "");
  return LOTS.find((l) => l.code.replace(/\s+/g, "") === norm);
}

/* --------------------------- Süreç ------------------------------- */

export interface ProcessStep {
  no: string;
  title: string;
  kicker: string;
  text: string;
  chip: string;
  img: string;
  alt: string;
}

export const PROCESS: ProcessStep[] = [
  {
    no: "01",
    title: "Hasat",
    kicker: "Dalından kasaya",
    text: "Baskil'de hasat temmuzda başlar, ağustos ortasına uzanır. Olgunlaşan kayısı dalından toplanıp kasalanır; bekletilmeden kurutma alanına taşınır. Doğru gün, kutudaki tadın ilk kararıdır.",
    chip: "Temmuz – Ağustos",
    img: "/img/dal.jpg",
    alt: "Dalında olgunlaşmış altın sarısı kayısılar ve yeşil yapraklar",
  },
  {
    no: "02",
    title: "Yol Ayrımı: İslim mi, Gün mü?",
    kicker: "Kutunun karakteri burada belli olur",
    text: "Kayısının bir kısmı rengini korumak için islim damına (kükürt odası) girer, bir kısmı hiç islim görmeden doğrudan sergiye çıkar. İslimli parlak ve diri kalır; gün kurusu koyulaşır, tadı yoğunlaşır. Patik, bu ayrımı kutunun üstünde saklamaz — yazar.",
    chip: "İslim damı ≈ 1 gün",
    img: "/img/hero.jpg",
    alt: "Ahşap kasadan dökülen koyu gün kurusu ve parlak islimli kayısılar",
  },
  {
    no: "03",
    title: "Sergi",
    kicker: "Güneş işe başlar",
    text: "Kayısılar geniş bezlerin üzerine serilir. Karakaya Baraj Gölü kıyısındaki bahçelerde yaz güneşi, kayısının suyunu alırken tadını içinde bırakır. İlk kuruma yaklaşık iki gün sürer.",
    chip: "İlk kuruma ≈ 2 gün",
    img: "/img/sergi.jpg",
    alt: "Göl kıyısındaki yamaçta bezler üzerine serilmiş kuruyan kayısılar (temsilî görsel)",
  },
  {
    no: "04",
    title: "Patik",
    kicker: "Markaya adını veren mesai",
    text: "Yarı kuruyan kayısının çekirdeği tek tek elle çıkarılır; Baskil'de bu işe patik denir. Bu adımda her kayısı elden geçer: ezilen, yara alan ayrılır. Çıkan çekirdek de atılmaz; kırılıp içi ayrıca değerlendirilir.",
    chip: "Tek tek, elle",
    img: "/img/patik.jpg",
    alt: "Tepsi dolusu yarı kuru kayısının çekirdeklerini elle çıkaran üretici elleri",
  },
  {
    no: "05",
    title: "Çir",
    kicker: "Son kurutma",
    text: "Çekirdeği çıkan kayısı son kez güneşe serilir. Yaklaşık üç günün sonunda halk arasında çir denen, kutuya girmeye hazır kuru kayısıya dönüşür. Bu sürece önceden karar verilemez; hava ne derse o olur.",
    chip: "Son kuruma ≈ 3 gün",
    img: "/img/gun-kurusu.jpg",
    alt: "Kasede son kurutması tamamlanmış koyu renkli kuru kayısılar",
  },
  {
    no: "06",
    title: "Eleme ve Lot Pasaportu",
    kicker: "Kutuya giren, kaydıyla girer",
    text: "Kuru kayısı boyuna göre elenir, bahçe bahçe ayrılır ve her grup bir lot kodu alır. Kutunun içindeki pasaportta o lotun bahçesi, hasat haftası ve kurutma geçmişi yazar; kodu bu siteden sorgulayabilirsiniz.",
    chip: "Her kutuda pasaport",
    img: "/img/hediye.jpg",
    alt: "Üç bölmeli kraft kutuda lotlarına ayrılmış kayısılar",
  },
];

/* --------------------- Lotunu Kur (seçici) ----------------------- */

export type UseCase = "atistirmalik" | "hediye" | "mutfak" | "deneme";
export type Taste = "koyu" | "parlak" | "fark-etmez";
export type Amount = "kucuk" | "aile" | "coklu";

export interface QuizAnswers {
  use: UseCase | null;
  taste: Taste | null;
  amount: Amount | null;
}

export interface Recommendation {
  product: Product;
  size: SizeOption;
  reasons: string[];
  kernelTip: boolean;
}

function byId(id: string): Product {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) throw new Error("Ürün bulunamadı: " + id);
  return p;
}

export function recommend(a: Required<QuizAnswers>): Recommendation {
  const reasons: string[] = [];
  let product: Product;
  let size: SizeOption;

  const gun = byId("gun-kurusu");
  const islim = byId("islimli");
  const box = byId("hediye");

  if (a.use === "hediye" || a.use === "deneme" || a.amount === "coklu") {
    product = box;
    size = box.sizes[0];
    if (a.use === "hediye")
      reasons.push("Hediye edeceğiniz için üç bölmeli kutuyu seçtik; içinde üç lotun pasaportu da var, hediyeyi alan kişi bahçeyi kendisi sorgulayabilir.");
    if (a.use === "deneme")
      reasons.push("Kararsızlara tek kutuda üçünü birden öneriyoruz: gün kurusunu da islimliyi de çekirdeği de aynı hasattan tadıp karar verebilirsiniz.");
    if (a.amount === "coklu" && a.use !== "hediye")
      reasons.push("Birden fazla kişiyle paylaşacaksınız; bölmeli kutu, herkesin kendi damak tadına göre seçmesine izin verir.");
  } else if (a.use === "mutfak" && a.taste !== "koyu") {
    product = islim;
    size = a.amount === "aile" ? islim.sizes[1] : islim.sizes[0];
    reasons.push("Mutfakta kullanacağınız için islimliyi önerdik: diri dokusu hoşafta ve tatlıda dağılmaz, rengini korur.");
  } else if (a.taste === "parlak") {
    product = islim;
    size = a.amount === "aile" ? islim.sizes[1] : islim.sizes[0];
    reasons.push("Parlak ve diri sevdiğinizi söylediniz; islimli jumbo, taze kayısı rengine ve tadına en yakın duran kurutma biçimidir.");
  } else {
    product = gun;
    size = a.amount === "aile" ? gun.sizes[1] : gun.sizes[0];
    reasons.push("Koyu ve yoğun taraftasınız; islim görmeden kuruyan gün kurusu, karamelimsi tadıyla çayın yanına en çok yakışan hâlidir.");
    if (a.use === "mutfak")
      reasons.push("Mutfakta da kullanabilirsiniz; hoşafa rengi koyu ama tadı derin bir karakter verir.");
  }

  if (size.label.includes("1 kg") && product.id !== "hediye")
    reasons.push("Aile boyu seçtiğiniz için 1 kg önerdik; kilogram fiyatı 500 grama göre daha avantajlıdır.");
  if (size.label.includes("500 g"))
    reasons.push("İlk deneme için 500 gram yeterli; beğenirseniz aynı lot kodu kayıtlarda durur.");

  return { product, size, reasons, kernelTip: product.id !== "hediye" && product.id !== "cekirdek" };
}

/* ------------------------- Yardımcılar --------------------------- */

export const TL = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export function formatTL(v: number): string {
  return TL.format(v);
}

export const FREE_SHIPPING_LIMIT = 750;
export const SHIPPING_FEE = 69;
