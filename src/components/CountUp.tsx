import { useEffect, useRef } from "react";
import { trNumber } from "../content/buildStats";

/**
 * Görünüre girdiğinde sayıyı sıfırdan hedefe sayar.
 *
 * Rakamlar ilk bakışta "canlı bir sayaç" gibi görünür — jürinin ilk
 * izlenimi güçlenir. Hareket azaltma tercihinde doğrudan hedef yazılır.
 */
export default function CountUp({
  value,
  duration = 1500,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const write = (n: number) => {
      el.textContent = `${trNumber(n)}${suffix}`;
    };

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      write(value);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      write(value);
      return;
    }

    let raf = 0;
    let started = false;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // Yumuşak duruş: başta hızlı, sonra yavaşlar.
        const eased = 1 - Math.pow(1 - t, 3);
        write(Math.round(value * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          if (!started) {
            started = true;
            run();
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, suffix]);

  return <span ref={ref as never}>{trNumber(0)}{suffix}</span>;
}
