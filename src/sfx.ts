/**
 * Mini Web-Audio efektleri.
 *
 * Hiçbir ses dosyası yok: her efekt osilatör + zarf ile anında üretilir.
 * Böylece site çevrimdışı da tam çalışır, ek dosya boyutu artmaz.
 * Kullanıcı sesi açıp kapatabilir; tercih localStorage'da saklanır.
 */

export type SfxKind = "click" | "good" | "bad" | "tick" | "win" | "stamp" | "cut";

const STORAGE_KEY = "patik-ses-v1";

let ctx: AudioContext | null = null;
let enabled = true;

try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) enabled = stored === "1";
} catch {
  /* localStorage kapalı olabilir; varsayılan açık kalsın */
}

export function isSoundOn(): boolean {
  return enabled;
}

export function setSoundOn(next: boolean): void {
  enabled = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    /* yoksay */
  }
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    if (!ctx) ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

type Tone = { freq: number; to?: number; at: number; dur: number; type?: OscillatorType; gain?: number };

/** Tek bir perde: frekans başlangıçtan hedefe kayar, sonra söner. */
function blip(c: AudioContext, t: Tone) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = t.type ?? "sine";
  osc.frequency.setValueAtTime(t.freq, t.at);
  if (t.to) osc.frequency.exponentialRampToValueAtTime(Math.max(40, t.to), t.at + t.dur);
  const peak = t.gain ?? 0.06;
  gain.gain.setValueAtTime(0.0001, t.at);
  gain.gain.exponentialRampToValueAtTime(peak, t.at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t.at + t.dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t.at);
  osc.stop(t.at + t.dur + 0.02);
}

const RECIPES: Record<SfxKind, Tone[]> = {
  click: [{ freq: 520, to: 430, at: 0, dur: 0.07, type: "triangle", gain: 0.05 }],
  tick: [{ freq: 880, at: 0, dur: 0.03, type: "square", gain: 0.018 }],
  good: [
    { freq: 660, at: 0, dur: 0.1, type: "triangle", gain: 0.06 },
    { freq: 990, at: 0.07, dur: 0.14, type: "triangle", gain: 0.05 },
  ],
  bad: [
    { freq: 220, to: 110, at: 0, dur: 0.2, type: "sawtooth", gain: 0.045 },
  ],
  stamp: [
    { freq: 160, to: 70, at: 0, dur: 0.16, type: "square", gain: 0.06 },
    { freq: 900, at: 0.02, dur: 0.04, type: "square", gain: 0.03 },
  ],
  win: [
    { freq: 523, at: 0, dur: 0.12, type: "triangle", gain: 0.055 },
    { freq: 659, at: 0.1, dur: 0.12, type: "triangle", gain: 0.055 },
    { freq: 784, at: 0.2, dur: 0.12, type: "triangle", gain: 0.055 },
    { freq: 1046, at: 0.3, dur: 0.24, type: "triangle", gain: 0.05 },
  ],
  /* Bölüm kesme sesi: hızlı düşen testere — bir projektör perdesinin
     geçişine benzer. Çok kısık tutulur; sayfa okunur kalsın. */
  cut: [
    { freq: 1400, to: 220, at: 0, dur: 0.16, type: "sawtooth", gain: 0.028 },
    { freq: 2600, at: 0, dur: 0.018, type: "square", gain: 0.01 },
  ],
};

/** Efekti çalar. Ses kapalıysa veya tarayıcı desteklemiyorsa sessizce geçer. */
export function sfx(kind: SfxKind): void {
  if (!enabled) return;
  const c = audio();
  if (!c) return;
  const recipe = RECIPES[kind];
  if (!recipe) return;
  const t0 = c.currentTime + 0.001;
  recipe.forEach((tone) => blip(c, { ...tone, at: t0 + tone.at }));
}
