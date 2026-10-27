/**
 * Defterin bölüm dizini — TEK kaynak.
 *
 * Sayfadaki sıra, sol raydaki numaralar ve bölüm başlıklarındaki folio
 * rakamları hep buradan gelir; böylece üçü birbirinden ayrı düşmez.
 * `no` alanı sayfadaki gerçek okuma sırasıdır.
 * `tag` alanı kesme kartlarında (sinematik bölüm geçişi) görünen
 * tek satırlık tarif; kısa tutulur ki kart okunabilir kalsın.
 */
export type Chapter = {
  /** Bölümün DOM kimliği (id). */
  id: string;
  /** Folio rakamı: "01" .. "15" */
  no: string;
  /** Sol raydaki uzun etiket. */
  label: string;
  /** Üst menüdeki kısa etiket (boşsa üst menüde görünmez). */
  nav?: string;
  /** Dar üst menüde gizlenebilen ikincil bölüm. */
  optional?: boolean;
  /** Kesme kartındaki tek satırlık tarif. */
  tag?: string;
};

export const CHAPTERS: Chapter[] = [
  { id: "top", no: "01", label: "Vitrin", tag: "Açılış: bahçe, kutu, iz" },
  { id: "film", no: "02", label: "Yolculuk Filmi", optional: true, tag: "Beş sahne, tek bir mevsim" },
  { id: "saha", no: "03", label: "Saha Defteri", nav: "Saha", tag: "Günün kayıt fişleri" },
  { id: "karsilastir", no: "04", label: "Gün / İslim", nav: "Karşı", optional: true, tag: "Güneş, iki yöntem" },
  { id: "surec", no: "05", label: "Üretim Yolu", nav: "Süreç", tag: "Çekirdekten kutuya altı durak" },
  { id: "uretici", no: "06", label: "Üretici", nav: "Üretici", optional: true, tag: "Fatma & Ali D. — temsilî profil" },
  { id: "mola", no: "07", label: "Mola", nav: "Mola", tag: "Kısa bir soluk, bir nefes" },
  { id: "oyun-masasi", no: "08", label: "Oyun Masası", nav: "Oyun", tag: "Dört oyun, dört ayrı ders" },
  { id: "lotunu-kur", no: "09", label: "Lotunu Kur", nav: "Lotunu Kur", tag: "Otuz saniyede lot" },
  { id: "yz-defteri", no: "10", label: "Yapay Zekâ", nav: "Yapay Zekâ", tag: "Üretim defteri, açık defter" },
  { id: "urunler", no: "11", label: "Kutular", nav: "Kutular", tag: "Kutudan kutuya" },
  { id: "mutfak", no: "12", label: "Mutfak", nav: "Mutfak", optional: true, tag: "96 tarif, hepsi gerçek" },
  { id: "atlas", no: "13", label: "Atlas", nav: "Atlas", tag: "204 lot kaydı" },
  { id: "evren", no: "14", label: "Evren", nav: "Evren", optional: true, tag: "989 çalışma kaydı" },
  { id: "lot-sorgula", no: "15", label: "Pasaport", nav: "Pasaport", tag: "Kodu yaz, izi gör" },
];

/** Üst menüde görünecek bölümler (kısa etiketli olanlar). */
export const NAV_CHAPTERS = CHAPTERS.filter((chapter) => chapter.nav);

/** Bölüm kimliğinden folio numarası; yoksa boş dize. */
export function chapterNo(id: string): string {
  return CHAPTERS.find((chapter) => chapter.id === id)?.no ?? "";
}
