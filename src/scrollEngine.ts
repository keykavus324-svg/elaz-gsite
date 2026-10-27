import { useEffect, useRef, useState, type RefObject } from "react";

/* ==================================================================
   TEK KAYDIRMA MOTORU
   ------------------------------------------------------------------
   Sayfadaki bütün kaydırmaya bağlı efektler (paralaks, film karesi,
   sayaçlar, kenar çizgileri) bu tek döngüden beslenir. Her efekt
   kendi scroll dinleyicisini açmaz; böylece dinleyici sayısı sabit
   kalır ve uzun sayfada kaydırma akıcı olur.

   Döngü yalnızca kaydırma/resize sırasında çalışır; boşta beklerken
   kare üretilmez. Ölçümler (getBoundingClientRect) kare başına bir
   kez okunur ve toplu işlenir — düzen (layout) tek seferde çöker.
   ================================================================== */

export type FrameHandler = (viewportHeight: number) => void;

const handlers = new Set<FrameHandler>();
let scheduled = false;
let bound = false;

/** Sonraki animasyon karesinde bütün aktörleri çalıştırır. */
export function scheduleFrame(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(runFrame);
}

function runFrame(): void {
  scheduled = false;
  const vh = window.innerHeight;
  for (const handler of handlers) {
    try {
      handler(vh);
    } catch {
      // Bir aktör hata verirse diğerleri çalışmaya devam etsin.
    }
  }
}

/** Aktör kaydıt eder; temizleme fonksiyonu döndürür. */
export function onFrame(handler: FrameHandler): () => void {
  handlers.add(handler);
  scheduleFrame();
  return () => {
    handlers.delete(handler);
  };
}

function bindWindow(): void {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", scheduleFrame, { passive: true });
  window.addEventListener("resize", scheduleFrame, { passive: true });
  window.addEventListener("orientationchange", scheduleFrame, { passive: true });
}

/** Motoru başlatır (App seviyesinde bir kez). */
export function startScrollEngine(): void {
  if (typeof window === "undefined") return;
  bindWindow();
  scheduleFrame();
}

/* ------------------------------------------------------------------
   React bağlantıları
   ------------------------------------------------------------------ */

/** Kare başına verilen işlevi çalıştırır. */
export function useScrollFrame(handler: FrameHandler, deps: unknown[] = []): void {
  useEffect(() => {
    bindWindow();
    return onFrame(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Hareket azaltma tercihi. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(Boolean(mq?.matches));
    sync();
    mq?.addEventListener?.("change", sync);
    return () => mq?.removeEventListener?.("change", sync);
  }, []);
  return reduced;
}

/** Sistem tercihi anlık okumak için (effect dışında da kullanılabilir). */
export function reducedMotionNow(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

/* ------------------------------------------------------------------
   Öğe ilerlemesi
   ------------------------------------------------------------------ */

export type ProgressOptions = {
  /** Sayfa üzerindeki konumdan başlayan kaydırma payı (0..1). */
  from?: number;
  /** Bittiği yer. */
  to?: number;
  /** İlerleme eğrisi: "linear" | "smooth". */
  ease?: "linear" | "smooth";
};

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/**
 * Bir öğenin sayfa içindeki konumuna göre 0..1 ilerleme verir.
 * `from`/`to` ile ilerlemenin hangi dilimde hesaplanacağı seçilir.
 */
export function useElementProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (progress: number, rect: DOMRect, viewportHeight: number) => void,
  options: ProgressOptions = {},
): void {
  const { from = 0, to = 1, ease = "linear" } = options;
  useScrollFrame(
    (vh) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.height === 0 && rect.width === 0) return;

      // Belgenin üstünden itibaren konum.
      const docTop = rect.top + window.scrollY;
      const travel = Math.max(1, el.offsetHeight - vh);
      const passed = (window.scrollY - docTop) / travel;

      // Bir "yapışkan" (sticky) bölümde ilerleme, bölüm viewport'ta
      // sabitlendiği andan itibaren ilerlemeli: bunun için
      // "yapışkan bölüm" uzunluğunu kullanıyoruz.
      const raw = ease === "smooth" ? smoothstep(passed) : passed;
      const span = Math.max(0.0001, to - from);
      const progress = Math.min(1, Math.max(0, (raw - from) / span));
      onProgress(progress, rect, vh);
    },
    [from, to, ease],
  );
}

/* ------------------------------------------------------------------
   Paralaks ve kamera taraması
   ------------------------------------------------------------------
   Sayfadaki [data-parallax] taşıyan öğeleri bulur ve her karede
   görünür alandaki ilerlemelerine göre kaydırır. Tarama, sayfaya
   yeni bölüm eklendiğinde (tembel yüklenen Atlas/Evren) otomatik
   tekrarlanır.

   [data-push] taşıyan öğeler ise "kamera itişi" yapar: görünür
   alana girerken hafifçe büyük (yakın plan) başlar, ekranı geçerken
   ölçeğini geri verir — bir fotoğrafın Ken Burns etkisi gibi.
   ------------------------------------------------------------------ */

export function useParallaxScan(): void {
  useEffect(() => {
    let items: HTMLElement[] = [];
    let timer = 0;

    const scan = () => {
      items = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax], [data-push]"));
    };
    scan();

    const mo = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(scan, 250);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const off = onFrame((vh) => {
      for (const el of items) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -240 || rect.top > vh + 240) continue;
        const p = (vh - rect.top) / (vh + rect.height);
        if (el.dataset.parallax !== undefined) {
          const factor = Number(el.dataset.parallax ?? "0.18");
          const py = (p - 0.5) * factor * 100;
          el.style.setProperty("--py", `${py.toFixed(2)}px`);
        }
        if (el.dataset.push !== undefined) {
          const amount = Number(el.dataset.push ?? "0.07");
          // 0 = ekrana yeni girdi, 1 = ekrandan çıktı.
          const t = Math.min(1, Math.max(0, p));
          const scale = 1 + amount * t;
          el.style.setProperty("--push", scale.toFixed(4));
        }
      }
    });

    return () => {
      off();
      mo.disconnect();
      window.clearTimeout(timer);
    };
  }, []);
}

/* ------------------------------------------------------------------
   Bölüm başlıklarının perde açılışı
   ------------------------------------------------------------------
   Sayfadaki ".section__head" öğeleri görünür alana girdiğinde
   "is-in" sınıfını alır; CSS başlığı alttan yukarı siler gibi açar.
   JavaScript çalışmazsa başlıklar gizli kalmaz: gizli durum yalnızca
   ".has-js" sınıfı varken uygulanır.
   ------------------------------------------------------------------ */

export function useRevealScan(): void {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-js");

    const selector = ".section__head, .bant__title, [data-reveal]";
    let items: HTMLElement[] = [];

    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    const scan = () => {
      items = Array.from(document.querySelectorAll<HTMLElement>(selector));
      for (const el of items) io.observe(el);
    };
    scan();

    const mo = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(scan, 250);
    });
    let timer = 0;
    mo.observe(document.body, { childList: true, subtree: true });

    // Güvenlik ağı: dört saniye içinde açılmazsa hepsi açılır.
    const safety = window.setTimeout(() => {
      for (const el of items) el.classList.add("is-in");
    }, 4000);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(timer);
      window.clearTimeout(safety);
    };
  }, []);
}
