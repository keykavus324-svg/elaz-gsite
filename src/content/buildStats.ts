/* OTOMATİK ÜRETİLDİ — scripts/generate-build-stats.mjs
   Elle düzenlemeyin; `npm run content:stats` ile yenileyin. */

export const BUILD_STATS = {
  /** src/ klasöründeki toplam satır sayısı. */
  satirKodu: 58801,
  /** public/img/ içindeki üretilmiş görsel sayısı. */
  yzGorseli: 16,
  /**
   * Depodaki üretim betiklerinin GERÇEK çıktısı.
   * Sitedeki terminal bunu harfi harfini gösterir.
   */
  terminal: [
    "$ npm run content:generate",
    "lotLedger.ts: 7678 satır",
    "seasonCalendar.ts: 1489 satır",
    "glossary.ts: 1421 satır",
    "recipes.ts: 3789 satır",
    "knowledgeCards.ts: 1624 satır",
    "quizBank.ts: 2044 satır",
    "Toplam temsilî atlas kaydı: 811",
    "",
    "$ npm run content:generate:universe",
    "dailyJournal.ts: 8880 satır",
    "parcelProfiles.ts: 1433 satır",
    "qualityChecks.ts: 3889 satır",
    "packingRuns.ts: 3500 satır",
    "giftScenarios.ts: 2914 satır",
    "learningPaths.ts: 1721 satır",
    "Patik Evreni temsilî kayıt toplamı: 989",
    "",
    "$ npm run verify:atlas",
    "src/ toplamı: 58.855 satır",
    "✓ 40.000 satır hedefi aşıldı",
    "✓ Lot defteri: 204 kayıt",
    "✓ 52 haftalık takvim: 52 kayıt",
    "✓ Sözlük: 155 kayıt",
    "✓ Tarifler: 96 kayıt",
    "✓ Bilgi kartları: 160 kayıt",
    "✓ Soru bankası: 144 kayıt",
    "",
    "$ npm run verify:universe",
    "✓ 365 günlük sezon günlüğü: 365 kayıt",
    "✓ Parsel profilleri: 48 kayıt",
    "✓ Kalite kontrolleri: 192 kayıt",
    "✓ Kutu hattı koşuları: 144 kayıt",
    "✓ Hediye senaryoları: 120 kayıt",
    "✓ Öğrenme dersleri: 120 kayıt"
  ],
} as const;

export function trNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}
