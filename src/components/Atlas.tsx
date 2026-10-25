import { useEffect, useMemo, useState, type ReactNode } from "react";
import "../atlas.css";
import {
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  KNOWLEDGE_CARDS,
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_SCENARIOS,
  LEDGER_METHOD_FILTERS,
  LEDGER_PARCELS,
  LOT_LEDGER,
  QUIZ_BANK,
  QUIZ_CATEGORIES,
  QUIZ_DIFFICULTIES,
  RECIPES,
  RECIPE_ACCENT_NAMES,
  RECIPE_BASE_NAMES,
  RECIPE_PRODUCTS,
  SEASON_CALENDAR,
  SEASON_MONTHS,
  isQuizAnswerCorrect,
  seasonWeekLabel,
  summarizeLedger,
  totalRecipeMinutes,
  type GlossaryEntry,
  type KnowledgeCard,
  type LedgerLot,
  type QuizQuestion,
  type RecipeCard,
  type SeasonWeek,
} from "../content";

/* ================================================================== */
/* PATİK ATLASI                                                        */
/*                                                                     */
/* 811 temsilî kayıt; gerçek üretici verisi değildir. Bu bölüm,        */
/* kanonik 3 demo lotun yerine geçmez. Geniş defter, izlenebilirlik    */
/* fikrinin ölçeklenince nasıl aranabilir hâle geleceğini gösterir.   */
/* ================================================================== */

type AtlasTab = "lotlar" | "takvim" | "sozluk" | "tarifler" | "kartlar" | "sorular";

const TABS: Array<{
  id: AtlasTab;
  label: string;
  count: number;
  description: string;
}> = [
  {
    id: "lotlar",
    label: "Lot Defteri",
    count: LOT_LEDGER.length,
    description: "Parsel, yöntem ve hasat haftasına göre temsilî operasyon satırları",
  },
  {
    id: "takvim",
    label: "52 Hafta",
    count: SEASON_CALENDAR.length,
    description: "Bahçeden mutfağa yıl boyu iş ve kayıt ritmi",
  },
  {
    id: "sozluk",
    label: "Sözlük",
    count: GLOSSARY.length,
    description: "Patik, çir, sergi ve lot dili için hızlı kavram rehberi",
  },
  {
    id: "tarifler",
    label: "Tarifler",
    count: RECIPES.length,
    description: "12 temel kullanım, 8 aroma aksanıyla aranabilir tarif kartları",
  },
  {
    id: "kartlar",
    label: "Bilgi Kartları",
    count: KNOWLEDGE_CARDS.length,
    description: "Senaryoya göre seçim, saklama, hediye ve sunum notları",
  },
  {
    id: "sorular",
    label: "Soru Bankası",
    count: QUIZ_BANK.length,
    description: "Çalışma modunda açıklamalı site ve süreç soruları",
  },
];

const TOTAL_RECORDS = TABS.reduce((sum, tab) => sum + tab.count, 0);
const numberFormatter = new Intl.NumberFormat("tr-TR");

function normalizeSearch(value: string): string {
  const map: Record<string, string> = {
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
  return value
    .toLocaleLowerCase("tr-TR")
    .split("")
    .map((char) => map[char] ?? char)
    .join("");
}

function textMatches(haystack: string, needle: string): boolean {
  const query = normalizeSearch(needle.trim());
  if (!query) return true;
  return normalizeSearch(haystack).includes(query);
}

function formatKg(value: number): string {
  return `${numberFormatter.format(value)} kg`;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="atlas-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="atlas-empty" role="status">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function ResultMeta({ shown, total, label }: { shown: number; total: number; label: string }) {
  return (
    <p className="atlas-result-meta" aria-live="polite">
      {numberFormatter.format(total)} kayıt içinde {numberFormatter.format(shown)} {label} listeleniyor.
    </p>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  const visible = Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index);

  return (
    <nav className="atlas-pagination" aria-label="Sayfalama">
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

function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem("patik-atlas-bookmarks");
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("patik-atlas-bookmarks", JSON.stringify(bookmarks));
    } catch {
      /* Yerel depolama kapalıysa atlas yine çalışır. */
    }
  }, [bookmarks]);

  function toggle(code: string) {
    setBookmarks((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code]
    );
  }

  return { bookmarks, toggle };
}

/* ------------------------------ Lot defteri ------------------------------ */

type LotSort = "code" | "week" | "output" | "boxes";

function LotLedgerPanel() {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("all");
  const [parcel, setParcel] = useState("all");
  const [sort, setSort] = useState<LotSort>("code");
  const [page, setPage] = useState(0);
  const [selectedCode, setSelectedCode] = useState(LOT_LEDGER[0]?.code ?? "");
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const { bookmarks, toggle } = useBookmarks();

  const filtered = useMemo(() => {
    const result = LOT_LEDGER.filter((lot) => {
      if (method !== "all" && lot.method !== method) return false;
      if (parcel !== "all" && lot.parcel !== parcel) return false;
      if (onlyBookmarks && !bookmarks.includes(lot.code)) return false;
      return textMatches(
        [lot.code, lot.product, lot.methodLabel, lot.parcel, lot.location, lot.grade, lot.status, lot.harvestWindow].join(" "),
        query
      );
    });

    result.sort((a, b) => {
      if (sort === "week") return a.harvestWeek - b.harvestWeek || a.code.localeCompare(b.code);
      if (sort === "output") return b.outputKg - a.outputKg;
      if (sort === "boxes") return b.boxCount - a.boxCount;
      return a.code.localeCompare(b.code, "tr-TR");
    });
    return result;
  }, [bookmarks, method, onlyBookmarks, parcel, query, sort]);

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const selected: LedgerLot | undefined = filtered.find((lot) => lot.code === selectedCode) ?? visible[0] ?? filtered[0];
  const summary = summarizeLedger(filtered);

  function resetPageAnd<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  return (
    <div className="atlas-panel">
      <div className="atlas-toolbar atlas-toolbar--lots">
        <Field label="Lot, parsel veya ürün ara">
          <input
            type="search"
            value={query}
            onChange={(event) => resetPageAnd(setQuery)(event.target.value)}
            placeholder="Örn. PT-26-287 veya Gölyaka"
          />
        </Field>
        <Field label="Yöntem">
          <select value={method} onChange={(event) => resetPageAnd(setMethod)(event.target.value)}>
            {LEDGER_METHOD_FILTERS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Parsel">
          <select value={parcel} onChange={(event) => resetPageAnd(setParcel)(event.target.value)}>
            <option value="all">Tüm parseller</option>
            {LEDGER_PARCELS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Sıralama">
          <select value={sort} onChange={(event) => resetPageAnd(setSort)(event.target.value as LotSort)}>
            <option value="code">Kod sırası</option>
            <option value="week">Hasat haftası</option>
            <option value="output">Çıktı miktarı</option>
            <option value="boxes">Kutu adedi</option>
          </select>
        </Field>
        <label className="atlas-check">
          <input
            type="checkbox"
            checked={onlyBookmarks}
            onChange={(event) => {
              setOnlyBookmarks(event.target.checked);
              setPage(0);
            }}
          />
          Yalnızca işaretlediklerim ({bookmarks.length})
        </label>
      </div>

      <div className="atlas-summary" aria-label="Filtrelenen lot özeti">
        <div><strong>{numberFormatter.format(summary.count)}</strong><span>lot satırı</span></div>
        <div><strong>{formatKg(summary.inputKg)}</strong><span>temsilî girdi</span></div>
        <div><strong>{formatKg(summary.outputKg)}</strong><span>temsilî çıktı</span></div>
        <div><strong>{numberFormatter.format(summary.boxCount)}</strong><span>kutu karşılığı</span></div>
      </div>

      <ResultMeta shown={visible.length} total={filtered.length} label="lot bu sayfada" />

      {filtered.length === 0 ? (
        <EmptyState title="Bu filtreyle lot bulunamadı" text="Arama terimini kısalt veya yöntem/parsel filtresini sıfırla." />
      ) : (
        <div className="atlas-split">
          <div>
            <div className="atlas-card-grid atlas-card-grid--lots">
              {visible.map((lot) => {
                const isSelected = selected?.code === lot.code;
                const isBookmarked = bookmarks.includes(lot.code);
                return (
                  <article key={lot.code} className={`atlas-card atlas-lot-card${isSelected ? " is-selected" : ""}`}>
                    <div className="atlas-card__topline">
                      <span>{lot.code}</span>
                      <button
                        type="button"
                        className="atlas-bookmark"
                        onClick={() => toggle(lot.code)}
                        aria-pressed={isBookmarked}
                        aria-label={`${lot.code} kaydını ${isBookmarked ? "işaretlerden kaldır" : "işaretle"}`}
                      >
                        {isBookmarked ? "★" : "☆"}
                      </button>
                    </div>
                    <h3>{lot.product}</h3>
                    <p>{lot.parcel}</p>
                    <dl className="atlas-mini-dl">
                      <div><dt>Hasat</dt><dd>{lot.harvestWeek}. hafta</dd></div>
                      <div><dt>Çıktı</dt><dd>{formatKg(lot.outputKg)}</dd></div>
                      <div><dt>Kutu</dt><dd>{lot.boxCount} × {lot.boxSize}</dd></div>
                    </dl>
                    <button type="button" className="btn btn--small btn--ghost" onClick={() => setSelectedCode(lot.code)}>
                      Ayrıntıyı gör
                    </button>
                  </article>
                );
              })}
            </div>
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>

          {selected && (
            <aside className="atlas-detail" aria-labelledby="atlas-lot-detail-title">
              <p className="atlas-detail__kicker">Temsilî lot ayrıntısı</p>
              <h3 id="atlas-lot-detail-title">{selected.code} · {selected.product}</h3>
              <p>{selected.parcel} — {selected.location}</p>
              <dl className="atlas-detail-dl">
                <div><dt>Yöntem</dt><dd>{selected.methodLabel}</dd></div>
                <div><dt>Hasat penceresi</dt><dd>{selected.harvestWindow} ({selected.harvestWeek}. hafta)</dd></div>
                <div><dt>Sergi / patik</dt><dd>{selected.sergiDays} gün sergi · patikte +{selected.patikDayOffset}. gün</dd></div>
                <div><dt>İslim süresi</dt><dd>{selected.islimHours === 0 ? "Uygulanmadı" : `${selected.islimHours} saat`}</dd></div>
                <div><dt>Eleme</dt><dd>{selected.grade} · {selected.dryness}</dd></div>
                <div><dt>Durum</dt><dd>{selected.status}</dd></div>
                <div><dt>Girdi → çıktı</dt><dd>{formatKg(selected.inputKg)} → {formatKg(selected.outputKg)}</dd></div>
              </dl>
              <h4>İz adımları</h4>
              <ol>{selected.traceSteps.map((step) => <li key={step}>{step}</li>)}</ol>
              <h4>Kalite kontrolleri</h4>
              <ul>{selected.qualityChecks.map((step) => <li key={step}>{step}</li>)}</ul>
              <p className="atlas-note"><strong>Eleme notu:</strong> {selected.sortingNote}</p>
              <p className="atlas-note"><strong>Sezon notu:</strong> {selected.seasonNote}</p>
              <p className="atlas-note"><strong>Saklama:</strong> {selected.storageNote}</p>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ 52 hafta ------------------------------ */

function SeasonPanel() {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("all");
  const [risk, setRisk] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(29);

  const filtered = useMemo(
    () =>
      SEASON_CALENDAR.filter((week) => {
        if (month !== "all" && week.month !== month) return false;
        if (risk !== "all" && week.riskLevel !== risk) return false;
        return textMatches(
          [week.month, week.phase, week.title, week.focus, ...week.fieldTasks, ...week.workshopTasks].join(" "),
          query
        );
      }),
    [month, query, risk]
  );

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const selected: SeasonWeek | undefined = filtered.find((week) => week.week === selectedWeek) ?? visible[0] ?? filtered[0];

  return (
    <div className="atlas-panel">
      <div className="atlas-toolbar">
        <Field label="Hafta, iş veya aşama ara">
          <input
            type="search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(0); }}
            placeholder="Örn. patik, budama, kayıt"
          />
        </Field>
        <Field label="Ay">
          <select value={month} onChange={(event) => { setMonth(event.target.value); setPage(0); }}>
            <option value="all">Tüm aylar</option>
            {SEASON_MONTHS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Risk düzeyi">
          <select value={risk} onChange={(event) => { setRisk(event.target.value); setPage(0); }}>
            <option value="all">Tümü</option>
            <option value="Düşük">Düşük</option>
            <option value="Orta">Orta</option>
            <option value="Yüksek">Yüksek</option>
          </select>
        </Field>
      </div>

      <ResultMeta shown={visible.length} total={filtered.length} label="hafta bu sayfada" />

      {filtered.length === 0 ? (
        <EmptyState title="Hafta bulunamadı" text="Ay veya risk filtresini genişleterek tekrar dene." />
      ) : (
        <div className="atlas-split">
          <div>
            <div className="atlas-card-grid atlas-card-grid--weeks">
              {visible.map((week) => (
                <article key={week.week} className={`atlas-card${selected?.week === week.week ? " is-selected" : ""}`}>
                  <div className="atlas-card__topline"><span>{seasonWeekLabel(week)}</span><em>{week.riskLevel} risk</em></div>
                  <h3>{week.title}</h3>
                  <p>{week.focus}</p>
                  <p className="atlas-card__hint">{week.fieldTasks[0]}</p>
                  <button type="button" className="btn btn--small btn--ghost" onClick={() => setSelectedWeek(week.week)}>
                    Haftayı aç
                  </button>
                </article>
              ))}
            </div>
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>

          {selected && (
            <aside className="atlas-detail" aria-labelledby="atlas-week-detail-title">
              <p className="atlas-detail__kicker">{seasonWeekLabel(selected)} · {selected.phase}</p>
              <h3 id="atlas-week-detail-title">{selected.title}</h3>
              <p>{selected.focus}</p>
              <h4>Bahçede</h4>
              <ul>{selected.fieldTasks.map((task) => <li key={task}>{task}</li>)}</ul>
              <h4>Atölyede</h4>
              <ul>{selected.workshopTasks.map((task) => <li key={task}>{task}</li>)}</ul>
              <h4>Kayıt kontrolleri</h4>
              <ul>{selected.recordChecks.map((task) => <li key={task}>{task}</li>)}</ul>
              <p className="atlas-note"><strong>Mutfak:</strong> {selected.kitchenNote}</p>
              <p className="atlas-note"><strong>Dikkat:</strong> {selected.watchout}</p>
              <p className="atlas-note"><strong>İçerik işi:</strong> {selected.editorialTask}</p>
              <p className="atlas-note"><strong>Demo kontrolü:</strong> {selected.demoCheck}</p>
            </aside>
          )}
        </div>
      )}
      <p className="atlas-footnote">Bu takvim temsilî bir çalışma ritmidir; gerçek sezonda her tarih hava ve parsel gözlemiyle kayar.</p>
    </div>
  );
}

/* ------------------------------ Sözlük ------------------------------ */

function GlossaryPanel() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState("patik");

  const filtered = useMemo(
    () =>
      GLOSSARY.filter((entry) => {
        if (category !== "all" && entry.category !== category) return false;
        return textMatches([entry.term, entry.definition, entry.category, entry.relatedTerm].join(" "), query);
      }),
    [category, query]
  );

  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const selected: GlossaryEntry | undefined = filtered.find((entry) => entry.slug === selectedSlug) ?? visible[0] ?? filtered[0];
  const related = selected ? GLOSSARY.find((entry) => entry.term === selected.relatedTerm) : undefined;

  function openRelated() {
    if (!related) return;
    setCategory(related.category);
    setQuery(related.term);
    setSelectedSlug(related.slug);
    setPage(0);
  }

  return (
    <div className="atlas-panel">
      <div className="atlas-toolbar">
        <Field label="Kavram ara">
          <input
            type="search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(0); }}
            placeholder="Örn. patik, çir, izlenebilirlik"
          />
        </Field>
        <Field label="Kategori">
          <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(0); }}>
            <option value="all">Tüm kategoriler</option>
            {GLOSSARY_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </Field>
      </div>

      <ResultMeta shown={visible.length} total={filtered.length} label="kavram bu sayfada" />

      {filtered.length === 0 ? (
        <EmptyState title="Kavram bulunamadı" text="Türkçe karakter kullanmadan da arayabilirsin; örneğin 'patik' veya 'cir'." />
      ) : (
        <div className="atlas-split atlas-split--detail-first">
          {selected && (
            <aside className="atlas-detail" aria-labelledby="atlas-term-detail-title">
              <p className="atlas-detail__kicker">{selected.category}</p>
              <h3 id="atlas-term-detail-title">{selected.term}</h3>
              <p className="atlas-definition">{selected.definition}</p>
              <p className="atlas-note"><strong>Patik'te:</strong> {selected.patikContext}</p>
              <p className="atlas-note"><strong>Bakılacak yer:</strong> {selected.lookFor}</p>
              <p className="atlas-note"><strong>İlişkili kavram:</strong> {selected.relatedTerm}</p>
              {related && (
                <button type="button" className="btn btn--small btn--primary" onClick={openRelated}>
                  İlişkili kavrama git
                </button>
              )}
            </aside>
          )}

          <div>
            <div className="atlas-term-grid">
              {visible.map((entry) => (
                <button
                  key={entry.slug}
                  type="button"
                  className={`atlas-term${selected?.slug === entry.slug ? " is-selected" : ""}`}
                  onClick={() => setSelectedSlug(entry.slug)}
                  aria-pressed={selected?.slug === entry.slug}
                >
                  <strong>{entry.term}</strong>
                  <span>{entry.definition}</span>
                </button>
              ))}
            </div>
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Tarifler ------------------------------ */

function RecipesPanel() {
  const [query, setQuery] = useState("");
  const [base, setBase] = useState("all");
  const [accent, setAccent] = useState("all");
  const [product, setProduct] = useState("all");
  const [maxMinutes, setMaxMinutes] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(RECIPES[0]?.id ?? "");
  const [scale, setScale] = useState(1);

  const filtered = useMemo(
    () =>
      RECIPES.filter((recipe) => {
        if (base !== "all" && recipe.base !== base) return false;
        if (accent !== "all" && recipe.accent !== accent) return false;
        if (product !== "all" && recipe.product !== product) return false;
        if (maxMinutes !== "all" && totalRecipeMinutes(recipe) > Number(maxMinutes)) return false;
        return textMatches([recipe.title, recipe.product, ...recipe.ingredients, ...recipe.tags].join(" "), query);
      }),
    [accent, base, maxMinutes, product, query]
  );

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const selected: RecipeCard | undefined = filtered.find((recipe) => recipe.id === selectedId) ?? visible[0] ?? filtered[0];

  function chooseRecipe(recipe: RecipeCard) {
    setSelectedId(recipe.id);
    setScale(1);
  }

  return (
    <div className="atlas-panel">
      <div className="atlas-toolbar atlas-toolbar--recipes">
        <Field label="Tarif veya malzeme ara">
          <input
            type="search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(0); }}
            placeholder="Örn. hoşaf, yoğurt, tarçın"
          />
        </Field>
        <Field label="Temel kullanım">
          <select value={base} onChange={(event) => { setBase(event.target.value); setPage(0); }}>
            <option value="all">Tümü</option>
            {RECIPE_BASE_NAMES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Aroma aksanı">
          <select value={accent} onChange={(event) => { setAccent(event.target.value); setPage(0); }}>
            <option value="all">Tümü</option>
            {RECIPE_ACCENT_NAMES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Ürün">
          <select value={product} onChange={(event) => { setProduct(event.target.value); setPage(0); }}>
            <option value="all">Tümü</option>
            {RECIPE_PRODUCTS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Toplam süre">
          <select value={maxMinutes} onChange={(event) => { setMaxMinutes(event.target.value); setPage(0); }}>
            <option value="all">Fark etmez</option>
            <option value="15">15 dakika ve altı</option>
            <option value="30">30 dakika ve altı</option>
            <option value="60">60 dakika ve altı</option>
          </select>
        </Field>
      </div>

      <ResultMeta shown={visible.length} total={filtered.length} label="tarif bu sayfada" />

      {filtered.length === 0 ? (
        <EmptyState title="Tarif bulunamadı" text="Aroma veya süre filtresini gevşet; her temel kartın sekiz aksanı vardır." />
      ) : (
        <div className="atlas-split">
          <div>
            <div className="atlas-card-grid atlas-card-grid--recipes">
              {visible.map((recipe) => (
                <article key={recipe.id} className={`atlas-card${selected?.id === recipe.id ? " is-selected" : ""}`}>
                  <div className="atlas-card__topline"><span>{recipe.product}</span><em>{totalRecipeMinutes(recipe)} dk</em></div>
                  <h3>{recipe.title}</h3>
                  <p>{recipe.texture}</p>
                  <div className="atlas-tags">{recipe.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
                  <button type="button" className="btn btn--small btn--ghost" onClick={() => chooseRecipe(recipe)}>
                    Tarifi aç
                  </button>
                </article>
              ))}
            </div>
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>

          {selected && (
            <aside className="atlas-detail" aria-labelledby="atlas-recipe-detail-title">
              <p className="atlas-detail__kicker">{selected.base} · {selected.accent}</p>
              <h3 id="atlas-recipe-detail-title">{selected.title}</h3>
              <p>{selected.texture}</p>
              <div className="atlas-scale" aria-label="Porsiyon ölçeği">
                <span>Ölçek:</span>
                {[0.5, 1, 2].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={scale === value ? "is-active" : ""}
                    onClick={() => setScale(value)}
                    aria-pressed={scale === value}
                  >
                    {value}×
                  </button>
                ))}
                <strong>{Math.max(1, Math.round(selected.servings * scale))} kişilik</strong>
              </div>
              <p className="atlas-mutedline">Hazırlık {selected.prepMinutes} dk · Pişirme {selected.cookMinutes} dk</p>
              <h4>Malzemeler</h4>
              <ul>{selected.ingredients.map((item) => <li key={item}>{item}</li>)}</ul>
              <h4>Adımlar</h4>
              <ol>{selected.steps.map((step) => <li key={step}>{step}</li>)}</ol>
              <p className="atlas-note"><strong>Servis:</strong> {selected.servingNote}</p>
              <p className="atlas-note"><strong>Aksan:</strong> {selected.accentNote}</p>
              <p className="atlas-note"><strong>Saklama:</strong> {selected.storageNote}</p>
              <p className="atlas-note"><strong>Güvenlik:</strong> {selected.safetyNote}</p>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Bilgi kartları ------------------------------ */

function KnowledgePanel() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [scenario, setScenario] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      KNOWLEDGE_CARDS.filter((card) => {
        if (category !== "all" && card.category !== category) return false;
        if (scenario !== "all" && card.scenario !== scenario) return false;
        return textMatches([card.title, card.category, card.summary, card.detail, card.action].join(" "), query);
      }),
    [category, query, scenario]
  );

  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <div className="atlas-panel">
      <div className="atlas-toolbar">
        <Field label="Kartlarda ara">
          <input
            type="search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(0); }}
            placeholder="Örn. saklama, hediye, mobil"
          />
        </Field>
        <Field label="Konu">
          <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(0); }}>
            <option value="all">Tüm konular</option>
            {KNOWLEDGE_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Senaryo">
          <select value={scenario} onChange={(event) => { setScenario(event.target.value); setPage(0); }}>
            <option value="all">Tüm senaryolar</option>
            {KNOWLEDGE_SCENARIOS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </Field>
      </div>

      <ResultMeta shown={visible.length} total={filtered.length} label="kart bu sayfada" />

      {filtered.length === 0 ? (
        <EmptyState title="Kart bulunamadı" text="Konuyu genişlet veya senaryo filtresini kaldır." />
      ) : (
        <>
          <div className="atlas-card-grid atlas-card-grid--knowledge">
            {visible.map((card: KnowledgeCard) => (
              <article key={card.id} className="atlas-card">
                <div className="atlas-card__topline"><span>{card.category}</span><em>{card.scenario}</em></div>
                <h3>{card.title}</h3>
                <p><strong>{card.summary}</strong></p>
                <p>{card.detail}</p>
                <p className="atlas-action"><strong>Sıradaki adım:</strong> {card.action}</p>
                <a href={card.anchor}>İlgili bölüme git →</a>
              </article>
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

/* ------------------------------ Soru bankası ------------------------------ */

function QuizPanel() {
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () =>
      QUIZ_BANK.filter((question) => {
        if (category !== "all" && question.category !== category) return false;
        if (difficulty !== "all" && question.difficulty !== difficulty) return false;
        return true;
      }),
    [category, difficulty]
  );

  const current: QuizQuestion | undefined = filtered.length ? filtered[cursor % filtered.length] : undefined;
  const answeredCurrent = current ? history[current.id] !== undefined : false;

  function resetQuiz(nextCategory = category, nextDifficulty = difficulty) {
    setCategory(nextCategory);
    setDifficulty(nextDifficulty);
    setCursor(0);
    setSelected(null);
    setAttempts(0);
    setScore(0);
    setHistory({});
  }

  function answer(index: number) {
    if (!current || selected !== null) return;
    if (history[current.id] !== undefined) {
      setSelected(index);
      return;
    }
    const correct = isQuizAnswerCorrect(current, index);
    setSelected(index);
    setAttempts((value) => value + 1);
    if (correct) setScore((value) => value + 1);
    setHistory((old) => ({ ...old, [current.id]: correct }));
  }

  function nextQuestion() {
    if (filtered.length <= 1) {
      setCursor(0);
    } else {
      const currentIndex = cursor % filtered.length;
      const unanswered = filtered
        .map((question, index) => ({ question, index }))
        .filter(({ question, index }) => index !== currentIndex && history[question.id] === undefined)
        .map(({ index }) => index);
      if (unanswered.length > 0) {
        setCursor(unanswered[Math.floor(Math.random() * unanswered.length)]);
      } else {
        setCursor((value) => {
          let next = value;
          while (next === value) next = Math.floor(Math.random() * filtered.length);
          return next;
        });
      }
    }
    setSelected(null);
  }

  return (
    <div className="atlas-panel">
      <div className="atlas-toolbar">
        <Field label="Soru kategorisi">
          <select value={category} onChange={(event) => resetQuiz(event.target.value, difficulty)}>
            <option value="all">Tüm kategoriler</option>
            {QUIZ_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Zorluk">
          <select value={difficulty} onChange={(event) => resetQuiz(category, event.target.value)}>
            <option value="all">Tümü</option>
            {QUIZ_DIFFICULTIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </Field>
        <div className="atlas-score" aria-live="polite">
          <strong>{score}/{attempts}</strong>
          <span>bu filtrede doğru</span>
        </div>
      </div>

      {!current ? (
        <EmptyState title="Bu filtrede soru yok" text="Kategori veya zorluk seçimini genişlet." />
      ) : (
        <article className="atlas-quiz-card">
          <div className="atlas-card__topline">
            <span>{current.category}</span>
            <em>{current.difficulty} · {current.id}</em>
          </div>
          <h3>{current.question}</h3>
          <div className="atlas-quiz-options">
            {current.options.map((option, index) => {
              const isChosen = selected === index;
              const isCorrect = selected !== null && current.answerIndex === index;
              return (
                <button
                  key={`${current.id}-${option}`}
                  type="button"
                  onClick={() => answer(index)}
                  disabled={selected !== null}
                  className={[
                    "atlas-quiz-option",
                    isChosen ? "is-chosen" : "",
                    isCorrect ? "is-correct" : "",
                    selected !== null && isChosen && !isCorrect ? "is-wrong" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="atlas-quiz-feedback" role="status">
              <strong>{history[current.id] ? "Doğru." : "Bu sefer olmadı."}</strong>
              <p>{current.explanation}</p>
              <a href={current.anchor}>Konuyu sayfada gör →</a>
            </div>
          )}

          <div className="atlas-quiz-actions">
            <span>{numberFormatter.format(Object.keys(history).length)} benzersiz soru cevaplandı{answeredCurrent ? " · Bu soru geçmişte var" : ""}</span>
            <button type="button" className="btn btn--small btn--primary" onClick={nextQuestion}>
              Yeni soru getir
            </button>
          </div>
        </article>
      )}
      <p className="atlas-footnote">Soru bankası sitenin kendi anlatımını tekrar etmek içindir; cevaplar temsilî demo bağlamında değerlendirilmelidir.</p>
    </div>
  );
}

/* ------------------------------ Ana Atlas ------------------------------ */

export default function Atlas() {
  const [tab, setTab] = useState<AtlasTab>("lotlar");
  const activeTab = TABS.find((item) => item.id === tab) ?? TABS[0];

  return (
    <section className="section atlas" id="atlas" aria-labelledby="atlas-baslik">
      <div className="section__head atlas__head">
        <p className="kicker">Patik Atlası · geniş demo defteri</p>
        <h2 id="atlas-baslik">Kayısının kayıt odası</h2>
        <p className="section__lede">
          Patik'in üç kanonik lotu vitrinde durmaya devam ediyor. Atlas, fikir büyürse
          kayıtların nasıl aranacağını gösteren <strong>{numberFormatter.format(TOTAL_RECORDS)} temsilî kayıt</strong> içerir:
          lot defteri, yıl takvimi, sözlük, tarifler, bilgi kartları ve çalışma soruları.
        </p>
      </div>

      <div className="atlas-hero-stats" aria-label="Atlas kayıt özeti">
        <div><strong>{numberFormatter.format(TOTAL_RECORDS)}</strong><span>temsilî kayıt</span></div>
        <div><strong>{LOT_LEDGER.length}</strong><span>lot satırı</span></div>
        <div><strong>52</strong><span>sezon haftası</span></div>
        <div><strong>{GLOSSARY.length + QUIZ_BANK.length}</strong><span>kavram + soru</span></div>
      </div>

      <p className="atlas-demo-warning">
        <strong>Şeffaflık notu:</strong> Bu defter gerçek hasat veya satış kaydı değildir.
        Sayılar yalnızca izlenebilirlik arayüzünü ölçekli göstermek için kurgulanmıştır.
      </p>

      <div className="atlas-tabs" role="group" aria-label="Atlas bölümleri">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`atlas-tab${tab === item.id ? " is-active" : ""}`}
            aria-pressed={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{item.count} kayıt</span>
          </button>
        ))}
      </div>

      <div className="atlas-active-intro" aria-live="polite">
        <h3>{activeTab.label}</h3>
        <p>{activeTab.description}</p>
      </div>

      {tab === "lotlar" && <LotLedgerPanel />}
      {tab === "takvim" && <SeasonPanel />}
      {tab === "sozluk" && <GlossaryPanel />}
      {tab === "tarifler" && <RecipesPanel />}
      {tab === "kartlar" && <KnowledgePanel />}
      {tab === "sorular" && <QuizPanel />}
    </section>
  );
}
