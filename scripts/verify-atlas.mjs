#!/usr/bin/env node
/**
 * Patik Atlası doğrulama betiği.
 *
 * Amaç yalnızca dosya boyutuna bakmak değildir:
 * - src/ toplamının 20.000 satırı aştığını,
 * - üretilen her veri kümesinin beklenen kayıt sayısını,
 * - Atlas bağlantılarının ve temsilî içerik uyarılarının yerinde olduğunu
 * tek komutla kontrol eder.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const CONTENT = path.join(SRC, "content");

const EXPECTED = [
  {
    file: "lotLedger.ts",
    label: "Lot defteri",
    expected: 204,
    pattern: /"PT-26-\d{3}"/g,
  },
  {
    file: "seasonCalendar.ts",
    label: "52 haftalık takvim",
    expected: 52,
    pattern: /^\s{4}week: \d+,/gm,
  },
  {
    file: "glossary.ts",
    label: "Sözlük",
    expected: 155,
    pattern: /^\s{4}slug: "/gm,
  },
  {
    file: "recipes.ts",
    label: "Tarifler",
    expected: 96,
    pattern: /^\s{4}id: "/gm,
  },
  {
    file: "knowledgeCards.ts",
    label: "Bilgi kartları",
    expected: 160,
    pattern: /^\s{4}id: "bilgi-/gm,
  },
  {
    file: "quizBank.ts",
    label: "Soru bankası",
    expected: 144,
    pattern: /^\s{4}answerIndex: \d+,/gm,
  },
];

let failures = 0;

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

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

const fileTexts = new Map();

async function readProjectFile(relativePath) {
  if (!fileTexts.has(relativePath)) {
    fileTexts.set(relativePath, await readFile(path.join(ROOT, relativePath), "utf8"));
  }
  return fileTexts.get(relativePath);
}

async function verifyLineBudget() {
  const files = await walk(SRC);
  let sourceLines = 0;

  for (const file of files) {
    const info = await stat(file);
    if (!info.isFile()) continue;
    const text = await readFile(file, "utf8");
    sourceLines += lineCount(text);
  }

  console.log(`src/ toplamı: ${new Intl.NumberFormat("tr-TR").format(sourceLines)} satır`);
  if (sourceLines >= 20_000) pass("20.000 satır hedefi aşıldı");
  else fail(`20.000 satır hedefinin altında: ${sourceLines}`);
}

async function verifyContentSets() {
  for (const check of EXPECTED) {
    const text = await readFile(path.join(CONTENT, check.file), "utf8");
    const actual = countMatches(text, check.pattern);

    if (!text.includes("scripts/generate-atlas-content.mjs")) {
      fail(`${check.file}: üretim kaynağı notu eksik`);
    }
    if (!text.includes("temsilî")) {
      fail(`${check.file}: temsilî içerik notu eksik`);
    }
    if (/:\s*undefined,/.test(text)) {
      fail(`${check.file}: kayıtta tanımsız değer izi bulundu`);
    }
    if (actual === check.expected) {
      pass(`${check.label}: ${actual} kayıt`);
    } else {
      fail(`${check.label}: beklenen ${check.expected}, bulunan ${actual}`);
    }
  }
}

async function verifyAtlasIntegration() {
  const atlas = await readProjectFile("src/components/Atlas.tsx");
  const app = await readProjectFile("src/App.tsx");
  const header = await readProjectFile("src/components/Header.tsx");
  const footer = await readProjectFile("src/components/Footer.tsx");

  const checks = [
    [atlas.includes("LOT_LEDGER"), "Atlas lot defterini kullanıyor"],
    [atlas.includes("SEASON_CALENDAR"), "Atlas 52 haftayı kullanıyor"],
    [atlas.includes("GLOSSARY"), "Atlas sözlüğü kullanıyor"],
    [atlas.includes("RECIPES"), "Atlas tarifleri kullanıyor"],
    [atlas.includes("KNOWLEDGE_CARDS"), "Atlas bilgi kartlarını kullanıyor"],
    [atlas.includes("QUIZ_BANK"), "Atlas soru bankasını kullanıyor"],
    [atlas.includes("Şeffaflık notu"), "Atlas şeffaflık uyarısını gösteriyor"],
    [app.includes("lazy(() => import(\"./components/Atlas\"))"), "Atlas ayrı paket olarak tembel yükleniyor"],
    [app.includes("<Atlas />"), "Atlas ana akışa bağlı"],
    [header.includes('href: "#atlas"'), "Üst menü Atlas bağlantısı içeriyor"],
    [footer.includes('href="#atlas"'), "Alt bilgi Atlas bağlantısı içeriyor"],
  ];

  for (const [ok, label] of checks) {
    if (ok) pass(label);
    else fail(label);
  }
}

async function verifyCanonicalLots() {
  const data = await readProjectFile("src/data.ts");
  for (const code of ["PT-26-047", "PT-26-112", "PT-26-089"]) {
    if (data.includes(code)) pass(`Kanonik demo lot korunuyor: ${code}`);
    else fail(`Kanonik demo lot eksik: ${code}`);
  }
}

await verifyLineBudget();
await verifyContentSets();
await verifyAtlasIntegration();
await verifyCanonicalLots();

if (failures > 0) {
  console.error(`\nAtlas doğrulaması ${failures} hatayla bitti.`);
  process.exit(1);
}

console.log("\nAtlas doğrulaması temiz.");
