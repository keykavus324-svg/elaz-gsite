import { useEffect, useMemo, useState } from "react";
import type { DailyJournalEntry } from "../content/dailyJournal";
import type { GlossaryEntry } from "../content/glossary";
import type { LearningLesson } from "../content/learningPaths";
import type { LedgerLot } from "../content/lotLedger";
import type { PackingRun } from "../content/packingRuns";
import type { QualityCheck } from "../content/qualityChecks";
import type { RecipeCard } from "../content/recipes";

type DeskMode = "today" | "lot" | "recipe" | "term" | "quality" | "lesson";

type DeskData =
  | { kind: "today"; entry: DailyJournalEntry }
  | { kind: "lot"; lot: LedgerLot }
  | { kind: "recipe"; recipe: RecipeCard }
  | { kind: "term"; entry: GlossaryEntry }
  | { kind: "quality"; check: QualityCheck; run: PackingRun }
  | { kind: "lesson"; lesson: LearningLesson };

const STATIONS: Array<{
  id: DeskMode;
  no: string;
  label: string;
  count: string;
  hint: string;
}> = [
  { id: "today", no: "01", label: "Bugün Sahada", count: "365 gün", hint: "Günün iş kartı" },
  { id: "lot", no: "02", label: "Lot Tezgâhı", count: "204 lot", hint: "Bir partinin izi" },
  { id: "recipe", no: "03", label: "Mutfak Kartı", count: "96 tarif", hint: "Bugünün kullanımı" },
  { id: "term", no: "04", label: "Sözlük Fişi", count: "155 kavram", hint: "Bir kelime öğren" },
  { id: "quality", no: "05", label: "Kalite + Kutu", count: "336 kayıt", hint: "Karar ve koşu" },
  { id: "lesson", no: "06", label: "Günün Dersi", count: "120 ders", hint: "Beş dakikalık okul" },
];

function pick<T>(items: readonly T[], index: number): T {
  return items[Math.abs(index) % items.length];
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="fielddesk__loading" role="status">
      <span aria-hidden="true" />
      <strong>{label} açılıyor</strong>
      <p>Kayıt paketi yalnızca bu istasyon için yükleniyor.</p>
    </div>
  );
}

export default function FieldDesk() {
  const [mode, setMode] = useState<DeskMode>("today");
  const [seed, setSeed] = useState(0);
  const [data, setData] = useState<DeskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState<number[]>([]);
  const [todayLabel] = useState(() =>
    new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      weekday: "long",
    }).format(new Date())
  );

  const baseIndex = useMemo(() => {
    const now = new Date();
    return now.getMonth() * 31 + now.getDate() * 7;
  }, []);

  const activeStation = STATIONS.find((station) => station.id === mode) ?? STATIONS[0];

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setChecked([]);

    async function load() {
      try {
        if (mode === "today") {
          const journal = await import("../content/dailyJournal");
          const now = new Date();
          const today = journal.journalEntryForDate(now.getMonth() + 1, now.getDate()) ?? journal.DAILY_JOURNAL[0];
          const entry = journal.DAILY_JOURNAL[(today.dayOfYear - 1 + seed) % journal.DAILY_JOURNAL.length];
          if (alive) setData({ kind: "today", entry });
          return;
        }

        if (mode === "lot") {
          const ledger = await import("../content/lotLedger");
          const lot = pick(ledger.LOT_LEDGER, baseIndex + seed * 17);
          if (alive) setData({ kind: "lot", lot });
          return;
        }

        if (mode === "recipe") {
          const recipes = await import("../content/recipes");
          const recipe = pick(recipes.RECIPES, baseIndex + seed * 11);
          if (alive) setData({ kind: "recipe", recipe });
          return;
        }

        if (mode === "term") {
          const glossary = await import("../content/glossary");
          const entry = pick(glossary.GLOSSARY, baseIndex + seed * 13);
          if (alive) setData({ kind: "term", entry });
          return;
        }

        if (mode === "quality") {
          const [quality, packing] = await Promise.all([
            import("../content/qualityChecks"),
            import("../content/packingRuns"),
          ]);
          const runsByLot = new Map(packing.PACKING_RUNS.map((item) => [item.lotCode, item]));
          const linkedChecks = quality.QUALITY_CHECKS.filter((item) => runsByLot.has(item.lotCode));
          const check = pick(linkedChecks.length ? linkedChecks : quality.QUALITY_CHECKS, baseIndex + seed * 19);
          const run = runsByLot.get(check.lotCode) ?? pick(packing.PACKING_RUNS, baseIndex + seed * 7);
          if (alive) setData({ kind: "quality", check, run });
          return;
        }

        const learning = await import("../content/learningPaths");
        const lesson = pick(learning.LEARNING_LESSONS, baseIndex + seed * 9);
        if (alive) setData({ kind: "lesson", lesson });
      } catch {
        if (alive) setError("Bu kayıt paketi şu anda açılamadı. Başka bir istasyon seçebilir veya sayfayı yenileyebilirsin.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [baseIndex, mode, seed]);

  function chooseStation(next: DeskMode) {
    setMode(next);
    setSeed(0);
  }

  function nextRecord() {
    setSeed((value) => value + 1);
  }

  return (
    <section className="section fielddesk" id="saha" aria-labelledby="saha-baslik">
      <div className="fielddesk__shell">
        <header className="fielddesk__masthead">
          <div>
            <p className="fielddesk__kicker">Canlı temsilî konsol · {todayLabel}</p>
            <h2 id="saha-baslik">Saha Defteri bugün açık.</h2>
            <p>
              Sitedeki 1.800 kayıt artık sayfanın dibinde saklanmıyor. Bir istasyon seç;
              günün işini, bir lotun izini, tarif kartını veya ders fişini buradan çalıştır.
            </p>
          </div>
          <div className="fielddesk__date-stamp" aria-hidden="true">
            <span>Defter</span>
            <strong>23</strong>
            <span>Elazığ</span>
          </div>
        </header>

        <div className="fielddesk__layout">
          <div className="fielddesk__stations" role="group" aria-label="Saha Defteri istasyonları">
            {STATIONS.map((station) => (
              <button
                key={station.id}
                type="button"
                className={station.id === mode ? "is-active" : ""}
                aria-pressed={station.id === mode}
                onClick={() => chooseStation(station.id)}
              >
                <span className="fielddesk__station-no">{station.no}</span>
                <span>
                  <strong>{station.label}</strong>
                  <small>{station.count} · {station.hint}</small>
                </span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>

          <article className="fielddesk__stage" aria-labelledby="fielddesk-stage-title">
            <div className="fielddesk__stage-head">
              <div>
                <p>{activeStation.count}</p>
                <h3 id="fielddesk-stage-title">{activeStation.label}</h3>
              </div>
              <button type="button" className="btn btn--primary btn--small" onClick={nextRecord} disabled={loading}>
                {mode === "today" ? "Ertesi gün →" : "Başka kayıt →"}
              </button>
            </div>

            {loading && <LoadingCard label={activeStation.label} />}

            {!loading && error && (
              <div className="fielddesk__error" role="alert">
                <strong>Kayıt açılamadı</strong>
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && data?.kind === "today" && (
              <div className="fielddesk__record fielddesk__record--today">
                <div className="fielddesk__record-title">
                  <span>{data.entry.dateLabel} · {data.entry.dayOfYear}/365</span>
                  <strong>{data.entry.title}</strong>
                </div>
                <p className="fielddesk__weather">{data.entry.weatherScenario}</p>
                <div className="fielddesk__task-grid">
                  <div><span>Bahçede</span><p>{data.entry.orchardTask}</p></div>
                  <div><span>Atölyede</span><p>{data.entry.workshopTask}</p></div>
                  <div><span>Kayıtta</span><p>{data.entry.recordTask}</p></div>
                  <div><span>Mutfakta</span><p>{data.entry.kitchenNote}</p></div>
                </div>
                <div className="fielddesk__checks">
                  {data.entry.checklist.slice(0, 3).map((task, index) => {
                    const isChecked = checked.includes(index);
                    return (
                      <label key={task} className={isChecked ? "is-done" : ""}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setChecked((current) =>
                              current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
                            )
                          }
                        />
                        <span>{task}</span>
                      </label>
                    );
                  })}
                </div>
                <a href="#evren" className="fielddesk__deep-link">365 günün tamamını Evren'de aç →</a>
              </div>
            )}

            {!loading && !error && data?.kind === "lot" && (
              <div className="fielddesk__record">
                <div className="fielddesk__record-title">
                  <span>{data.lot.code} · {data.lot.harvestWindow}</span>
                  <strong>{data.lot.product}</strong>
                </div>
                <dl className="fielddesk__facts">
                  <div><dt>Parsel</dt><dd>{data.lot.parcel}</dd></div>
                  <div><dt>Yöntem</dt><dd>{data.lot.methodLabel}</dd></div>
                  <div><dt>Çıktı</dt><dd>{data.lot.outputKg} kg · {data.lot.boxCount} kutu</dd></div>
                  <div><dt>Durum</dt><dd>{data.lot.status}</dd></div>
                </dl>
                <ol className="fielddesk__trace">
                  {data.lot.traceSteps.slice(0, 4).map((step) => <li key={step}>{step}</li>)}
                </ol>
                <p className="fielddesk__note">{data.lot.seasonNote}</p>
                <a href="#atlas" className="fielddesk__deep-link">204 lotluk defterde ara →</a>
              </div>
            )}

            {!loading && !error && data?.kind === "recipe" && (
              <div className="fielddesk__record">
                <div className="fielddesk__record-title">
                  <span>{data.recipe.product} · {data.recipe.prepMinutes + data.recipe.cookMinutes} dakika</span>
                  <strong>{data.recipe.title}</strong>
                </div>
                <p className="fielddesk__lead">{data.recipe.texture}</p>
                <div className="fielddesk__two-col">
                  <div>
                    <h4>Tezgâha çıkar</h4>
                    <ul>{data.recipe.ingredients.slice(0, 5).map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                  <div>
                    <h4>İlk adımlar</h4>
                    <ol>{data.recipe.steps.slice(0, 3).map((step) => <li key={step}>{step}</li>)}</ol>
                  </div>
                </div>
                <p className="fielddesk__note"><strong>Servis:</strong> {data.recipe.servingNote}</p>
                <a href="#atlas" className="fielddesk__deep-link">96 tarif kartını Atlas'ta aç →</a>
              </div>
            )}

            {!loading && !error && data?.kind === "term" && (
              <div className="fielddesk__record fielddesk__record--term">
                <p className="fielddesk__term-category">{data.entry.category}</p>
                <strong className="fielddesk__term-word">{data.entry.term}</strong>
                <p className="fielddesk__definition">{data.entry.definition}</p>
                <dl className="fielddesk__facts">
                  <div><dt>Patik'te</dt><dd>{data.entry.patikContext}</dd></div>
                  <div><dt>Bakılacak yer</dt><dd>{data.entry.lookFor}</dd></div>
                  <div><dt>İlişkili</dt><dd>{data.entry.relatedTerm}</dd></div>
                </dl>
                <a href="#atlas" className="fielddesk__deep-link">155 kavramın tamamı →</a>
              </div>
            )}

            {!loading && !error && data?.kind === "quality" && (
              <div className="fielddesk__record">
                <div className="fielddesk__record-title">
                  <span>{data.check.lotCode} · {data.check.checkpoint}</span>
                  <strong>{data.check.decision}</strong>
                </div>
                <div className="fielddesk__share" aria-label={`Ana sınıf yüzde ${data.check.primaryShare}, ikinci sınıf yüzde ${data.check.secondaryShare}, ayrılan yüzde ${data.check.reserveShare}`}>
                  <span className="is-main" style={{ width: `${data.check.primaryShare}%` }} />
                  <span className="is-second" style={{ width: `${data.check.secondaryShare}%` }} />
                  <span className="is-reserve" style={{ width: `${data.check.reserveShare}%` }} />
                </div>
                <div className="fielddesk__share-labels">
                  <span>Ana %{data.check.primaryShare}</span>
                  <span>İkinci %{data.check.secondaryShare}</span>
                  <span>Ayrılan %{data.check.reserveShare}</span>
                </div>
                <dl className="fielddesk__facts">
                  <div><dt>Renk</dt><dd>{data.check.colorBand}</dd></div>
                  <div><dt>Doku</dt><dd>{data.check.textureBand}</dd></div>
                  <div><dt>Kutu koşusu</dt><dd>{data.run.runCode} · {data.run.station}</dd></div>
                  <div><dt>Koşu çıktısı</dt><dd>{data.run.boxCount} kutu · {data.run.durationMinutes} dk</dd></div>
                </dl>
                <p className="fielddesk__note"><strong>Düzeltici adım:</strong> {data.check.correctiveAction}</p>
                <a href="#evren" className="fielddesk__deep-link">Kalite ve kutu hattını çalıştır →</a>
              </div>
            )}

            {!loading && !error && data?.kind === "lesson" && (
              <div className="fielddesk__record">
                <div className="fielddesk__record-title">
                  <span>{data.lesson.track} · {data.lesson.level} · {data.lesson.estimatedMinutes} dk</span>
                  <strong>{data.lesson.title}</strong>
                </div>
                <p className="fielddesk__lead">{data.lesson.objective}</p>
                <div className="fielddesk__lesson-box">
                  <span>Bugün uygula</span>
                  <p>{data.lesson.practiceTask}</p>
                </div>
                <dl className="fielddesk__facts">
                  <div><dt>Kontrol sorusu</dt><dd>{data.lesson.checkQuestion}</dd></div>
                  <div><dt>Rozet yolu</dt><dd>{data.lesson.badge}</dd></div>
                </dl>
                <p className="fielddesk__note">Cevabı önce kendin söyle; dersin tamamı ve ilerleme kaydı Patik Okulu'nda.</p>
                <a href="#evren" className="fielddesk__deep-link">120 dersi Patik Okulu'nda aç →</a>
              </div>
            )}
          </article>
        </div>

        <footer className="fielddesk__footer">
          <strong>Not:</strong> Bu konsoldaki kayıtlar temsilî demo verisidir; işlevler ve hesaplar gerçektir.
        </footer>
      </div>
    </section>
  );
}
