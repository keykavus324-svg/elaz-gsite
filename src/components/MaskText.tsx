import { useEffect, useRef, type ReactNode } from "react";

/**
 * Satır satır maske açılışı.
 *
 * Her satır, kendi taşan kutusu içinde aşağıdan yukarı kayar; satırlar
 * kademeli olarak açılır. Bu, "yazı ekranda beliriyor" hissini verir —
 * kutu görünür olduğunda tetiklenir, geri alınmaz.
 */
export default function MaskText({
  lines,
  className = "",
  as: Tag = "h2",
}: {
  lines: ReactNode[];
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref as never} className={`mask-text ${className}`.trim()}>
      {lines.map((line, i) => (
        <span className="mask-line" key={i} style={{ "--i": i } as React.CSSProperties}>
          <span className="mask-line__in">{line}</span>
        </span>
      ))}
    </Tag>
  );
}
