/**
 * Defterin bölüm dizini — TEK kaynak.
 *
 * Sayfadaki sıra, sol raydaki numaralar ve bölüm başlıklarındaki folio
 * rakamları hep buradan gelir; böylece üçü birbirinden ayrı düşmez.
 * `no` alanı sayfadaki gerçek okuma sırasıdır.
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
  /** Dar üst menüde gizlenebilir ikincil bölüm. */
  optional?: boolean;
};

export const CHAPTERS: Chapter[] = [
  { id: "top", no: "01", label: "Vitrin" },
  { id: "film", no: "02", label: "Yolculuk Filmi", optional: true },
  { id: "saha", no: "03", label: "Saha Defteri", nav: "Saha" },
  { id: "karsilastir", no: "04", label: "Gün / İslim", nav: "Karşı", optional: true },
  { id: "surec", no: "05", label: "Üretim Yolu", nav: "Süreç" },
  { id: "uretici", no: "06", label: "Üretici", nav: "Üretici", optional: true },
  { id: "mola", no: "07", label: "Mola", nav: "Mola" },
  { id: "oyun-masasi", no: "08", label: "Oyun Masası", nav: "Oyun" },
  { id: "lotunu-kur", no: "09", label: "Lotunu Kur", nav: "Lotunu Kur" },
  { id: "yz-defteri", no: "10", label: "Yapay Zekâ", nav: "Yapay Zekâ" },
  { id: "urunler", no: "11", label: "Kutular", nav: "Kutular" },
  { id: "mutfak", no: "12", label: "Mutfak", nav: "Mutfak", optional: true },
  { id: "atlas", no: "13", label: "Atlas", nav: "Atlas" },
  { id: "evren", no: "14", label: "Evren", nav: "Evren", optional: true },
  { id: "lot-sorgula", no: "15", label: "Pasaport", nav: "Pasaport" },
];

/** Üst menüde görünecek bölümler (kısa etiketli olanlar). */
export const NAV_CHAPTERS = CHAPTERS.filter((chapter) => chapter.nav);

/** Bölüm kimliğinden folio numarası; yoksa boş dize. */
export function chapterNo(id: string): string {
  return CHAPTERS.find((chapter) => chapter.id === id)?.no ?? "";
}
