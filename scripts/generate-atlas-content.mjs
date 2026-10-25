#!/usr/bin/env node
/**
 * Patik Atlası veri üreticisi.
 *
 * Çalıştırma: npm run content:generate
 *
 * Üretilen dosyalar temsilî demo verisini açık, aranabilir ve filtrelenebilir
 * TypeScript kayıtları hâlinde tutar. Elle üretilmiş gibi gösterilmez; her
 * dosyanın başında üretim kaynağı yazılır.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  KNOWLEDGE_SCENARIOS,
  KNOWLEDGE_TOPICS,
  MONTH_PLANS,
  QUIZ_SCENARIOS,
  RECIPE_ACCENTS,
  RECIPE_BASES,
  TERM_GROUPS,
} from "./atlas-source-data.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src", "content");
const GENERATED_NOTE = `/* ------------------------------------------------------------------ */\n/*  Bu dosya scripts/generate-atlas-content.mjs ile üretilmiştir.     */\n/*  Elle düzenlemeyin; scripts/atlas-source-data.mjs kaynağını açın. */\n/*  Kayıtlar GakCoding demosuna ait temsilî içeriktir.                */\n/* ------------------------------------------------------------------ */\n`;

await mkdir(OUT_DIR, { recursive: true });

function slugify(input) {
  return input
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("i̇", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replaceAll("â", "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatRecord(record) {
  const lines = ["  {"];
  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value)) {
      lines.push(`    ${key}: [`);
      for (const item of value) lines.push(`      ${JSON.stringify(item)},`);
      lines.push("    ],");
    } else {
      lines.push(`    ${key}: ${JSON.stringify(value)},`);
    }
  }
  lines.push("  },");
  return lines.join("\n");
}

function arrayConst(name, type, records) {
  return `export const ${name}: ${type}[] = [\n${records.map(formatRecord).join("\n")}\n];\n`;
}

function literalList(values) {
  return `[${values.map((value) => JSON.stringify(value)).join(", ")}]`;
}

async function writeGenerated(filename, body) {
  const content = `${GENERATED_NOTE}\n${body.trim()}\n`;
  await writeFile(path.join(OUT_DIR, filename), content, "utf8");
  console.log(`${filename}: ${content.split("\n").length} satır`);
}

function rotating(pool, start, count) {
  return Array.from({ length: count }, (_, index) => pool[(start + index) % pool.length]);
}

function insertCorrect(correct, wrongs, seed) {
  const answerIndex = seed % 3;
  const options = [...wrongs];
  options.splice(answerIndex, 0, correct);
  return { options, answerIndex };
}

/* ------------------------------------------------------------------ */
/* Lot defteri                                                         */
/* ------------------------------------------------------------------ */

const LEDGER_METHODS = [
  {
    method: "gun",
    product: "Gün Kurusu",
    methodLabel: "İslimsiz, doğrudan güneşte",
    islimHours: 0,
    outputRatio: 0.25,
    boxSize: "500 g",
    boxUnitKg: 0.5,
    storageNote: "Serin ve kuru yerde, ağzı kapalı kapta; gün kurusu özen ister.",
  },
  {
    method: "islimli",
    product: "İslimli Jumbo",
    methodLabel: "İslim damı + güneşte kurutma",
    islimHours: 24,
    outputRatio: 0.26,
    boxSize: "500 g",
    boxUnitKg: 0.5,
    storageNote: "Serin, kuru ve güneşten uzak bir dolapta saklayın.",
  },
  {
    method: "cekirdek",
    product: "Kayısı Çekirdeği İçi",
    methodLabel: "Patik çekirdeklerinden kırılmış iç",
    islimHours: 0,
    outputRatio: 0.07,
    boxSize: "250 g",
    boxUnitKg: 0.25,
    storageNote: "Ağzı kapalı kapta, çocukların erişemeyeceği yerde; birkaç adedi aşmayın.",
  },
];

const LEDGER_PARCELS = [
  { parcel: "Gölyaka Parseli · Teras 1", location: "Çavuşlu demo sahası, Baskil" },
  { parcel: "Gölyaka Parseli · Teras 3", location: "Çavuşlu demo sahası, Baskil" },
  { parcel: "Kıyıdüzü Parseli · Sıra 7", location: "Karakaya kıyısı demo sahası, Baskil" },
  { parcel: "Kıyıdüzü Parseli · Sıra 12", location: "Karakaya kıyısı demo sahası, Baskil" },
  { parcel: "Yamaç Parseli · Alt Basamak", location: "Yamaç demo sahası, Baskil" },
  { parcel: "Yamaç Parseli · Üst Basamak", location: "Yamaç demo sahası, Baskil" },
  { parcel: "Fidanlık Yanı Parseli", location: "Atölye yanı demo sahası, Baskil" },
  { parcel: "Sergi Düzü Parseli", location: "Sergi düzü demo sahası, Baskil" },
];

const GRADES = ["Jumbo ağırlıklı", "Orta-jumbo karışık", "Jumbo tek boy", "Orta boy dengeli", "Sunumluk iri boy", "Karışık boy mutfaklık"];
const DRYNESS = ["Dengeli kuruluk", "Yumuşak kıvam", "Sıkı ve diri kıvam", "Çay yanına uygun yumuşaklık", "Hoşafa dayanıklı kuruluk", "Kutu için dengeli kıvam"];
const STATUSES = ["Kutulandı", "Pasaportu yazıldı", "Elemede son kontrol", "Hediye stoğunda", "Tadım numunesi ayrıldı", "Defterde kapatıldı"];
const SORTING_NOTES = [
  "Renk ayrımı masada ikinci kez kontrol edildi.",
  "Ezilen taneler mutfak denemesi için ayrıldı.",
  "Boy kapları gün sonunda yeniden tartıldı.",
  "Yüzeyinde yara görülen taneler kutuya girmedi.",
  "İlk ve son kasadan numune karşılaştırıldı.",
  "Kırık parçalar ana kutu sınıfından ayrıldı.",
  "Aynı parselin farklı sıraları birbirine karıştırılmadı.",
  "Kutu öncesi son göz kontrolü iki kişiyle yapıldı.",
];
const SEASON_NOTES = [
  "Sergi günlerinde sabah serinliği kasalama için kullanıldı.",
  "Öğlen sıcağında sergi çevirme aralığı sık tutuldu.",
  "Kıyı parsellerinde rüzgâr partinin günlük notuna yazıldı.",
  "Gölgeli sıraların kasaları güneşli sıralardan ayrı izlendi.",
  "Patik masasında her bez tek parsel etiketiyle çalışıldı.",
  "Gün sonunda açık kalan parti defterde kırmızı kalemle işaretlendi.",
  "Kutu tartımı sergi kapanışından sonra tekrar edildi.",
  "Parsel fotoğrafı, hasat haftası notuyla aynı dosyaya kondu.",
];

function harvestWindow(week) {
  const windows = {
    28: "Temmuzun ikinci haftası",
    29: "Temmuzun üçüncü haftası",
    30: "Temmuzun dördüncü haftası",
    31: "Temmuz sonu – Ağustos başı",
    32: "Ağustosun ilk haftası",
    33: "Ağustosun ikinci haftası",
    34: "Ağustos ortası",
  };
  return windows[week] ?? "Temmuz – Ağustos";
}

function traceSteps(method, index) {
  const commonStart = ["Hasat kasası parsel etiketiyle kapatıldı", "Kasa bekletilmeden sergi alanına taşındı"];
  const commonEnd = ["Eleme sınıfı lot satırına yazıldı", "Kutu pasaportu lot koduyla eşleştirildi"];
  if (method.method === "gun") {
    return [...commonStart, "İslim uygulanmadan sergi bezine tek kat yayıldı", "Yarı kuru kıvamda patik yapıldı", ...commonEnd];
  }
  if (method.method === "islimli") {
    return [...commonStart, "Parti islim damına saat notuyla girdi", "Rengini koruyarak sergide güneşe yayıldı", "İlk kurumadan sonra patik yapıldı", ...commonEnd];
  }
  return [
    "Kaynak kayısı partisinin patik kasaları ayrıldı",
    "Çekirdekler gölgede dinlendirildi",
    "Çekirdek kırma masasında bütün içler ayrıldı",
    index % 2 === 0 ? "Kırık içler ayrı deneme kabına alındı" : "Bütün iç oranı parti notuna yazıldı",
    ...commonEnd,
  ];
}

const ledgerLots = Array.from({ length: 204 }, (_, index) => {
  const method = LEDGER_METHODS[index % LEDGER_METHODS.length];
  const parcel = LEDGER_PARCELS[(index * 3 + Math.floor(index / 11)) % LEDGER_PARCELS.length];
  const harvestWeek = 28 + (index % 7);
  const inputKg = 260 + ((index * 37) % 540);
  const outputKg = Math.max(12, Math.round(inputKg * method.outputRatio));
  const sergiDays = method.method === "cekirdek" ? 2 + (index % 2) : 4 + (index % 3);
  return {
    code: `PT-26-${201 + index}`,
    product: method.product,
    method: method.method,
    methodLabel: method.methodLabel,
    parcel: parcel.parcel,
    location: parcel.location,
    harvestWeek,
    harvestWindow: harvestWindow(harvestWeek),
    sergiDays,
    islimHours: method.islimHours,
    patikDayOffset: method.method === "cekirdek" ? 1 : 2 + (index % 2),
    grade: method.method === "cekirdek" ? "Bütün iç ağırlıklı" : GRADES[index % GRADES.length],
    inputKg,
    outputKg,
    boxSize: method.boxSize,
    boxCount: Math.max(12, Math.floor(outputKg / method.boxUnitKg)),
    dryness: method.method === "cekirdek" ? "Kırma sonrası dengeli kuruluk" : DRYNESS[(index + harvestWeek) % DRYNESS.length],
    status: STATUSES[(index + 2) % STATUSES.length],
    sortingNote: SORTING_NOTES[index % SORTING_NOTES.length],
    storageNote: method.storageNote,
    seasonNote: SEASON_NOTES[(index * 2 + 1) % SEASON_NOTES.length],
    traceSteps: traceSteps(method, index),
    qualityChecks: ["Parsel etiketi kontrolü", method.method === "cekirdek" ? "Kırık iç ayrımı" : "Gözle yara ve renk kontrolü", "Kutu net ağırlık kontrolü", "Pasaport kodu eşleştirmesi"],
  };
});

await writeGenerated(
  "lotLedger.ts",
  `
export type LedgerMethod = "gun" | "islimli" | "cekirdek";

export interface LedgerLot {
  code: string;
  product: string;
  method: LedgerMethod;
  methodLabel: string;
  parcel: string;
  location: string;
  harvestWeek: number;
  harvestWindow: string;
  sergiDays: number;
  islimHours: number;
  patikDayOffset: number;
  grade: string;
  inputKg: number;
  outputKg: number;
  boxSize: string;
  boxCount: number;
  dryness: string;
  status: string;
  sortingNote: string;
  storageNote: string;
  seasonNote: string;
  traceSteps: string[];
  qualityChecks: string[];
}

${arrayConst("LOT_LEDGER", "LedgerLot", ledgerLots)}

export const LEDGER_PARCELS: string[] = ${literalList(LEDGER_PARCELS.map((item) => item.parcel))};

export const LEDGER_METHOD_FILTERS = [
  { id: "all", label: "Tüm yöntemler" },
  { id: "gun", label: "Gün kurusu" },
  { id: "islimli", label: "İslimli" },
  { id: "cekirdek", label: "Çekirdek" },
] as const;

export function getLedgerLot(code: string): LedgerLot | undefined {
  const wanted = code.trim().toLocaleUpperCase("tr-TR").replace(/\\s+/g, "");
  return LOT_LEDGER.find((lot) => lot.code.replace(/\\s+/g, "") === wanted);
}

export function summarizeLedger(lots: LedgerLot[]) {
  return {
    count: lots.length,
    inputKg: lots.reduce((sum, lot) => sum + lot.inputKg, 0),
    outputKg: lots.reduce((sum, lot) => sum + lot.outputKg, 0),
    boxCount: lots.reduce((sum, lot) => sum + lot.boxCount, 0),
    parcels: new Set(lots.map((lot) => lot.parcel)).size,
  };
}
`
);

/* ------------------------------------------------------------------ */
/* 52 haftalık sezon takvimi                                            */
/* ------------------------------------------------------------------ */

const WEEK_ANGLES = ["Gözlem ve kayıt", "Hazırlık ve onarım", "Masa başı plan", "Kontrol ve kapatma"];
const EDITORIAL_TASKS = [
  "Siteye bu haftanın parsel gözlemini tek kartta özetle",
  "Sözlükte ilgili kavramı ziyaretçi diliyle yeniden oku",
  "Haftanın işini süreç bölümündeki sıralamayla karşılaştır",
  "Temsilî kayıt uyarısının her yeni kartta korunduğunu kontrol et",
  "Bir ziyaretçi sorusunu cevap taslağına çevir",
  "Mutfak bölümüne haftanın ürün kullanımını bağla",
];
const DEMO_CHECKS = [
  "Örnek lot kodu PT-26-047 ile sorguyu çalıştır",
  "Lotunu Kur akışında tek ürün önerisini baştan sona izle",
  "360 px genişlikte takvim kartlarının taşmadığını kontrol et",
  "Klavyeyle atlas sekmeleri arasında dolaş",
  "Sepete ürün ekleyip sayfa yenileme davranışını gör",
  "Radyo çalışmazsa resmî site yedek yolunu doğrula",
];

function riskFor(monthIndex, week) {
  if ([2, 6, 7].includes(monthIndex)) return week % 3 === 0 ? "Orta" : "Yüksek";
  if ([3, 4, 5, 8].includes(monthIndex)) return "Orta";
  return "Düşük";
}

const seasonWeeks = Array.from({ length: 52 }, (_, zeroBased) => {
  const week = zeroBased + 1;
  const monthIndex = Math.min(11, Math.floor((zeroBased / 52) * 12));
  const plan = MONTH_PLANS[monthIndex];
  const angle = WEEK_ANGLES[zeroBased % WEEK_ANGLES.length];
  return {
    week,
    month: plan.month,
    phase: plan.phase,
    title: `${plan.phase} · ${angle}`,
    focus: plan.focus,
    fieldTasks: rotating(plan.field, zeroBased, 4),
    workshopTasks: rotating(plan.workshop, zeroBased + 1, 3),
    recordChecks: rotating(plan.records, zeroBased + 2, 3),
    kitchenNote: plan.kitchen[zeroBased % plan.kitchen.length],
    riskLevel: riskFor(monthIndex, week),
    watchout: plan.risks[zeroBased % plan.risks.length],
    editorialTask: EDITORIAL_TASKS[zeroBased % EDITORIAL_TASKS.length],
    demoCheck: DEMO_CHECKS[(zeroBased + 3) % DEMO_CHECKS.length],
  };
});

await writeGenerated(
  "seasonCalendar.ts",
  `
export interface SeasonWeek {
  week: number;
  month: string;
  phase: string;
  title: string;
  focus: string;
  fieldTasks: string[];
  workshopTasks: string[];
  recordChecks: string[];
  kitchenNote: string;
  riskLevel: "Düşük" | "Orta" | "Yüksek";
  watchout: string;
  editorialTask: string;
  demoCheck: string;
}

${arrayConst("SEASON_CALENDAR", "SeasonWeek", seasonWeeks)}

export const SEASON_MONTHS: string[] = ${literalList(MONTH_PLANS.map((plan) => plan.month))};
export const SEASON_PHASES: string[] = ${literalList([...new Set(seasonWeeks.map((week) => week.phase))])};

export function seasonWeekLabel(week: SeasonWeek): string {
  return week.month + " · " + week.week + ". hafta";
}
`
);

/* ------------------------------------------------------------------ */
/* Sözlük                                                              */
/* ------------------------------------------------------------------ */

const GLOSSARY_CONTEXT = {
  "Süreç": "Patik'te bu kavram hasattan kutuya uzanan iş sırasını anlatırken kullanılır.",
  "Bahçe": "Patik'te bu kavram parsel gözlemi ve hasat penceresi konuşulurken kullanılır.",
  "Ürün": "Patik'te bu kavram ürün kartı, kutu ve saklama kararlarında karşına çıkar.",
  "Lot ve Kayıt": "Patik'te bu kavram kutudaki kodun geriye doğru izini açıklamak için kullanılır.",
  "Mutfak": "Patik'te bu kavram hoşaf hesabı ve sofra kullanımıyla birlikte anlatılır.",
  "Demo ve Dijital": "Patik'te bu kavram yarışma demosunun dürüst ve kullanılabilir kalmasını sağlar.",
};

const GLOSSARY_LOOK_FOR = {
  "Süreç": "Süreç bölümündeki adım sırasına bak; kavram komşu adımıyla anlam kazanır.",
  "Bahçe": "Mevsim kartında ay ve hava notunu birlikte düşün.",
  "Ürün": "Etikette yöntem ve gramajı birlikte kontrol et.",
  "Lot ve Kayıt": "Pasaportta bahçe, hafta, yöntem ve saklama satırlarını aynı kartta ara.",
  "Mutfak": "Kişi sayısı ve kullanılan ürün yöntemini tariften önce netleştir.",
  "Demo ve Dijital": "Kavramın gerçek işlem mi, temsilî gösterim mi olduğunu sayfadaki etiketten doğrula.",
};

const glossary = Object.entries(TERM_GROUPS).flatMap(([category, pairs]) =>
  pairs.map(([term, definition], index) => ({
    term,
    slug: slugify(term),
    category,
    definition,
    patikContext: GLOSSARY_CONTEXT[category],
    lookFor: GLOSSARY_LOOK_FOR[category],
    relatedTerm: pairs[(index + 1) % pairs.length][0],
  }))
);

await writeGenerated(
  "glossary.ts",
  `
export interface GlossaryEntry {
  term: string;
  slug: string;
  category: string;
  definition: string;
  patikContext: string;
  lookFor: string;
  relatedTerm: string;
}

${arrayConst("GLOSSARY", "GlossaryEntry", glossary)}

export const GLOSSARY_CATEGORIES: string[] = ${literalList(Object.keys(TERM_GROUPS))};

export function findGlossaryEntry(slug: string): GlossaryEntry | undefined {
  return GLOSSARY.find((entry) => entry.slug === slug);
}
`
);

/* ------------------------------------------------------------------ */
/* Tarif ve eşleştirme kartları                                        */
/* ------------------------------------------------------------------ */

const NUT_ACCENTS = new Set(["Ceviz", "Fındık", "Badem"]);

const recipes = RECIPE_BASES.flatMap((base, baseIndex) =>
  RECIPE_ACCENTS.map((accent, accentIndex) => {
    const noCookClove = base.cookMinutes === 0 && accent.name === "Karanfil";
    const ingredient = noCookClove ? "Bir tutam öğütülmüş karanfil (isteğe bağlı)" : accent.ingredient;
    const accentStep = noCookClove
      ? "Öğütülmüş karanfili yalnızca bir tutam kullanarak son karıştırmada ekle."
      : accent.step;
    const steps = [...base.steps];
    steps.splice(Math.max(1, steps.length - 1), 0, accentStep);
    return {
      id: `${slugify(base.base)}-${slugify(accent.name)}`,
      title: `${base.base} — ${accent.name} aksanı`,
      base: base.base,
      accent: accent.name,
      product: base.product,
      servings: base.servings,
      prepMinutes: base.prepMinutes + (NUT_ACCENTS.has(accent.name) ? 2 : 0),
      cookMinutes: base.cookMinutes,
      texture: base.texture,
      ingredients: [...base.ingredients, ingredient],
      steps,
      servingNote: base.serving,
      storageNote: base.storage,
      accentNote: accent.note,
      safetyNote: NUT_ACCENTS.has(accent.name)
        ? "Kuruyemiş hassasiyeti olanlar için aksanı tamamen atla."
        : "Malzeme hassasiyetin varsa aksanı tarife eklemeden uygula.",
      tags: [...base.tags, accent.name, `Tarif ${String(baseIndex * RECIPE_ACCENTS.length + accentIndex + 1).padStart(2, "0")}`],
    };
  })
);

await writeGenerated(
  "recipes.ts",
  `
export interface RecipeCard {
  id: string;
  title: string;
  base: string;
  accent: string;
  product: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  texture: string;
  ingredients: string[];
  steps: string[];
  servingNote: string;
  storageNote: string;
  accentNote: string;
  safetyNote: string;
  tags: string[];
}

${arrayConst("RECIPES", "RecipeCard", recipes)}

export const RECIPE_BASE_NAMES: string[] = ${literalList(RECIPE_BASES.map((base) => base.base))};
export const RECIPE_ACCENT_NAMES: string[] = ${literalList(RECIPE_ACCENTS.map((accent) => accent.name))};
export const RECIPE_PRODUCTS: string[] = ${literalList([...new Set(recipes.map((recipe) => recipe.product))])};

export function totalRecipeMinutes(recipe: RecipeCard): number {
  return recipe.prepMinutes + recipe.cookMinutes;
}
`
);

/* ------------------------------------------------------------------ */
/* Bilgi kartları                                                      */
/* ------------------------------------------------------------------ */

const knowledgeCards = KNOWLEDGE_TOPICS.flatMap((topic, topicIndex) =>
  KNOWLEDGE_SCENARIOS.map((scenario, scenarioIndex) => ({
    id: `bilgi-${String(topicIndex * KNOWLEDGE_SCENARIOS.length + scenarioIndex + 1).padStart(3, "0")}`,
    title: `${topic[0]} — ${scenario.label}`,
    category: topic[1],
    scenario: scenario.label,
    summary: topic[2],
    detail: `${scenario.detail} ${topic[3]}`,
    action: topic[4],
    anchor: topic[5],
  }))
);

await writeGenerated(
  "knowledgeCards.ts",
  `
export interface KnowledgeCard {
  id: string;
  title: string;
  category: string;
  scenario: string;
  summary: string;
  detail: string;
  action: string;
  anchor: string;
}

${arrayConst("KNOWLEDGE_CARDS", "KnowledgeCard", knowledgeCards)}

export const KNOWLEDGE_CATEGORIES: string[] = ${literalList([...new Set(knowledgeCards.map((card) => card.category))])};
export const KNOWLEDGE_SCENARIOS: string[] = ${literalList(KNOWLEDGE_SCENARIOS.map((scenario) => scenario.label))};
`
);

/* ------------------------------------------------------------------ */
/* Soru bankası                                                       */
/* ------------------------------------------------------------------ */

const quiz = [];
let quizSerial = 1;

function addQuiz(category, difficulty, question, correct, wrongs, explanation, anchor) {
  const { options, answerIndex } = insertCorrect(correct, wrongs, quizSerial);
  quiz.push({
    id: `soru-${String(quizSerial).padStart(3, "0")}`,
    category,
    difficulty,
    question,
    options,
    answerIndex,
    explanation,
    anchor,
  });
  quizSerial += 1;
}

QUIZ_SCENARIOS.forEach(([category, question, correct, wrong1, wrong2, explanation, anchor]) => {
  addQuiz(category, "Orta", question, correct, [wrong1, wrong2], explanation, anchor);
});

glossary.slice(0, 72).forEach((entry, index) => {
  const wrongA = glossary[(index + 17) % glossary.length].definition;
  const wrongB = glossary[(index + 43) % glossary.length].definition;
  addQuiz(
    `Sözlük · ${entry.category}`,
    index % 4 === 0 ? "Orta" : "Kolay",
    `“${entry.term}” kavramı Patik sözlüğünde neyi anlatır?`,
    entry.definition,
    [wrongA, wrongB],
    `${entry.term}: ${entry.definition} İlişkili kavram: ${entry.relatedTerm}.`,
    "#atlas"
  );
});

glossary.slice(72, 108).forEach((entry, index) => {
  const wrongA = glossary[(index + 91) % glossary.length].term;
  const wrongB = glossary[(index + 119) % glossary.length].term;
  addQuiz(
    `Tersten Sözlük · ${entry.category}`,
    index % 3 === 0 ? "Zor" : "Orta",
    `“${entry.definition}” tanımı hangi kavramı anlatır?`,
    entry.term,
    [wrongA, wrongB],
    `Doğru kavram ${entry.term}. ${entry.patikContext}`,
    "#atlas"
  );
});

await writeGenerated(
  "quizBank.ts",
  `
export interface QuizQuestion {
  id: string;
  category: string;
  difficulty: "Kolay" | "Orta" | "Zor";
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  anchor: string;
}

${arrayConst("QUIZ_BANK", "QuizQuestion", quiz)}

export const QUIZ_CATEGORIES: string[] = ${literalList([...new Set(quiz.map((question) => question.category))])};
export const QUIZ_DIFFICULTIES: string[] = ["Kolay", "Orta", "Zor"];

export function isQuizAnswerCorrect(question: QuizQuestion, selectedIndex: number): boolean {
  return question.answerIndex === selectedIndex;
}
`
);

await writeGenerated(
  "index.ts",
  `
export * from "./glossary";
export * from "./knowledgeCards";
export * from "./lotLedger";
export * from "./quizBank";
export * from "./recipes";
export * from "./seasonCalendar";
`
);

const totalRecords = ledgerLots.length + seasonWeeks.length + glossary.length + recipes.length + knowledgeCards.length + quiz.length;
console.log(`Toplam temsilî atlas kaydı: ${totalRecords}`);
