#!/usr/bin/env node
/**
 * Patik Evreni veri üreticisi.
 *
 * Çalıştırma: npm run content:generate:universe
 *
 * Bu betik temsilî operasyon/öğrenme kayıtlarını deterministik üretir.
 * Amaç gerçek hasat verisi uydurmak değil; izlenebilirlik arayüzünün
 * günlük, kalite, kutu, hediye ve öğrenme ölçeğinde nasıl çalışacağını
 * açık etiketlerle göstermektir.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KNOWLEDGE_TOPICS, MONTH_PLANS } from "./atlas-source-data.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src", "content");
const GENERATED_NOTE = `/* ------------------------------------------------------------------ */\n/*  Bu dosya scripts/generate-universe-content.mjs ile üretilmiştir.  */\n/*  Kayıtlar Patik Evreni için temsilî demo içeriğidir.               */\n/*  Gerçek hasat, stok, kalite veya satış verisi değildir.            */\n/* ------------------------------------------------------------------ */\n`;

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

function rotating(pool, start, count) {
  return Array.from({ length: count }, (_, index) => pool[(start + index) % pool.length]);
}

async function writeGenerated(filename, body) {
  const content = `${GENERATED_NOTE}\n${body.trim()}\n`;
  await writeFile(path.join(OUT_DIR, filename), content, "utf8");
  console.log(`${filename}: ${content.split("\n").length} satır`);
}

/* ------------------------------------------------------------------ */
/* 365 günlük temsilî sezon günlüğü                                   */
/* ------------------------------------------------------------------ */

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const JOURNAL_ANGLES = [
  "Sabah parsel turu",
  "Defter ve düzen",
  "Atölye hazırlığı",
  "Gözlem notu",
  "Küçük onarım",
  "Sofra provası",
  "Ekip senkronu",
  "Kapanış kontrolü",
];
const FOCUS_AREAS = ["Bahçe", "Atölye", "Kayıt", "Mutfak"];
const WEATHER_SCENARIOS = [
  ["Soğuk ve kuru bir kış sabahı senaryosu", "Kapalı, sakin kış günü senaryosu", "Ayaz sonrası güneşli aralık senaryosu"],
  ["Serin ve değişken şubat günü senaryosu", "Toprağın nemli olduğu sakin gün senaryosu", "Rüzgârlı bakım günü senaryosu"],
  ["Çiçek döneminde serin gece senaryosu", "Ilıman ve açık mart günü senaryosu", "Geçiş yağışına hazırlık senaryosu"],
  ["Ilıman nisan güneşi senaryosu", "Ara ara rüzgârlı bahar günü senaryosu", "Serin sabah, ılık öğle senaryosu"],
  ["Uzayan gün ışığı senaryosu", "Sakin ve kuru mayıs günü senaryosu", "Öğleden sonra sıcaklığı artan gün senaryosu"],
  ["Hasat öncesi parlak yaz günü senaryosu", "Kuru ve sıcak hazırlık günü senaryosu", "Sabah serinliği uzun süren gün senaryosu"],
  ["Yoğun güneşli hasat günü senaryosu", "Sabah serin, öğle sıcak sergi günü senaryosu", "Hafif rüzgârlı kurutma günü senaryosu"],
  ["Sergi için kuru ağustos günü senaryosu", "Sıcak öğle ve sakin akşam senaryosu", "Rüzgârın bez düzenini yokladığı gün senaryosu"],
  ["Ilıman eylül kapanış günü senaryosu", "Kuru ve sakin arşiv günü senaryosu", "Akşam serinliğinin belirginleştiği gün senaryosu"],
  ["Sonbahar ışığı güçlü ekim günü senaryosu", "Serin ve sakin gözlem günü senaryosu", "Ara ara kapalı sonbahar günü senaryosu"],
  ["Soğumaya başlayan kasım günü senaryosu", "Kuru ve kısa gün ışığı senaryosu", "Kış bakımına uygun sakin gün senaryosu"],
  ["Kışa giriş ve defter kapanışı senaryosu", "Soğuk, açık aralık günü senaryosu", "Yıl sonu sayımına uygun sakin gün senaryosu"],
];
const DEMO_TIPS = [
  "Bugünün kartını tek cümleyle sayfa ziyaretçisine anlatmayı dene.",
  "Bu işi süreç bölümündeki hangi adıma bağladığını kontrol et.",
  "Temsilî plan olduğunu kart başlığında görünür bırak.",
  "Gün sonu notunda ölçü yerine gözleme dayan.",
  "Bir sonraki günün ilk işini defterin üst satırına taşı.",
  "Bu görevi 360 px ekranda tek bakışta okunur tut.",
  "Aynı işi farklı ayda arattığında kayıt dilinin tutarlılığını karşılaştır.",
  "Risk notunu korku cümlesine çevirmeden somut bırak.",
];

const dailyJournal = [];
let dayCounter = 0;

MONTH_PLANS.forEach((plan, monthIndex) => {
  for (let dayOfMonth = 1; dayOfMonth <= MONTH_DAYS[monthIndex]; dayOfMonth += 1) {
    dayCounter += 1;
    const orchardTask = plan.field[(dayCounter + dayOfMonth) % plan.field.length];
    const workshopTask = plan.workshop[(dayCounter + 2) % plan.workshop.length];
    const recordTask = plan.records[(dayCounter + 4) % plan.records.length];
    dailyJournal.push({
      dayOfYear: dayCounter,
      dateLabel: `${dayOfMonth} ${plan.month}`,
      month: plan.month,
      monthIndex: monthIndex + 1,
      dayOfMonth,
      phase: plan.phase,
      title: `${plan.phase} · ${JOURNAL_ANGLES[dayCounter % JOURNAL_ANGLES.length]}`,
      focusArea: FOCUS_AREAS[dayCounter % FOCUS_AREAS.length],
      weatherScenario: WEATHER_SCENARIOS[monthIndex][dayCounter % 3],
      orchardTask,
      workshopTask,
      recordTask,
      kitchenNote: plan.kitchen[dayCounter % plan.kitchen.length],
      riskNote: plan.risks[(dayCounter + 1) % plan.risks.length],
      checklist: [orchardTask, workshopTask, recordTask, "Gün sonunda bir satırlık kapanış notu yaz"],
      estimatedMinutes: 40 + ((dayCounter * 13) % 10) * 10,
      demoTip: DEMO_TIPS[dayCounter % DEMO_TIPS.length],
    });
  }
});

const journalMonths = MONTH_PLANS.map((plan, index) => ({
  index: index + 1,
  name: plan.month,
  days: MONTH_DAYS[index],
  phase: plan.phase,
}));

await writeGenerated(
  "dailyJournal.ts",
  `
export interface JournalMonth {
  index: number;
  name: string;
  days: number;
  phase: string;
}

export interface DailyJournalEntry {
  dayOfYear: number;
  dateLabel: string;
  month: string;
  monthIndex: number;
  dayOfMonth: number;
  phase: string;
  title: string;
  focusArea: "Bahçe" | "Atölye" | "Kayıt" | "Mutfak";
  weatherScenario: string;
  orchardTask: string;
  workshopTask: string;
  recordTask: string;
  kitchenNote: string;
  riskNote: string;
  checklist: string[];
  estimatedMinutes: number;
  demoTip: string;
}

${arrayConst("JOURNAL_MONTHS", "JournalMonth", journalMonths)}

${arrayConst("DAILY_JOURNAL", "DailyJournalEntry", dailyJournal)}

export const JOURNAL_PHASES: string[] = ${literalList([...new Set(dailyJournal.map((entry) => entry.phase))])};
export const JOURNAL_FOCUS_AREAS: string[] = ${literalList(FOCUS_AREAS)};

export function journalEntryForDate(monthIndex: number, dayOfMonth: number): DailyJournalEntry | undefined {
  return DAILY_JOURNAL.find((entry) => entry.monthIndex === monthIndex && entry.dayOfMonth === dayOfMonth);
}
`
);

/* ------------------------------------------------------------------ */
/* Parsel profilleri                                                   */
/* ------------------------------------------------------------------ */

const PARCEL_CLUSTERS = [
  { name: "Gölyaka", location: "Çavuşlu demo sahası, Baskil", slope: "Hafif eğimli teras" },
  { name: "Kıyıdüzü", location: "Karakaya kıyısı demo sahası, Baskil", slope: "Düze yakın kıyı bandı" },
  { name: "Yamaç", location: "Yamaç demo sahası, Baskil", slope: "Basamaklı yamaç" },
  { name: "Sergi Düzü", location: "Sergi düzü demo sahası, Baskil", slope: "Geniş ve düz çalışma alanı" },
  { name: "Fidanlık Yanı", location: "Atölye yanı demo sahası, Baskil", slope: "Hafif eğimli iç parsel" },
  { name: "Çavuşlu Sırtı", location: "Sırt demo sahası, Baskil", slope: "Rüzgâr alan sırt hattı" },
  { name: "Teras Altı", location: "Alt basamak demo sahası, Baskil", slope: "Korunaklı alt teras" },
  { name: "Kıyı Terası", location: "Kıyı terası demo sahası, Baskil", slope: "Kıyıya bakan geniş teras" },
];
const SUN_EXPOSURES = ["Sabah güneşi güçlü", "Öğle güneşi uzun", "Akşam güneşi belirgin", "Gün boyu dengeli", "Kısmen gölgeli sıra içeriyor"];
const ACCESS_NOTES = ["Kasa yolu düz ve kısa", "Teras basamağında el taşıması gerekiyor", "Atölyeye en yakın bloklardan", "Sergi alanına tek yön erişim rahat", "Yağış sonrası yol ayrıca kontrol edilmeli"];
const WATER_NOTES = ["Sulama hattı sıra başından izlenir", "Drenaj hattı alt basamakta toplanır", "Kuru dönemde öncelik listesine erken girer", "Su planı komşu blokla dönüşümlü yazılır", "Gölgeli sıralar ayrıca gözlenir"];
const SOIL_NOTES = ["Temsilî planda taşlı üst katman notu var", "Temsilî planda geçirgen yüzey kabulü var", "Temsilî planda basamak kenarı güçlendirme notu var", "Temsilî planda kök çevresi kuru ot takibi var", "Temsilî planda yol kenarı sıkışması izlenir"];
const STRENGTHS = ["Hasat kasası beklemeden atölyeye ulaşır", "Sıra etiketleri uzaktan okunabilir", "Sergi alanıyla aynı kotta çalışılır", "Sabah turunda ilk kontrol edilebilir", "Blok sınırı kayıt defterinde net ayrılır", "Teras basamağı fotoğraf karşılaştırmasına uygundur"];
const WATCHOUTS = ["Gölgeli sıraların hasat penceresi ayrı yazılmalı", "Rüzgârlı günde kasa üstü etiketi sabitlenmeli", "Komşu blokla aynı yöntem kasaları karıştırılmamalı", "Yol kenarındaki ilk sıraya ayrıca bakılmalı", "Geç olgunlaşan sıra ana partiden ayrı tutulmalı", "Blok kodu her kasada tekrar edilmeli"];
const RECORD_FOCUS = ["Çiçek tarihini ilk satırda tut", "Hasat haftasını blok koduyla eşleştir", "Yöntem ayrımını kasa kapağında tekrarla", "Patik gününü sergi numarasıyla yaz", "Eleme sınıfını fotoğraf notuna bağla", "Sezon sonu performansını tek cümleyle kapat"];

const parcelProfiles = PARCEL_CLUSTERS.flatMap((cluster, clusterIndex) =>
  Array.from({ length: 6 }, (_, blockIndex) => {
    const serial = clusterIndex * 6 + blockIndex + 1;
    const methods = ["gun", "islimli", "karma"];
    return {
      id: `parsel-${String(serial).padStart(2, "0")}`,
      code: `PRS-${String(serial).padStart(2, "0")}`,
      name: `${cluster.name} · Blok ${String.fromCharCode(65 + blockIndex)}`,
      cluster: cluster.name,
      location: cluster.location,
      terraceLevel: blockIndex + 1,
      rowCount: 6 + ((serial * 3) % 13),
      treeAgeBand: ["Genç blok", "Orta yaş blok", "Olgun blok", "Karışık yaş bloğu"][serial % 4],
      slope: cluster.slope,
      sunExposure: SUN_EXPOSURES[serial % SUN_EXPOSURES.length],
      access: ACCESS_NOTES[(serial + clusterIndex) % ACCESS_NOTES.length],
      waterNote: WATER_NOTES[(serial + 2) % WATER_NOTES.length],
      soilNote: SOIL_NOTES[(serial + 4) % SOIL_NOTES.length],
      preferredMethod: methods[serial % methods.length],
      harvestOrder: ((serial + clusterIndex) % 8) + 1,
      strengths: rotating(STRENGTHS, serial, 3),
      watchouts: rotating(WATCHOUTS, serial + 2, 3),
      recordFocus: RECORD_FOCUS[serial % RECORD_FOCUS.length],
      stationNote: `Temsilî planda bu blok, sergi istasyonu S-${(serial % 6) + 1} ile eşleştirilir.`,
    };
  })
);

await writeGenerated(
  "parcelProfiles.ts",
  `
export type ParcelMethodPreference = "gun" | "islimli" | "karma";

export interface ParcelProfile {
  id: string;
  code: string;
  name: string;
  cluster: string;
  location: string;
  terraceLevel: number;
  rowCount: number;
  treeAgeBand: string;
  slope: string;
  sunExposure: string;
  access: string;
  waterNote: string;
  soilNote: string;
  preferredMethod: ParcelMethodPreference;
  harvestOrder: number;
  strengths: string[];
  watchouts: string[];
  recordFocus: string;
  stationNote: string;
}

${arrayConst("PARCEL_PROFILES", "ParcelProfile", parcelProfiles)}

export const PARCEL_CLUSTERS: string[] = ${literalList(PARCEL_CLUSTERS.map((cluster) => cluster.name))};
export const PARCEL_METHOD_LABELS: Record<ParcelMethodPreference, string> = {
  gun: "Gün kurusuna yakın",
  islimli: "İslimliye yakın",
  karma: "Karma plan",
};
`
);

/* ------------------------------------------------------------------ */
/* Kalite kontrolleri                                                  */
/* ------------------------------------------------------------------ */

const QUALITY_CHECKPOINTS = ["Sergi çıkışı", "Patik sonrası", "Eleme masası", "Kutu öncesi"];
const COLOR_BANDS = {
  gun: ["Koyu amber dengeli", "Derin amber ağırlıklı", "Açık-koyu karışık"],
  islimli: ["Canlı turuncu dengeli", "Parlak turuncu ağırlıklı", "Hafif ton farkı içeriyor"],
  cekirdek: ["Açık iç tonu dengeli", "Bütün iç tonu belirgin", "Karışık iç tonu"],
};
const TEXTURE_BANDS = {
  gun: ["Yumuşak ve yoğun", "Dengeli yumuşak", "Bir kısmı daha sıkı"],
  islimli: ["Diri ve şekil koruyan", "Dengeli diri", "Hafif yumuşak parti"],
  cekirdek: ["Bütün iç ağırlıklı", "Kırık iç ayrımı net", "Küçük iç oranı yüksek"],
};
const QUALITY_PRODUCTS = [
  { method: "gun", product: "Gün Kurusu" },
  { method: "islimli", product: "İslimli Jumbo" },
  { method: "cekirdek", product: "Kayısı Çekirdeği İçi" },
];
const INSPECTOR_NOTES = [
  "Numune, parti genelini temsil edecek şekilde üç kasadan alındı.",
  "Renk ayrımı son kutu sınıfıyla uyumlu görünüyor.",
  "Boy dağılımında küçük grup mutfak denemesine daha uygun.",
  "Etiket ve pasaport kodları aynı satırdan okundu.",
  "Yüzey görünümü yöntem tanımıyla tutarlı.",
  "Kırık veya ezik parçalar ana sınıftan ayrıldı.",
];
const CORRECTIVE_ACTIONS = [
  "Ek işlem yok; kutu hattına gönder.",
  "Boy kaplarını bir kez daha tart ve etiketi güncelle.",
  "Küçük grubu mutfak kartları için ayrı işaretle.",
  "Pasaporttaki eleme satırını son dağılıma göre düzelt.",
  "Etiketi basmadan önce lot kodunu ikinci kez okut.",
  "Partiyi gölgede kısa dinlendirme sonrası yeniden gözle kontrol et.",
];

const qualityChecks = Array.from({ length: 192 }, (_, index) => {
  const product = QUALITY_PRODUCTS[index % QUALITY_PRODUCTS.length];
  const primaryShare = 58 + ((index * 7) % 27);
  const secondaryShare = 8 + ((index * 5) % 18);
  const reserveShare = Math.max(3, 100 - primaryShare - secondaryShare);
  const normalizedSecondary = 100 - primaryShare - reserveShare;
  const weightStatus = index % 17 === 0 ? "Yeniden tartım gerekli" : "Net ağırlık uyumlu";
  const decision = weightStatus !== "Net ağırlık uyumlu" || reserveShare >= 17
    ? "Yeniden ele"
    : primaryShare < 63
      ? "Mutfak denemesine ayır"
      : "Kutulabilir";

  return {
    id: `qc-${String(index + 1).padStart(3, "0")}`,
    lotCode: `PT-26-${201 + (index % 204)}`,
    product: product.product,
    method: product.method,
    checkpoint: QUALITY_CHECKPOINTS[index % QUALITY_CHECKPOINTS.length],
    sampleGrams: 250 + (index % 4) * 250,
    colorBand: COLOR_BANDS[product.method][index % 3],
    textureBand: TEXTURE_BANDS[product.method][(index + 1) % 3],
    primaryShare,
    secondaryShare: normalizedSecondary,
    reserveShare,
    weightStatus,
    labelStatus: index % 23 === 0 ? "Yeniden basılacak" : "Etiket uyumlu",
    passportStatus: index % 29 === 0 ? "Kod eşleştirmesi bekliyor" : "Pasaport hazır",
    decision,
    inspectorNote: INSPECTOR_NOTES[index % INSPECTOR_NOTES.length],
    correctiveAction: decision === "Kutulabilir" ? CORRECTIVE_ACTIONS[0] : CORRECTIVE_ACTIONS[1 + (index % (CORRECTIVE_ACTIONS.length - 1))],
    checkedAtLabel: `Sezon günü ${(index % 45) + 1} · ${(index % 2) === 0 ? "Sabah kontrolü" : "Kapanış kontrolü"}`,
  };
});

await writeGenerated(
  "qualityChecks.ts",
  `
export type QualityMethod = "gun" | "islimli" | "cekirdek";
export type QualityDecision = "Kutulabilir" | "Yeniden ele" | "Mutfak denemesine ayır";

export interface QualityCheck {
  id: string;
  lotCode: string;
  product: string;
  method: QualityMethod;
  checkpoint: string;
  sampleGrams: number;
  colorBand: string;
  textureBand: string;
  primaryShare: number;
  secondaryShare: number;
  reserveShare: number;
  weightStatus: string;
  labelStatus: string;
  passportStatus: string;
  decision: QualityDecision;
  inspectorNote: string;
  correctiveAction: string;
  checkedAtLabel: string;
}

${arrayConst("QUALITY_CHECKS", "QualityCheck", qualityChecks)}

export const QUALITY_CHECKPOINTS: string[] = ${literalList(QUALITY_CHECKPOINTS)};
export const QUALITY_DECISIONS: QualityDecision[] = ["Kutulabilir", "Yeniden ele", "Mutfak denemesine ayır"];

export function summarizeQualityChecks(checks: QualityCheck[]) {
  return {
    count: checks.length,
    packable: checks.filter((check) => check.decision === "Kutulabilir").length,
    rework: checks.filter((check) => check.decision === "Yeniden ele").length,
    kitchen: checks.filter((check) => check.decision === "Mutfak denemesine ayır").length,
    averagePrimary: checks.length
      ? Math.round(checks.reduce((sum, check) => sum + check.primaryShare, 0) / checks.length)
      : 0,
  };
}
`
);

/* ------------------------------------------------------------------ */
/* Kutu hattı koşuları                                                 */
/* ------------------------------------------------------------------ */

const PACKING_STATIONS = ["Eleme masası", "Kutu hattı 1", "Kutu hattı 2", "Hediye masası", "Pasaport masası"];
const PACKING_CHECKS = [
  "Net ağırlık tartımı",
  "Lot kodu okuma",
  "Pasaport kartı sayısı",
  "Kapak kapanışı",
  "Etiket yönü",
  "Kutu içi düzen",
  "Yöntem etiketi",
  "Son göz kontrolü",
];
const PACKING_ISSUES = [
  "Sorun notu yok",
  "Bir etikette yön düzeltmesi yapıldı",
  "Pasaport destesi koşu ortasında yenilendi",
  "Kapak stoğu için kısa bekleme oldu",
  "Bir kutuda tartım tekrarı yapıldı",
  "Hediye bölmesi yerleşimi düzeltildi",
];

const packingRuns = Array.from({ length: 144 }, (_, index) => {
  const product = QUALITY_PRODUCTS[index % QUALITY_PRODUCTS.length];
  const boxCount = 24 + ((index * 17) % 180);
  const isGift = index % 6 === 0;
  return {
    id: `pk-${String(index + 1).padStart(3, "0")}`,
    runCode: `PK-26-${String(index + 1).padStart(3, "0")}`,
    lotCode: `PT-26-${201 + (index % 204)}`,
    product: isGift ? "Fırat Sergisi Kutusu bileşeni" : product.product,
    method: product.method,
    station: PACKING_STATIONS[index % PACKING_STATIONS.length],
    boxType: isGift ? "Üç bölmeli hediye kutusu" : product.method === "cekirdek" ? "250 g tek ürün kutusu" : "500 g tek ürün kutusu",
    boxCount,
    passportCards: isGift ? boxCount * 3 : boxCount,
    labelCount: boxCount,
    startedAtLabel: `Sezon günü ${(index % 48) + 1} · ${String(8 + (index % 8)).padStart(2, "0")}:${index % 2 === 0 ? "00" : "30"}`,
    durationMinutes: 35 + ((index * 11) % 115),
    pace: ["Sakin", "Dengeli", "Yoğun"][index % 3],
    checks: rotating(PACKING_CHECKS, index, 4),
    issueNote: PACKING_ISSUES[index % PACKING_ISSUES.length],
    nextStep: ["Depo rafına al", "Hediye masasına aktar", "Pasaport yazımına gönder", "Son sayıma bırak"][index % 4],
    completionState: index % 19 === 0 ? "Son sayım bekliyor" : "Koşu kapatıldı",
  };
});

await writeGenerated(
  "packingRuns.ts",
  `
export type PackingMethod = "gun" | "islimli" | "cekirdek";

export interface PackingRun {
  id: string;
  runCode: string;
  lotCode: string;
  product: string;
  method: PackingMethod;
  station: string;
  boxType: string;
  boxCount: number;
  passportCards: number;
  labelCount: number;
  startedAtLabel: string;
  durationMinutes: number;
  pace: "Sakin" | "Dengeli" | "Yoğun";
  checks: string[];
  issueNote: string;
  nextStep: string;
  completionState: string;
}

${arrayConst("PACKING_RUNS", "PackingRun", packingRuns)}

export const PACKING_STATIONS: string[] = ${literalList(PACKING_STATIONS)};

export function summarizePackingRuns(runs: PackingRun[]) {
  return {
    count: runs.length,
    boxes: runs.reduce((sum, run) => sum + run.boxCount, 0),
    passports: runs.reduce((sum, run) => sum + run.passportCards, 0),
    minutes: runs.reduce((sum, run) => sum + run.durationMinutes, 0),
    open: runs.filter((run) => run.completionState !== "Koşu kapatıldı").length,
  };
}
`
);

/* ------------------------------------------------------------------ */
/* Hediye senaryoları                                                  */
/* ------------------------------------------------------------------ */

const GIFT_OCCASIONS = [
  { name: "Teşekkür", opening: "Küçük bir teşekkür olarak", presentation: "Kutuyu sade bir not kartıyla elden ver" },
  { name: "Çay daveti", opening: "Çayın yanına Baskil'den bir tat bırakmak istedim", presentation: "Tadım kaselerini kutunun yanında hazır et" },
  { name: "Yeni ev ziyareti", opening: "Yeni mutfağına ilk kokulardan biri olsun diye", presentation: "Pasaportu kapağın altında görünür bırak" },
  { name: "Aile büyüğüne ziyaret", opening: "Sohbeti uzatan küçük bir sofra hediyesi olarak", presentation: "Notu büyük ve okunaklı yaz" },
  { name: "İş arkadaşı jesti", opening: "Yoğun günün arasında kısa bir mola olsun diye", presentation: "Kutuyu abartısız, düzenli bir sunumla ver" },
  { name: "Öğretmene teşekkür", opening: "Emek için küçük bir teşekkür olarak", presentation: "Lot hikâyesini tek cümlelik kartla anlat" },
  { name: "Moral ziyareti", opening: "Yanında olduğumu söyleyen sade bir hediye olarak", presentation: "Sağlık vaadi kurmadan, yalnızca sofra diliyle ver" },
  { name: "Bayram ziyareti", opening: "Bayram sofrasına Elazığ'dan bir selam olarak", presentation: "Kutuyu geleneksel tatlı tabağının yanına ekle" },
  { name: "Şehir dışına gönderim", opening: "Memleket tadını uzaktan paylaşmak için", presentation: "Pasaport bağlantısını notun arkasına da ekle" },
  { name: "Kitap ve çay akşamı", opening: "Sessiz bir akşamın yanına küçük bir kase olsun diye", presentation: "İki yöntemi karşılaştırma etiketiyle sun" },
  { name: "Yeni iş kutlaması", opening: "Yeni başlangıca bereketli bir masa dileğiyle", presentation: "Kutuyu çalışma masasına uygun sade sun" },
  { name: "Aile sofrası", opening: "Aynı sofrada paylaşılsın diye", presentation: "Büyük gramajı servis kasesiyle aç" },
];

const GIFT_RECIPIENTS = [
  { name: "Yoğun tat seven", phrase: "yoğun ve yavaş tadımı seven damak için", tone: "Sıcak ve kısa" },
  { name: "Sunuma önem veren", phrase: "rengi ve düzeni önce gören göz için", tone: "Özenli ve sade" },
  { name: "Mutfakta deneyen", phrase: "hoşaf ve tatlıda denemeyi seven kişi için", tone: "Pratik ve davetkâr" },
  { name: "Çay sohbetçisi", phrase: "çay sohbetini uzatan küçük tabakları seven kişi için", tone: "Samimi" },
  { name: "Yeni tanışılan kişi", phrase: "ilk izlenimde abartısız bir jest arayan kişi için", tone: "Kibar ve kısa" },
  { name: "Kalabalık aile", phrase: "sofrada paylaşmayı seven kalabalık ev için", tone: "Cömert ve sıcak" },
  { name: "Hikâye seven", phrase: "ürünün nereden geldiğini okumayı seven kişi için", tone: "Anlatıcı" },
  { name: "Minimal hediye seven", phrase: "süsü az, anlamı net hediyeyi seven kişi için", tone: "Minimal" },
  { name: "Gurme meraklısı", phrase: "iki kurutma yöntemini karşılaştırmak isteyen kişi için", tone: "Merak uyandıran" },
  { name: "Klasik sofra seven", phrase: "klasik sofra düzenini seven kişi için", tone: "Geleneksel ve sade" },
];

const GIFT_CATALOG = [
  { productId: "cekirdek", productName: "Kayısı Çekirdeği İçi", sizeId: "c250", sizeLabel: "250 g", demoPrice: 210, budgetBand: "Küçük jest" },
  { productId: "islimli", productName: "İslimli Jumbo", sizeId: "i500", sizeLabel: "500 g", demoPrice: 340, budgetBand: "Tek kutu" },
  { productId: "gun-kurusu", productName: "Gün Kurusu", sizeId: "g500", sizeLabel: "500 g", demoPrice: 385, budgetBand: "Tek kutu" },
  { productId: "cekirdek", productName: "Kayısı Çekirdeği İçi", sizeId: "c500", sizeLabel: "500 g", demoPrice: 390, budgetBand: "Tek kutu" },
  { productId: "islimli", productName: "İslimli Jumbo", sizeId: "i1000", sizeLabel: "1 kg", demoPrice: 640, budgetBand: "Aile boyu" },
  { productId: "gun-kurusu", productName: "Gün Kurusu", sizeId: "g1000", sizeLabel: "1 kg", demoPrice: 720, budgetBand: "Aile boyu" },
  { productId: "hediye", productName: "Fırat Sergisi Kutusu", sizeId: "h1000", sizeLabel: "1 kg · 3 bölmeli", demoPrice: 890, budgetBand: "Özel sunum" },
];

const PAIRINGS = [
  "Yanına sade çay ve küçük bir tadım kasesi ekle.",
  "Kutuyu açmadan önce iki yöntemi anlatan kısa kartı göster.",
  "Hoşaf yapacaksa kişi başı ölçü kartını kutuya iliştir.",
  "Çekirdek bölmesini servis ederken ölçüyü ayrıca söyle.",
  "Pasaport bağlantısını hediye notunun altında paylaş.",
  "Kutunun lot kodunu fotoğraflayıp sonra yine aynı tadı aramasını kolaylaştır.",
];

const giftScenarios = GIFT_OCCASIONS.flatMap((occasion, occasionIndex) =>
  GIFT_RECIPIENTS.map((recipient, recipientIndex) => {
    const serial = occasionIndex * GIFT_RECIPIENTS.length + recipientIndex + 1;
    const catalog = GIFT_CATALOG[(occasionIndex * 2 + recipientIndex) % GIFT_CATALOG.length];
    return {
      id: `hediye-${String(serial).padStart(3, "0")}`,
      occasion: occasion.name,
      recipient: recipient.name,
      budgetBand: catalog.budgetBand,
      productId: catalog.productId,
      productName: catalog.productName,
      sizeId: catalog.sizeId,
      sizeLabel: catalog.sizeLabel,
      demoPrice: catalog.demoPrice,
      headline: `${occasion.name} için ${catalog.productName}`,
      noteTone: recipient.tone,
      noteTemplate: `${occasion.opening}, Baskil'den ${catalog.productName.toLocaleLowerCase("tr-TR")} getirdim. Bu seçim ${recipient.phrase} düşünüldü. Kutudaki lot pasaportunda bahçe ve kurutma yolu yazıyor; kodu sorgularsan hikâyesi açılır.`,
      presentation: occasion.presentation,
      pairing: PAIRINGS[serial % PAIRINGS.length],
      lotStoryAngle: catalog.productId === "hediye"
        ? "Üç lotu sırayla tattırıp her bölmenin pasaportunu ayrı göster."
        : "Tek lotu öne çıkar; parsel ve hasat haftasını notun altına yaz.",
      caution: catalog.productId === "cekirdek"
        ? "Çekirdek içinde günde birkaç adedi aşmama ve çocuklardan uzak tutma uyarısını görünür bırak."
        : "Demo fiyat ve lot kaydının temsilî olduğunu sunumda saklama.",
      tags: [occasion.name, recipient.name, catalog.budgetBand, catalog.productName],
    };
  })
);

await writeGenerated(
  "giftScenarios.ts",
  `
export interface GiftScenario {
  id: string;
  occasion: string;
  recipient: string;
  budgetBand: string;
  productId: string;
  productName: string;
  sizeId: string;
  sizeLabel: string;
  demoPrice: number;
  headline: string;
  noteTone: string;
  noteTemplate: string;
  presentation: string;
  pairing: string;
  lotStoryAngle: string;
  caution: string;
  tags: string[];
}

${arrayConst("GIFT_SCENARIOS", "GiftScenario", giftScenarios)}

export const GIFT_OCCASIONS: string[] = ${literalList(GIFT_OCCASIONS.map((item) => item.name))};
export const GIFT_RECIPIENTS: string[] = ${literalList(GIFT_RECIPIENTS.map((item) => item.name))};
export const GIFT_BUDGET_BANDS: string[] = ${literalList([...new Set(GIFT_CATALOG.map((item) => item.budgetBand))])};
`
);

/* ------------------------------------------------------------------ */
/* Öğrenme yolları                                                     */
/* ------------------------------------------------------------------ */

const LEARNING_TRACKS = [
  { name: "Yöntemi Tanı", focus: "Gün kurusu ile islimliyi renk üzerinden değil kullanım üzerinden ayırmak.", anchor: "#karsilastir", badge: "Yöntem Okuru" },
  { name: "Lotu Oku", focus: "Kutudaki kodu bahçe, hafta ve kurutma yoluna çevirmek.", anchor: "#lot-sorgula", badge: "Pasaport Okuru" },
  { name: "Dalından Kutuna", focus: "Hasat, sergi, patik ve eleme sırasını tek zincirde görmek.", anchor: "#surec", badge: "Süreç Takipçisi" },
  { name: "Bahçe Ritmi", focus: "52 hafta ve 365 günlük temsilî planda işlerin mevsimle nasıl değiştiğini görmek.", anchor: "#evren", badge: "Sezon Gözcüsü" },
  { name: "Mutfak Ölçüsü", focus: "Hoşaf ve servis kararlarını kişi sayısına göre hesaplamak.", anchor: "#mutfak", badge: "Ölçü Ustası" },
  { name: "Saklama ve Güvenlik", focus: "Ürünü doğru kapta korumak ve çekirdek ölçüsünü unutmamak.", anchor: "#sss", badge: "Dikkatli Saklayıcı" },
  { name: "Hediye Dili", focus: "Kutu, not ve lot hikâyesini abartmadan bir araya getirmek.", anchor: "#evren", badge: "Hediye Editörü" },
  { name: "Dürüst Demo", focus: "Temsilî kayıt ile doğrulanmış bilgiyi birbirinden ayırmak.", anchor: "#sss", badge: "Şeffaflık Bekçisi" },
  { name: "Çay Molası Kültürü", focus: "Radyo ve oyun katmanını ana akışı engellemeden kullanmak.", anchor: "#mola", badge: "Mola Rehberi" },
  { name: "Erişilebilir Sunum", focus: "Klavye, odak ve azaltılmış hareketle akışı herkes için açık tutmak.", anchor: "#top", badge: "Erişim Dostu" },
  { name: "Sepet Mantığı", focus: "Gramaj, demo fiyat ve ücretsiz kargo eşiğinin ilişkisini görmek.", anchor: "#urunler", badge: "Sepet Hesapçısı" },
  { name: "Jüriye Anlat", focus: "90 saniyede sorun, çözüm, imza akış ve dürüstlük sırasını korumak.", anchor: "#lotunu-kur", badge: "90 Saniye Anlatıcısı" },
];

const LESSON_ANGLES = [
  { suffix: "İlk bakış", practice: "İlgili bölümde tek ekran görüntüsüyle karar noktasını işaretle.", check: "Bu konuda ilk bakılacak işaret nedir?" },
  { suffix: "Yanlış bilinen", practice: "Aklına gelen ilk kestirme cevabı yaz ve sayfadaki ifadeyle karşılaştır.", check: "Hangi kestirme cevap bu konuda yetersiz kalır?" },
  { suffix: "Küçük deneme", practice: "Akışı tek ürün veya tek kodla baştan sona sessizce çalıştır.", check: "Denemeyi küçültmek hangi hatayı görünür kılar?" },
  { suffix: "Karşılaştırma", practice: "İki seçeneği aynı tablo başlıklarıyla yan yana yaz.", check: "Karşılaştırmada hangi başlık kararı değiştirir?" },
  { suffix: "Kayıt dili", practice: "Aynı bilgiyi lot pasaportuna sığacak tek cümleye çevir.", check: "Kısa kayıt cümlesinde hangi bilgi kaybolmamalıdır?" },
  { suffix: "Senaryo", practice: "Konuyu ilk kez alan, hediye eden ve jüriye anlatan kişi için ayrı düşün.", check: "Senaryo değişince hangi karar değişir?" },
  { suffix: "Hata yolu", practice: "Boş, hatalı veya eksik girişle sistemin cevabını gözlemle.", check: "Hata mesajı kullanıcıya hangi düzeltmeyi söylüyor?" },
  { suffix: "Ölçü", practice: "Kişi sayısı, gramaj veya süre değişince sonucu yeniden hesapla.", check: "Ölçek büyüyünce ilk değişen sayı hangisidir?" },
  { suffix: "Anlatım", practice: "Konuyu 20 saniyede, teknik terimi açıklayarak anlat.", check: "Dinleyiciye ilk açıklanması gereken terim hangisidir?" },
  { suffix: "Usta kontrolü", practice: "Dersi bitirmeden önce temsilî bilgi ile genel bilgiyi iki sütuna ayır.", check: "Bu derste temsilî olan bilgi hangisidir?" },
];

const learningLessons = LEARNING_TRACKS.flatMap((track, trackIndex) =>
  LESSON_ANGLES.map((angle, lessonIndex) => {
    const topic = KNOWLEDGE_TOPICS[(trackIndex * 3 + lessonIndex) % KNOWLEDGE_TOPICS.length];
    const serial = trackIndex * LESSON_ANGLES.length + lessonIndex + 1;
    return {
      id: `ders-${String(serial).padStart(3, "0")}`,
      track: track.name,
      level: lessonIndex < 4 ? "Başlangıç" : lessonIndex < 8 ? "Uygulama" : "Sunum",
      title: `${topic[0]} · ${angle.suffix}`,
      objective: `${topic[0]} konusunda karar verirken ${track.focus.toLocaleLowerCase("tr-TR")}`,
      lessonText: `${topic[3]} Bu derste odak şudur: ${track.focus} Bilgiyi kullanırken temsilî kayıt ile genel süreç bilgisini birbirine karıştırma.`,
      practiceTask: `${topic[4]} Ek alıştırma: ${angle.practice}`,
      checkQuestion: angle.check,
      checkAnswer: topic[2],
      anchor: track.anchor,
      estimatedMinutes: 3 + ((trackIndex + lessonIndex) % 7),
      badge: track.badge,
    };
  })
);

await writeGenerated(
  "learningPaths.ts",
  `
export type LearningLevel = "Başlangıç" | "Uygulama" | "Sunum";

export interface LearningLesson {
  id: string;
  track: string;
  level: LearningLevel;
  title: string;
  objective: string;
  lessonText: string;
  practiceTask: string;
  checkQuestion: string;
  checkAnswer: string;
  anchor: string;
  estimatedMinutes: number;
  badge: string;
}

${arrayConst("LEARNING_LESSONS", "LearningLesson", learningLessons)}

export const LEARNING_TRACKS: string[] = ${literalList(LEARNING_TRACKS.map((track) => track.name))};
export const LEARNING_LEVELS: LearningLevel[] = ["Başlangıç", "Uygulama", "Sunum"];

export function learningProgress(completedIds: string[]) {
  const completed = new Set(completedIds);
  const done = LEARNING_LESSONS.filter((lesson) => completed.has(lesson.id)).length;
  return {
    done,
    total: LEARNING_LESSONS.length,
    percent: LEARNING_LESSONS.length ? Math.round((done / LEARNING_LESSONS.length) * 100) : 0,
    badges: [...new Set(LEARNING_LESSONS.filter((lesson) => completed.has(lesson.id)).map((lesson) => lesson.badge))],
  };
}
`
);

await writeGenerated(
  "universeIndex.ts",
  `
export * from "./dailyJournal";
export * from "./giftScenarios";
export * from "./learningPaths";
export * from "./packingRuns";
export * from "./parcelProfiles";
export * from "./qualityChecks";
`
);

const total = dailyJournal.length + parcelProfiles.length + qualityChecks.length + packingRuns.length + giftScenarios.length + learningLessons.length;
console.log(`Patik Evreni temsilî kayıt toplamı: ${total}`);
