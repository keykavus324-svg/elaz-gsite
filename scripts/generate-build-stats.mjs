/* ==================================================================
   BUILD İSTATİSTİKLERİ ÜRETECİ
   ------------------------------------------------------------------
   Sitede gösterilen "satır kodu" ve "YZ görseli" sayıları elle
   yazılmaz; bu betik src/ klasörünü ve public/img/ klasörünü tarar
   ve gerçek sayıları src/content/buildStats.ts dosyasına yazar.
   Böylece jüri sayıyı merak ettiğinde doğrulama tek komutla yapılır:

       npm run content:stats

   Not: Üretilen dosya satır sayımına dahil edilmez; aksi hâlde
   sayaç her çalıştırmada kendi kendini bir satır artırırdı.
   ================================================================== */

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const IMG = path.join(ROOT, "public", "img");
const OUT = path.join(SRC, "content", "buildStats.ts");
const SELF = path.join(SRC, "content", "buildStats.ts");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    if (entry.isFile()) files.push(full);
  }
  return files;
}

function lineCount(text) {
  if (!text) return 0;
  return text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length;
}

async function countSourceLines() {
  const files = await walk(SRC);
  let total = 0;
  for (const file of files) {
    if (path.resolve(file) === path.resolve(SELF)) continue;
    const info = await stat(file);
    if (!info.isFile()) continue;
    total += lineCount(await readFile(file, "utf8"));
  }
  return total;
}

async function countImages() {
  const files = await walk(IMG);
  return files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file)).length;
}

const satirKodu = await countSourceLines();
const yzGorseli = await countImages();

const body = `/* OTOMATİK ÜRETİLDİ — scripts/generate-build-stats.mjs
   Elle düzenlemeyin; \`npm run content:stats\` ile yenileyin. */

export const BUILD_STATS = {
  /** src/ klasöründeki toplam satır sayısı. */
  satirKodu: ${satirKodu},
  /** public/img/ içindeki üretilmiş görsel sayısı. */
  yzGorseli: ${yzGorseli},
} as const;

export function trNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}
`;

let previous = "";
try {
  previous = await readFile(OUT, "utf8");
} catch {
  previous = "";
}

if (previous !== body) {
  await writeFile(OUT, body, "utf8");
  console.log(`buildStats.ts güncellendi → ${satirKodu} satır · ${yzGorseli} görsel`);
} else {
  console.log(`buildStats.ts güncel → ${satirKodu} satır · ${yzGorseli} görsel`);
}
