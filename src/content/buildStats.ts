/* OTOMATİK ÜRETİLDİ — scripts/generate-build-stats.mjs
   Elle düzenlemeyin; `npm run content:stats` ile yenileyin. */

export const BUILD_STATS = {
  /** src/ klasöründeki toplam satır sayısı. */
  satirKodu: 58369,
  /** public/img/ içindeki üretilmiş görsel sayısı. */
  yzGorseli: 16,
} as const;

export function trNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}
