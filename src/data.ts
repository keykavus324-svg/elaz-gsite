/* ------------------------------------------------------------------ */
/*  PATİK — veri katmanı                                              */
/*  Ürün, lot ve üretici kayıtları GakCoding demosu için hazırlanmış   */
/*  temsilî içeriktir. Gerçek kişi, işletme veya satış verisi değildir.*/
/* ------------------------------------------------------------------ */

import { publicAsset } from "./assets";

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
    img: publicAsset("img/gun-kurusu.jpg"),
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
    img: publicAsset("img/islimli.jpg"),
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
    img: publicAsset("img/cekirdek.jpg"),
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
    img: publicAsset("img/hediye.jpg"),
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
    img: publicAsset("img/dal.jpg"),
    alt: "Dalında olgunlaşmış altın sarısı kayısılar ve yeşil yapraklar",
  },
  {
    no: "02",
    title: "Yol Ayrımı: İslim mi, Gün mü?",
    kicker: "Kutunun karakteri burada belli olur",
    text: "Kayısının bir kısmı rengini korumak için islim damına (kükürt odası) girer, bir kısmı hiç islim görmeden doğrudan sergiye çıkar. İslimli parlak ve diri kalır; gün kurusu koyulaşır, tadı yoğunlaşır. Patik, bu ayrımı kutunun üstünde saklamaz — yazar.",
    chip: "İslim damı ≈ 1 gün",
    img: publicAsset("img/islim.jpg"),
    alt: "Taş islim odasında ahşap raflarda islim damına girmiş yarım kayısılar (temsilî görsel)",
  },
  {
    no: "03",
    title: "Sergi",
    kicker: "Güneş işe başlar",
    text: "Kayısılar geniş bezlerin üzerine serilir. Karakaya Baraj Gölü kıyısındaki bahçelerde yaz güneşi, kayısının suyunu alırken tadını içinde bırakır. İlk kuruma yaklaşık iki gün sürer.",
    chip: "İlk kuruma ≈ 2 gün",
    img: publicAsset("img/sergi.jpg"),
    alt: "Göl kıyısındaki yamaçta bezler üzerine serilmiş kuruyan kayısılar (temsilî görsel)",
  },
  {
    no: "04",
    title: "Patik",
    kicker: "Markaya adını veren mesai",
    text: "Yarı kuruyan kayısının çekirdeği tek tek elle çıkarılır; Baskil'de bu işe patik denir. Bu adımda her kayısı elden geçer: ezilen, yara alan ayrılır. Çıkan çekirdek de atılmaz; kırılıp içi ayrıca değerlendirilir.",
    chip: "Tek tek, elle",
    img: publicAsset("img/patik.jpg"),
    alt: "Tepsi dolusu yarı kuru kayısının çekirdeklerini elle çıkaran üretici elleri",
  },
  {
    no: "05",
    title: "Çir",
    kicker: "Son kurutma",
    text: "Çekirdeği çıkan kayısı son kez güneşe serilir. Yaklaşık üç günün sonunda halk arasında çir denen, kutuya girmeye hazır kuru kayısıya dönüşür. Bu sürece önceden karar verilemez; hava ne derse o olur.",
    chip: "Son kuruma ≈ 3 gün",
    img: publicAsset("img/cir.jpg"),
    alt: "Taş duvar üzerindeki beze serilmiş, son kurutmasını tamamlayan çir kayısıları (temsilî görsel)",
  },
  {
    no: "06",
    title: "Eleme ve Lot Pasaportu",
    kicker: "Kutuya giren, kaydıyla girer",
    text: "Kuru kayısı boyuna göre elenir, bahçe bahçe ayrılır ve her grup bir lot kodu alır. Kutunun içindeki pasaportta o lotun bahçesi, hasat haftası ve kurutma geçmişi yazar; kodu bu siteden sorgulayabilirsiniz.",
    chip: "Her kutuda pasaport",
    img: publicAsset("img/hediye.jpg"),
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

/* ================================================================== */
/*  CÜMLEYLE EŞLEŞTİRME — Yapay Zekâ Defteri'nin yerel eşleştiricisi  */
/*                                                                     */
/*  Bilinçli olarak bir dil modeli çağırmaz. Eşleştirme, sitedeki    */
/*  kanonik ürün ve lot kayıtları üzerinde kural tabanlı, şeffaf ve   */
/*  çevrimdışı çalışır. Yazılan cümle hiçbir sunucuya gönderilmez.   */
/* ================================================================== */

const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o",
  ş: "s", Ş: "s", ü: "u", Ü: "u", â: "a", Â: "a", î: "i", Î: "i", û: "u", Û: "u",
};

/** Türkçe harfleri sadeleştirir, noktalama ve fazla boşlukları temizler. */
export function normalizeTr(input: string): string {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/[çÇğĞıİöÖşŞüÜâÂîÎûÛ]/g, (c) => TR_MAP[c] ?? c)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Anahtar kelimenin metinde geçip geçmediğini, kelime sınırına saygılı olarak bulur. */
function findHits(tokens: string[], keywords: string[]): string[] {
  const joined = tokens.join(" ");
  const hits: string[] = [];
  for (const kw of keywords) {
    if (kw.includes(" ")) {
      if (joined.includes(kw)) hits.push(kw);
    } else if (tokens.some((t) => t.startsWith(kw))) {
      hits.push(kw);
    }
  }
  return hits;
}

const USE_KEYWORDS: Array<[UseCase, string[]]> = [
  ["hediye", [
    "hediye", "hediyelik", "anne", "baba", "arkadas", "sevgili", "dogum", "evlilik",
    "bayram", "misafir", "ogretmen", "komus", "komsu", "gonder", "paket", "surdum",
  ]],
  ["mutfak", [
    "hosaf", "tatli", "mutfak", "yemek", "tarif", "pasta", "kek", "sarma", "baklava",
    "yogurt", "sut", "recel", "kurabiye", "kompot", "mamalya", "donma", "puding",
    "kahvalti", "dolma", "sarma", "seker",
  ]],
  ["deneme", [
    "deneme", "denemek", "kararsiz", "hepsini", "ikisini", "cesitli", "merak",
    "ozgun", "karsilastir", "gorus", "hepsi", "bilmek", "deneyim", "farkli",
  ]],
  ["atistirmalik", [
    "cay", "atistirma", "atistirmalik", "yanina", "sabah", "ogle", "aksam",
    "kavanoz", "isci", "ofis", "kahve", "molalar", "kasa",
  ]],
];

const TASTE_KEYWORDS: Array<[Taste, string[]]> = [
  ["koyu", [
    "koyu", "karamel", "karamelize", "yogun", "dolu", "bati", "cekirdekli",
    "siyah", "torra", "keskin", "gun kurusu", "eski usul", "bogaz",
  ]],
  ["parlak", [
    "parlak", "canli", "taze", "diri", "renkli", "rengini", "islim", "islimli",
    "jumbo", "buyuk", "donus", "saklanan", "uzun omur",
  ]],
];

const AMOUNT_KEYWORDS: Array<[Amount, string[]]> = [
  ["coklu", ["cok", "birkaç", "coklu", "ekip", "toplu", "fazla", "kisi", "paylas", "20", "30", "50", "100"]],
  ["aile", ["aile", "ailece", "ikimiz", "bizim", "haftalik", "gunluk", "evde", "eve", "evin", "mutfakta", "1 kg", "1kg"]],
  ["kucuk", ["kucuk", "kendi", "tek", "bireysel", "ilk", "kisisel", "az", "denemek"]],
];

const USE_LABEL: Record<UseCase, string> = {
  atistirmalik: "Çayın yanına atıştırmalık",
  hediye: "Hediye kutusu",
  mutfak: "Mutfakta: hoşaf, tatlı, yemek",
  deneme: "Üçünü birden deneme",
};

const TASTE_LABEL: Record<Taste, string> = {
  koyu: "Koyu, yoğun, karamelimsi",
  parlak: "Parlak, diri, canlı renk",
  "fark-etmez": "Fark etmez — öneriye açık",
};

const AMOUNT_LABEL: Record<Amount, string> = {
  kucuk: "Kendim için, küçük başlangıç",
  aile: "Evde aileyle paylaşılır",
  coklu: "Birkaç kişiyle paylaşılır",
};

/** Cümleden çıkarılan ek ipuçları (konu → kısa öneri). */
const TOPIC_TIPS: Array<{ match: string[]; tip: string; link?: { href: string; label: string } }> = [
  {
    match: ["hosaf"],
    tip: "Hoşafta islimli daha az dağılır; kuru kayısı iyice suyu çeker. Gramajı kişi sayısına göre hesaplamak için Mutfak bölümündeki Hoşaf Hesapçısı'nı kullan.",
    link: { href: "#mutfak", label: "Hoşaf Hesapçısı" },
  },
  {
    match: ["tatli", "baklava", "pasta", "kek", "kuru", "recel"],
    tip: "Tatlıda rengi koruyan islimli öne çıkar; gün kurusu ise koyu tadıyla tarife karakter katar.",
  },
  {
    match: ["cay", "kahve"],
    tip: "Çayın yanında en çok gün kurusu tutulur: koyu tadı çaya eşlik eder, yumuşak dokusu çayla uyumludur.",
  },
  {
    match: ["bayram", "misafir", "ogretmen", "komus"],
    tip: "Ziyaret için gidiyorsan yanına bir hediye notu eklemeyi unutma; hediye notu sipariş adımında yazılıyor (demo).",
  },
  {
    match: ["sakla", "bozul", "raf", "kilo"],
    tip: "Açtıktan sonra ağzı kapalı, serin ve kuru yerde sakla; gün kurusu islimliye göre biraz daha özen ister.",
  },
  {
    match: ["cekirdek"],
    tip: "Çekirdek içi ayrı bir kutuda; az miktarda, günde birkaç adedi aşmadan tüketmen önerilir.",
  },
];

interface GroupHit<T extends string> {
  value: T;
  count: number;
  hits: string[];
  firstIndex: number;
}

function scoreGroups<T extends string>(
  groups: Array<[T, string[]]>,
  tokens: string[],
): GroupHit<T> | null {
  let best: GroupHit<T> | null = null;
  for (const [value, keywords] of groups) {
    const hits = findHits(tokens, keywords);
    if (hits.length === 0) continue;
    const firstIndex = Math.min(
      ...hits.map((kw) => {
        const idx = tokens.findIndex((t) => t.startsWith(kw) || t === kw);
        return idx < 0 ? tokens.length : idx;
      }),
    );
    const candidate: GroupHit<T> = { value, count: hits.length, hits, firstIndex };
    if (
      !best ||
      candidate.count > best.count ||
      (candidate.count === best.count && candidate.firstIndex < best.firstIndex)
    ) {
      best = candidate;
    }
  }
  return best;
}

export interface Advice {
  product: Product;
  size: SizeOption;
  reasons: string[];
  tips: string[];
  tipLinks: Array<{ href: string; label: string }>;
  lot: Lot;
  confidence: "kesin" | "olası" | "zayif";
  understood: Array<{ label: string; value: string; source: string }>;
  use: UseCase;
  taste: Taste;
  amount: Amount;
  kernelTip: boolean;
}

/**
 * Serbest metni okur ve kanonik demo kayıtlarından gerekçeli bir lot önerisi üretir.
 * Eşleştirme tamamen kural tabanlıdır; hiçbir ağ isteği yapılmaz.
 */
export function adviseFromText(raw: string): Advice | null {
  const text = normalizeTr(raw);
  if (text.length < 3) return null;
  const tokens = text.split(" ");

  const useHit = scoreGroups(USE_KEYWORDS, tokens);
  const tasteHit = scoreGroups(TASTE_KEYWORDS, tokens);
  const amountHit = scoreGroups(AMOUNT_KEYWORDS, tokens);

  if (!useHit && !tasteHit && !amountHit) return null;

  const use: UseCase = useHit?.value ?? "atistirmalik";
  const taste: Taste = tasteHit?.value ?? "fark-etmez";
  const amount: Amount = amountHit?.value ?? (use === "hediye" ? "aile" : "kucuk");

  const rec = recommend({ use, taste, amount });
  const reasons = [...rec.reasons];
  const tips: string[] = [];
  const tipLinks: Array<{ href: string; label: string }> = [];

  for (const topic of TOPIC_TIPS) {
    if (findHits(tokens, topic.match).length > 0) {
      tips.push(topic.tip);
      if (topic.link && !tipLinks.some((l) => l.href === topic.link!.href)) {
        tipLinks.push(topic.link);
      }
    }
  }

  const understood: Advice["understood"] = [];
  if (useHit) understood.push({ label: "Kullanım", value: USE_LABEL[use], source: useHit.hits.join(", ") });
  if (tasteHit) understood.push({ label: "Damak", value: TASTE_LABEL[taste], source: tasteHit.hits.join(", ") });
  if (amountHit) understood.push({ label: "Miktar", value: AMOUNT_LABEL[amount], source: amountHit.hits.join(", ") });

  const totalHits = (useHit?.count ?? 0) + (tasteHit?.count ?? 0) + (amountHit?.count ?? 0);
  const confidence: Advice["confidence"] =
    totalHits >= 3 ? "kesin" : totalHits === 2 ? "olası" : "zayif";

  const lot = findLot(rec.product.lotCodes[0]) ?? LOTS[0];

  return {
    product: rec.product,
    size: rec.size,
    reasons,
    tips,
    tipLinks,
    lot,
    confidence,
    understood,
    use,
    taste,
    amount,
    kernelTip: rec.kernelTip,
  };
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

/* --------------------- Mevsim takvimi --------------------- */

export interface Season {
  id: string;
  name: string;
  chip: string;
  text: string;
  img: string;
  alt: string;
}

export const SEASONS: Season[] = [
  {
    id: "ilkbahar",
    name: "Çiçek & Bekleyiş",
    chip: "İlkbahar",
    text: "Bahçe çiçek açar; o yılın kayısısının kaderi birkaç haftaya sığar. Geç don ya da çiçekte yağan yağmur rekolteyi sessizce belirler. Baskil'de herkes önce göğe, sonra dallara bakar.",
    img: publicAsset("img/cicek.jpg"),
    alt: "Dalında beyaz-pembe kayısı çiçekleri, arkada flu tepeler",
  },
  {
    id: "hasat",
    name: "Hasat",
    chip: "Temmuz başı",
    text: "Yazla birlikte bahçeler hareketlenir; asıl hasat temmuzda başlar, ağustos ortasına uzanır. Olgun meyve bekletilmez: dalından kasaya, kasadan kurutma alanına. Doğru hasat günü, kutudaki tadın ilk kararıdır.",
    img: publicAsset("img/dal.jpg"),
    alt: "Dalında olgunlaşmış altın sarısı kayısılar",
  },
  {
    id: "sergi",
    name: "Sergi · Patik · Çir",
    chip: "Temmuz – Ağustos",
    text: "Yazın kalbi sergide atar: kayısı islim ya da gün yolunu seçer, güneşte kıvam alır, çekirdeği patikte tek tek çıkarılır ve son güneşte çir olur. Patik'in lot kayıtları tam da bu haftalarda yazılır.",
    img: publicAsset("img/sergi.jpg"),
    alt: "Göl kıyısı yamaçta bezler üzerinde kuruyan kayısı sergileri",
  },
  {
    id: "eleme",
    name: "Eleme & Kutu",
    chip: "Sonbahar",
    text: "Hava serinleyince kuru kayısı boylanır, bahçe bahçe lotlanır ve kutulanır. Her kutunun içine lot pasaportu girer; yazın güneşi artık kâğıda dökülmüş, kodu kapağa basılmıştır.",
    img: publicAsset("img/hediye.jpg"),
    alt: "Üç bölmeli kraft kutuda lotlarına ayrılmış kayısılar",
  },
  {
    id: "sofra",
    name: "Sofra Zamanı",
    chip: "Kış",
    text: "Kışın kuru kayısı hoşaf olur, çayın yanına çıkar, hediye kutusunda başka bir sofraya misafir gider. Kutudaki kodu sorgulayan herkes, temmuzun bahçesine tek tıkla geri döner.",
    img: publicAsset("img/hosaf.jpg"),
    alt: "Cam kasede altın rengi kayısı hoşafı ve yanında kuru kayısılar",
  },
];

/* --------------------- Hoşaf hesapçısı --------------------- */
/* Patik mutfağının kendi önerisidir; dış kaynaklı tarif iddiası değildir. */

export interface HosafResult {
  persons: number;
  grams: number;
  pieces: number;
  waterMl: number;
  sugarTsp: number;
  packs500: number;
}

export function hosafFor(personsRaw: number, kind: "islimli" | "gun"): HosafResult {
  const persons = Math.min(12, Math.max(1, Math.round(personsRaw) || 1));
  const perGram = kind === "islimli" ? 45 : 40; // gün kurusu daha yoğun, azı yeter
  const grams = persons * perGram;
  return {
    persons,
    grams,
    pieces: persons * 6,
    waterMl: persons * 300,
    sugarTsp: persons,
    packs500: Math.ceil(grams / 500),
  };
}

/* ----------------- Yazdırılabilir lot pasaportu ----------------- */

export function buildPassportPrintHtml(lot: Lot): string {
  const rows: Array<[string, string]> = [
    ["Ürün", lot.productName],
    ["Kurutma biçimi", lot.method],
    ["Bahçe / parsel", lot.bahce],
    ["Konum", lot.koy + " · Elazığ"],
    ["Hasat", lot.hasat],
    ["Kurutma", lot.kurutma],
    ["Patik", lot.patik],
    ["Eleme", lot.eleme],
    ["Üretici", lot.uretici],
    ["Saklama", lot.saklama],
  ];
  const trs = rows
    .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
    .join("");
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<title>Lot Pasaportu ${lot.code} — Patik</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;color:#2e1c0e;margin:0;padding:36px;background:#fbf3e4}
  .card{max-width:640px;margin:0 auto;background:#fffdf6;border:2.5px solid #5a3a22;border-radius:16px;overflow:hidden}
  .head{background:#f2a93b;padding:18px 24px;display:flex;justify-content:space-between;align-items:baseline;border-bottom:2.5px dashed #5a3a22}
  .brand{font-size:26px;font-weight:800;letter-spacing:.12em}
  .brand small{display:block;font-size:11px;letter-spacing:.18em;font-weight:700}
  .code{font-size:22px;font-weight:800;letter-spacing:.1em;background:#fff9ee;padding:6px 14px;border-radius:10px;border:1.5px solid #5a3a22}
  table{width:100%;border-collapse:collapse}
  th,td{padding:10px 24px;text-align:left;font-size:15px;border-bottom:1px dotted #b99b6e}
  th{width:170px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7a5a3d;vertical-align:top;padding-top:13px}
  .foot{padding:16px 24px;font-size:12.5px;color:#7a5a3d;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .stamp{border:1.5px dashed #b5501b;color:#b5501b;border-radius:999px;padding:2px 10px;font-weight:700}
  @media print{body{background:#fff;padding:0}}
</style></head><body>
<div class="card">
  <div class="head"><div class="brand">PATİK<small>BASKİL KAYISI ATÖLYESİ · LOT PASAPORTU</small></div><div class="code">${lot.code}</div></div>
  <table>${trs}</table>
  <div class="foot"><span>Bu pasaport, kutudaki lot koduyla siteden de sorgulanabilir.</span><span class="stamp">Temsilî demo kaydı · GakCoding</span></div>
</div>
</body></html>`;
}

