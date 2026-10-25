#!/usr/bin/env node
/**
 * Patik Evreni doğrulama betiği.
 *
 * Kontroller:
 * - src/ toplamının 40.000 satırı aştığını,
 * - Evren veri kümelerinin beklenen kayıt sayılarını,
 * - 365 günün eksiksiz olduğunu,
 * - kalite yüzdelerinin 100'e tamamlandığını,
 * - hediye ürünlerinin gerçek demo kataloğa bağlandığını,
 * - panellerin uygulamaya tembel yüklenerek bağlandığını doğrular.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const CONTENT = path.join(SRC, "content");

let failures = 0;
const formatter = new Intl.NumberFormat("tr-TR");

function pass(message) {
  console.log(`✓ ${message}`);
}

function fail(message) {
  failures += 1;
  console.error(`✗ ${message}`);
}

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

async function projectFile(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

async function verifyLineTarget() {
  let total = 0;
  for (const file of await walk(SRC)) {
    const info = await stat(file);
    if (!info.isFile()) continue;
    total += lineCount(await readFile(file, "utf8"));
  }

  console.log(`src/ toplamı: ${formatter.format(total)} satır`);
  if (total >= 40_000) pass("40.000 satır hedefi aşıldı");
  else fail(`40.000 satır hedefinin altında: ${total}`);
  return total;
}

const EXPECTED = [
  {
    file: "dailyJournal.ts",
    label: "365 günlük sezon günlüğü",
    expected: 365,
    pattern: /^\s{4}dayOfYear: \d+,/gm,
  },
  {
    file: "parcelProfiles.ts",
    label: "Parsel profilleri",
    expected: 48,
    pattern: /^\s{4}code: "PRS-/gm,
  },
  {
    file: "qualityChecks.ts",
    label: "Kalite kontrolleri",
    expected: 192,
    pattern: /^\s{4}lotCode: "PT-/gm,
  },
  {
    file: "packingRuns.ts",
    label: "Kutu hattı koşuları",
    expected: 144,
    pattern: /^\s{4}runCode: "PK-/gm,
  },
  {
    file: "giftScenarios.ts",
    label: "Hediye senaryoları",
    expected: 120,
    pattern: /^\s{4}id: "hediye-/gm,
  },
  {
    file: "learningPaths.ts",
    label: "Öğrenme dersleri",
    expected: 120,
    pattern: /^\s{4}id: "ders-/gm,
  },
];

async function verifyDatasets() {
  for (const check of EXPECTED) {
    const text = await readFile(path.join(CONTENT, check.file), "utf8");
    const actual = [...text.matchAll(check.pattern)].length;

    if (!text.includes("scripts/generate-universe-content.mjs")) {
      fail(`${check.file}: üretim kaynağı notu eksik`);
    }
    if (!text.includes("temsilî")) {
      fail(`${check.file}: temsilî içerik uyarısı eksik`);
    }
    if (/:\s*undefined,/.test(text)) {
      fail(`${check.file}: kayıtta tanımsız değer bulunuyor`);
    }
    if (actual === check.expected) pass(`${check.label}: ${actual} kayıt`);
    else fail(`${check.label}: beklenen ${check.expected}, bulunan ${actual}`);
  }
}

async function verifyDailyCompleteness() {
  const text = await readFile(path.join(CONTENT, "dailyJournal.ts"), "utf8");
  const days = [...text.matchAll(/^\s{4}dayOfYear: (\d+),/gm)].map((match) => Number(match[1]));
  const unique = new Set(days);
  const missing = Array.from({ length: 365 }, (_, index) => index + 1).filter((day) => !unique.has(day));

  if (days.length === 365 && unique.size === 365 && missing.length === 0) {
    pass("365 gün eksiksiz ve benzersiz");
  } else {
    fail(`365 gün denetimi başarısız: ${days.length} kayıt, eksik ${missing.join(", ") || "yok"}`);
  }
}

async function verifyQualityMath() {
  const text = await readFile(path.join(CONTENT, "qualityChecks.ts"), "utf8");
  const pattern = /primaryShare: (\d+),\s+secondaryShare: (\d+),\s+reserveShare: (\d+),/g;
  const rows = [...text.matchAll(pattern)];
  const invalid = rows.filter((row) => Number(row[1]) + Number(row[2]) + Number(row[3]) !== 100);

  if (rows.length === 192 && invalid.length === 0) {
    pass("192 kalite kaydında sınıf yüzdeleri 100'e tamamlanıyor");
  } else {
    fail(`Kalite yüzde denetimi başarısız: ${rows.length} satır, ${invalid.length} hatalı toplam`);
  }
}

async function verifyGiftCatalog() {
  const [gifts, catalog] = await Promise.all([
    readFile(path.join(CONTENT, "giftScenarios.ts"), "utf8"),
    projectFile("src/data.ts"),
  ]);

  const productIds = [...new Set([...gifts.matchAll(/productId: "([^"]+)"/g)].map((match) => match[1]))];
  const sizeIds = [...new Set([...gifts.matchAll(/sizeId: "([^"]+)"/g)].map((match) => match[1]))];
  const missingProducts = productIds.filter((id) => !catalog.includes(`id: "${id}"`));
  const missingSizes = sizeIds.filter((id) => !catalog.includes(`id: "${id}"`));

  if (!missingProducts.length && !missingSizes.length) {
    pass(`Hediye kataloğu gerçek demo ürünlere bağlı: ${productIds.join(", ")}`);
  } else {
    fail(`Hediye kataloğu eksik: ürün ${missingProducts.join(", ")}, gramaj ${missingSizes.join(", ")}`);
  }
}

async function verifyIntegration() {
  const files = {
    app: await projectFile("src/App.tsx"),
    universe: await projectFile("src/components/Universe.tsx"),
    dashboard: await projectFile("src/components/universe/OperationsDashboard.tsx"),
    journal: await projectFile("src/components/universe/DailyJournal.tsx"),
    quality: await projectFile("src/components/universe/QualityLab.tsx"),
    packing: await projectFile("src/components/universe/PackingLine.tsx"),
    gift: await projectFile("src/components/universe/GiftStudio.tsx"),
    school: await projectFile("src/components/universe/LearningSchool.tsx"),
    footer: await projectFile("src/components/Footer.tsx"),
  };

  const checks = [
    [files.app.includes("DeferredUniverse"), "Evren görünüm alanına yaklaşınca yükleniyor"],
    [files.app.includes('import("./components/Universe")'), "Evren ayrı ana paket olarak ayrılıyor"],
    [files.universe.includes("OperationsDashboard"), "Operasyon paneli bağlı"],
    [files.universe.includes("DailyJournal"), "365 gün paneli bağlı"],
    [files.universe.includes("QualityLab"), "Kalite paneli bağlı"],
    [files.universe.includes("PackingLine"), "Kutu hattı paneli bağlı"],
    [files.universe.includes("GiftStudio"), "Hediye stüdyosu bağlı"],
    [files.universe.includes("LearningSchool"), "Patik Okulu bağlı"],
    [files.universe.includes("Önce çerçeve"), "Evren şeffaflık çerçevesi görünüyor"],
    [files.dashboard.includes("PARCEL_PROFILES"), "Pano parsel profillerini kullanıyor"],
    [files.journal.includes("DAILY_JOURNAL"), "Günlük 365 kaydı kullanıyor"],
    [files.quality.includes("QUALITY_CHECKS"), "Kalite masası kontrol kayıtlarını kullanıyor"],
    [files.packing.includes("PACKING_RUNS"), "Kutu hattı koşuları kullanıyor"],
    [files.gift.includes("useCart"), "Hediye stüdyosu demo sepete bağlı"],
    [files.school.includes("patik-school-completed-v1"), "Okul ilerlemesi tarayıcıda saklanıyor"],
    [files.footer.includes('href="#evren"'), "Alt bilgi Evren bağlantısı içeriyor"],
  ];

  for (const [ok, label] of checks) {
    if (ok) pass(label);
    else fail(label);
  }
}

await verifyLineTarget();
await verifyDatasets();
await verifyDailyCompleteness();
await verifyQualityMath();
await verifyGiftCatalog();
await verifyIntegration();

if (failures > 0) {
  console.error(`\nPatik Evreni doğrulaması ${failures} hatayla bitti.`);
  process.exit(1);
}

console.log("\nPatik Evreni doğrulaması temiz.");
