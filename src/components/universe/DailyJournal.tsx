import { useMemo, useState } from "react";
import {
  DAILY_JOURNAL,
  JOURNAL_FOCUS_AREAS,
  JOURNAL_MONTHS,
  JOURNAL_PHASES,
  journalEntryForDate,
  type DailyJournalEntry,
} from "../../content/dailyJournal";
import {
  UniEmpty,
  UniField,
  UniResultMeta,
  UniStat,
  universeMatches,
  useStoredStringList,
} from "./shared";

function todayEntry(): DailyJournalEntry {
  const now = new Date();
  return journalEntryForDate(now.getMonth() + 1, now.getDate()) ?? DAILY_JOURNAL[0];
}

function entryByDay(dayOfYear: number): DailyJournalEntry {
  return DAILY_JOURNAL[Math.min(DAILY_JOURNAL.length, Math.max(1, dayOfYear)) - 1] ?? DAILY_JOURNAL[0];
}

const FOCUS_LABEL: Record<DailyJournalEntry["focusArea"], string> = {
  Bahçe: "Bahçe",
  Atölye: "Atölye",
  Kayıt: "Kayıt",
  Mutfak: "Mutfak",
};

const FOCUS_CLASS: Record<DailyJournalEntry["focusArea"], string> = {
  Bahçe: "bahce",
  Atölye: "atolye",
  Kayıt: "kayit",
  Mutfak: "mutfak",
};

export default function DailyJournal() {
  const [selected, setSelected] = useState<DailyJournalEntry>(() => todayEntry());
  const [monthIndex, setMonthIndex] = useState(selected.monthIndex);
  const [focus, setFocus] = useState("all");
  const [phase, setPhase] = useState("all");
  const [query, setQuery] = useState("");
  const { items: completed, toggle: toggleComplete } = useStoredStringList("patik-journal-checks-v1");

  const monthEntries = useMemo(
    () => DAILY_JOURNAL.filter((entry) => entry.monthIndex === monthIndex),
    [monthIndex]
  );

  const searchResults = useMemo(
    () =>
      DAILY_JOURNAL.filter((entry) => {
        if (focus !== "all" && entry.focusArea !== focus) return false;
        if (phase !== "all" && entry.phase !== phase) return false;
        return universeMatches(
          [entry.dateLabel, entry.title, entry.phase, entry.orchardTask, entry.workshopTask, entry.recordTask, entry.kitchenNote].join(" "),
          query
        );
      }).slice(0, 10),
    [focus, phase, query]
  );

  const selectedChecklistKeys = selected.checklist.map((_, index) => `${selected.dayOfYear}-${index}`);
  const selectedDone = selectedChecklistKeys.filter((key) => completed.includes(key)).length;
  const selectedProgress = selected.checklist.length ? Math.round((selectedDone / selected.checklist.length) * 100) : 0;
  const monthMinutes = monthEntries.reduce((sum, entry) => sum + entry.estimatedMinutes, 0);

  function chooseEntry(entry: DailyJournalEntry) {
    setSelected(entry);
    setMonthIndex(entry.monthIndex);
  }

  function chooseMonth(index: number) {
    setMonthIndex(index);
    const first = DAILY_JOURNAL.find((entry) => entry.monthIndex === index);
    if (first) setSelected(first);
  }

  function move(days: number) {
    chooseEntry(entryByDay(selected.dayOfYear + days));
  }

  return (
    <div className="uni-panel">
      <div className="uni-stats">
        <UniStat value="365" label="günlük temsilî plan" />
        <UniStat value={selected.dateLabel} label="seçili gün" hint={`${selected.dayOfYear}. gün`} />
        <UniStat value={`${monthMinutes} dk`} label={`${selected.month} plan yükü`} hint="günlük tahminlerin toplamı" />
        <UniStat value={`%${selectedProgress}`} label="bugünün kontrol listesi" hint={`${selectedDone}/${selected.checklist.length} tamam`} />
      </div>

      <div className="uni-month-chips" role="group" aria-label="Ay seç">
        {JOURNAL_MONTHS.map((month) => (
          <button
            key={month.index}
            type="button"
            className={month.index === monthIndex ? "is-active" : ""}
            onClick={() => chooseMonth(month.index)}
            aria-pressed={month.index === monthIndex}
          >
            <strong>{month.name}</strong>
            <span>{month.phase}</span>
          </button>
        ))}
      </div>

      <div className="uni-split uni-split--journal">
        <div>
          <article className="uni-calendar-card">
            <div className="uni-card-head">
              <div>
                <p className="uni-widget__kicker">{selected.month} takvimi</p>
                <h3>{selected.phase}</h3>
              </div>
              <div className="uni-day-nav">
                <button type="button" onClick={() => move(-1)} disabled={selected.dayOfYear === 1}>← Dün</button>
                <button type="button" onClick={() => move(1)} disabled={selected.dayOfYear === 365}>Yarın →</button>
              </div>
            </div>

            <div className="uni-calendar-grid" role="group" aria-label={`${selected.month} günleri`}>
              {monthEntries.map((entry) => (
                <button
                  key={entry.dayOfYear}
                  type="button"
                  className={`uni-day is-${FOCUS_CLASS[entry.focusArea]}${entry.dayOfYear === selected.dayOfYear ? " is-selected" : ""}`}
                  onClick={() => chooseEntry(entry)}
                  aria-pressed={entry.dayOfYear === selected.dayOfYear}
                  aria-label={`${entry.dateLabel}: ${entry.title}`}
                >
                  <strong>{entry.dayOfMonth}</strong>
                  <span>{FOCUS_LABEL[entry.focusArea]}</span>
                </button>
              ))}
            </div>

            <label className="uni-range-field">
              <span>Yıl içinde gez</span>
              <input
                type="range"
                min={1}
                max={365}
                value={selected.dayOfYear}
                onChange={(event) => chooseEntry(entryByDay(Number(event.target.value)))}
              />
              <strong>{selected.dateLabel} · {selected.dayOfYear}/365</strong>
            </label>
          </article>

          <article className="uni-search-card">
            <p className="uni-widget__kicker">365 gün içinde ara</p>
            <h3>Bir işi yıl boyunca bul</h3>
            <div className="uni-toolbar uni-toolbar--journal-search">
              <UniField label="Görev veya kavram">
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Örn. patik, budama, hoşaf" />
              </UniField>
              <UniField label="Odak alanı">
                <select value={focus} onChange={(event) => setFocus(event.target.value)}>
                  <option value="all">Tümü</option>
                  {JOURNAL_FOCUS_AREAS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </UniField>
              <UniField label="Aşama">
                <select value={phase} onChange={(event) => setPhase(event.target.value)}>
                  <option value="all">Tüm aşamalar</option>
                  {JOURNAL_PHASES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </UniField>
            </div>
            <UniResultMeta shown={searchResults.length} total={365} unit="yakın sonuç" />
            {searchResults.length === 0 ? (
              <UniEmpty title="Gün bulunamadı" text="Arama kelimesini kısalt veya odak filtresini kaldır." />
            ) : (
              <div className="uni-result-list">
                {searchResults.map((entry) => (
                  <button key={entry.dayOfYear} type="button" onClick={() => chooseEntry(entry)}>
                    <strong>{entry.dateLabel}</strong>
                    <span>{entry.title}</span>
                    <small>{entry.focusArea} · {entry.estimatedMinutes} dk</small>
                  </button>
                ))}
              </div>
            )}
          </article>
        </div>

        <aside className="uni-detail uni-detail--journal" aria-labelledby="uni-journal-title">
          <p className="uni-widget__kicker">{selected.dateLabel} · temsilî sezon planı</p>
          <h3 id="uni-journal-title">{selected.title}</h3>
          <div className="uni-chip-row">
            <span>{selected.focusArea} odağı</span>
            <span>{selected.estimatedMinutes} dk</span>
            <span>{selected.phase}</span>
          </div>
          <p className="uni-weather">{selected.weatherScenario}</p>

          <div className="uni-task-stack">
            <div><strong>Bahçede</strong><p>{selected.orchardTask}</p></div>
            <div><strong>Atölyede</strong><p>{selected.workshopTask}</p></div>
            <div><strong>Kayıtta</strong><p>{selected.recordTask}</p></div>
            <div><strong>Mutfakta</strong><p>{selected.kitchenNote}</p></div>
          </div>

          <h4>Günün kontrol listesi</h4>
          <div className="uni-progress" aria-hidden="true"><span style={{ width: `${selectedProgress}%` }} /></div>
          <div className="uni-checklist">
            {selected.checklist.map((task, index) => {
              const key = `${selected.dayOfYear}-${index}`;
              const checked = completed.includes(key);
              return (
                <label key={key} className={checked ? "is-done" : ""}>
                  <input type="checkbox" checked={checked} onChange={() => toggleComplete(key)} />
                  <span>{task}</span>
                </label>
              );
            })}
          </div>

          <p className="uni-note"><strong>Risk notu:</strong> {selected.riskNote}</p>
          <p className="uni-note"><strong>Sunum ipucu:</strong> {selected.demoTip}</p>
          <p className="uni-note uni-note--soft">Bu günlük gerçek hava durumu veya gerçekleşmiş iş kaydı değildir; temsilî bir yıllık çalışma ritmidir.</p>
        </aside>
      </div>
    </div>
  );
}
