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

import { execFile } from "node:child_process";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

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

/* ------------------------------------------------------------------
   Gerçek terminal çıktısı
   ------------------------------------------------------------------
   Sitede gösterilen terminal, depodaki betiklerin gerçek çalıştırma
   çıktısıdır: aynı komutları sen de çalıştırırsan aynı satırları
   görürsün. Uydurma değil, kopyalanmış gerçek kayıt.
   ------------------------------------------------------------------ */

/** Bir betiği çalıştırıp stdout satırlarını döndürür. */
async function run(script) {
  try {
    const { stdout } = await execFileAsync(process.execPath, [path.join("scripts", script)], {
      cwd: ROOT,
      maxBuffer: 8 * 1024 * 1024,
    });
    return stdout.split("\n").map((line) => line.trimEnd()).filter(Boolean);
  } catch (error) {
    const out = error?.stdout ?? "";
    return out.split("\n").map((line) => line.trimEnd()).filter(Boolean);
  }
}

/** Yalnızca sayı taşıyan doğrulama satırlarını tut. */
function kayitSatirlari(lines) {
  return lines.filter((line) => /satır/i.test(line) || /✓.*\d+\s*kayıt/.test(line));
}

/** Aynı satırı iki kez basma. */
function tekrarsiz(lines) {
  const seen = new Set();
  let bosMu = true;
  return lines.filter((line) => {
    if (line === "") {
      if (bosMu) return false;
      bosMu = true;
      return true;
    }
    bosMu = false;
    if (seen.has(line)) return false;
    seen.add(line);
    return true;
  });
}

/** Üretim betiklerinin çıktısından yalnızca anlamlı satırlar. */
function uretimSatirlari(lines) {
  return lines.filter((line) => !/^(index|universeIndex)\.ts:/.test(line));
}

const terminalHam = [
  "$ npm run content:generate",
  ...uretimSatirlari(await run("generate-atlas-content.mjs")),
  "",
  "$ npm run content:generate:universe",
  ...uretimSatirlari(await run("generate-universe-content.mjs")),
  "",
  "$ npm run verify:atlas",
  ...kayitSatirlari(await run("verify-atlas.mjs")),
  "",
  "$ npm run verify:universe",
  ...kayitSatirlari(await run("verify-universe.mjs")),
];

/** Aynı satırı iki kez basma ("src/ toplamı" iki betikte de görünür). */
const terminal = tekrarsiz(terminalHam);

const body = `/* OTOMATİK ÜRETİLDİ — scripts/generate-build-stats.mjs
   Elle düzenlemeyin; \`npm run content:stats\` ile yenileyin. */

export const BUILD_STATS = {
  /** src/ klasöründeki toplam satır sayısı. */
  satirKodu: ${satirKodu},
  /** public/img/ içindeki üretilmiş görsel sayısı. */
  yzGorseli: ${yzGorseli},
  /**
   * Depodaki üretim betiklerinin GERÇEK çıktısı.
   * Sitedeki terminal bunu harfi harfini gösterir.
   */
  terminal: ${JSON.stringify(terminal, null, 2).replace(/\n/g, "\n  ")},
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
