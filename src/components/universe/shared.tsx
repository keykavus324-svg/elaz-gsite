import { useEffect, useState, type ReactNode } from "react";

export const universeNumber = new Intl.NumberFormat("tr-TR");

const SEARCH_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

export function normalizeUniverseSearch(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .split("")
    .map((char) => SEARCH_MAP[char] ?? char)
    .join("");
}

export function universeMatches(haystack: string, needle: string): boolean {
  const query = normalizeUniverseSearch(needle.trim());
  if (!query) return true;
  return normalizeUniverseSearch(haystack).includes(query);
}

export function formatUniverseKg(value: number): string {
  return `${universeNumber.format(value)} kg`;
}

export function percent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function UniField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="uni-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function UniEmpty({ title, text }: { title: string; text: string }) {
  return (
    <div className="uni-empty" role="status">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

export function UniStat({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <div className="uni-stat">
      <strong>{value}</strong>
      <span>{label}</span>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function UniResultMeta({ shown, total, unit }: { shown: number; total: number; unit: string }) {
  return (
    <p className="uni-result-meta" aria-live="polite">
      {universeNumber.format(total)} kayıt içinden {universeNumber.format(shown)} {unit} gösteriliyor.
    </p>
  );
}

export function UniPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const start = Math.max(0, Math.min(page - 2, Math.max(0, totalPages - 5)));
  const visible = Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index);

  return (
    <nav className="uni-pagination" aria-label="Evren sayfalama">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 0}>
        ← Önceki
      </button>
      {visible.map((item) => (
        <button
          key={item}
          type="button"
          className={item === page ? "is-active" : ""}
          aria-current={item === page ? "page" : undefined}
          onClick={() => onChange(item)}
        >
          {item + 1}
        </button>
      ))}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}>
        Sonraki →
      </button>
    </nav>
  );
}

export function readStringList(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function useStoredStringList(key: string) {
  const [items, setItems] = useState<string[]>(() => readStringList(key));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(items));
    } catch {
      /* Depolama kapalıysa ilerleme yalnızca oturumda tutulur. */
    }
  }, [items, key]);

  function toggle(id: string) {
    setItems((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function clear() {
    setItems([]);
  }

  return { items, setItems, toggle, clear };
}

export function UniBar({
  label,
  value,
  max,
  suffix,
  tone = "sun",
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
  tone?: "sun" | "leaf" | "river" | "pit";
}) {
  const width = max > 0 ? Math.max(3, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="uni-bar-row">
      <div>
        <span>{label}</span>
        <strong>{universeNumber.format(value)} {suffix}</strong>
      </div>
      <div className="uni-bar-track" aria-hidden="true">
        <span className={`uni-bar-fill uni-bar-fill--${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
