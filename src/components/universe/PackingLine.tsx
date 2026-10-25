import { useEffect, useMemo, useRef, useState } from "react";
import {
  PACKING_RUNS,
  PACKING_STATIONS,
  summarizePackingRuns,
  type PackingRun,
} from "../../content/packingRuns";
import {
  UniBar,
  UniEmpty,
  UniField,
  UniPagination,
  UniResultMeta,
  UniStat,
  universeMatches,
  universeNumber,
} from "./shared";

const SIMULATION_STEPS = [
  "Kasayı istasyona al",
  "Ürünü kutuya yerleştir",
  "Net ağırlığı doğrula",
  "Lot pasaportunu ekle",
  "Etiketi kapat ve say",
];

function Simulation({ run }: { run: PackingRun }) {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setStep(0);
    setRunning(false);
    window.clearInterval(timerRef.current);
  }, [run.id]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => {
      setStep((current) => Math.min(SIMULATION_STEPS.length, current + 1));
    }, 650);
    return () => window.clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    if (step >= SIMULATION_STEPS.length) setRunning(false);
  }, [step]);

  const progress = Math.round((step / SIMULATION_STEPS.length) * 100);
  const done = step >= SIMULATION_STEPS.length;

  function reset() {
    setRunning(false);
    setStep(0);
    window.clearInterval(timerRef.current);
  }

  function stepOnce() {
    setRunning(false);
    setStep((current) => Math.min(SIMULATION_STEPS.length, current + 1));
  }

  return (
    <div className="uni-simulation">
      <div className="uni-simulation__head">
        <div>
          <p className="uni-widget__kicker">Canlı temsilî simülasyon</p>
          <h4>{run.runCode} kutu akışı</h4>
        </div>
        <strong>%{progress}</strong>
      </div>
      <div className="uni-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <ol className="uni-simulation-steps">
        {SIMULATION_STEPS.map((label, index) => (
          <li key={label} className={index < step ? "is-done" : index === step ? "is-current" : ""}>
            <span>{index < step ? "✓" : index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <p className="uni-simulation__status" role="status">
        {done
          ? `${run.boxCount} kutuluk temsilî koşu tamamlandı; sıradaki adım: ${run.nextStep}.`
          : running
            ? `Şu adım çalışıyor: ${SIMULATION_STEPS[step]}.`
            : "Simülasyon hazır. Otomatik oynatabilir veya adım adım ilerleyebilirsin."}
      </p>
      <div className="uni-button-row">
        <button type="button" className="btn btn--small btn--primary" onClick={() => setRunning((value) => !value)} disabled={done}>
          {running ? "Duraklat" : step > 0 ? "Devam et" : "Başlat"}
        </button>
        <button type="button" className="btn btn--small btn--ghost" onClick={stepOnce} disabled={done}>Bir adım</button>
        <button type="button" className="btn btn--small btn--ghost" onClick={reset}>Sıfırla</button>
      </div>
    </div>
  );
}

export default function PackingLine() {
  const [query, setQuery] = useState("");
  const [station, setStation] = useState("all");
  const [pace, setPace] = useState("all");
  const [state, setState] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(PACKING_RUNS[1]?.id ?? "");

  const filtered = useMemo(
    () =>
      PACKING_RUNS.filter((run) => {
        if (station !== "all" && run.station !== station) return false;
        if (pace !== "all" && run.pace !== pace) return false;
        if (state !== "all" && run.completionState !== state) return false;
        return universeMatches([run.runCode, run.lotCode, run.product, run.boxType, run.station].join(" "), query);
      }),
    [pace, query, state, station]
  );

  const summary = summarizePackingRuns(filtered);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const selected = filtered.find((run) => run.id === selectedId) ?? visible[0] ?? filtered[0];

  const stationWork = useMemo(
    () =>
      PACKING_STATIONS.map((name) => {
        const runs = filtered.filter((run) => run.station === name);
        return {
          name,
          runs: runs.length,
          boxes: runs.reduce((sum, run) => sum + run.boxCount, 0),
          minutes: runs.reduce((sum, run) => sum + run.durationMinutes, 0),
        };
      }),
    [filtered]
  );
  const maxStationBoxes = Math.max(1, ...stationWork.map((item) => item.boxes));

  function updateFilter<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  return (
    <div className="uni-panel">
      <div className="uni-stats">
        <UniStat value={universeNumber.format(summary.count)} label="kutu koşusu" />
        <UniStat value={universeNumber.format(summary.boxes)} label="temsilî kutu" />
        <UniStat value={universeNumber.format(summary.passports)} label="pasaport kartı" />
        <UniStat value={`${Math.round(summary.minutes / 60)} sa`} label="temsilî hat süresi" hint={`${summary.open} açık koşu`} />
      </div>

      <div className="uni-toolbar uni-toolbar--packing">
        <UniField label="Koşu veya lot ara">
          <input type="search" value={query} onChange={(event) => updateFilter(setQuery)(event.target.value)} placeholder="Örn. PK-26-042 veya PT-26-242" />
        </UniField>
        <UniField label="İstasyon">
          <select value={station} onChange={(event) => updateFilter(setStation)(event.target.value)}>
            <option value="all">Tüm istasyonlar</option>
            {PACKING_STATIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </UniField>
        <UniField label="Tempo">
          <select value={pace} onChange={(event) => updateFilter(setPace)(event.target.value)}>
            <option value="all">Tümü</option>
            <option value="Sakin">Sakin</option>
            <option value="Dengeli">Dengeli</option>
            <option value="Yoğun">Yoğun</option>
          </select>
        </UniField>
        <UniField label="Durum">
          <select value={state} onChange={(event) => updateFilter(setState)(event.target.value)}>
            <option value="all">Tümü</option>
            <option value="Koşu kapatıldı">Koşu kapatıldı</option>
            <option value="Son sayım bekliyor">Son sayım bekliyor</option>
          </select>
        </UniField>
      </div>

      <article className="uni-widget uni-widget--wide">
        <p className="uni-widget__kicker">İstasyon yükü</p>
        <h3>Kutular hangi masadan geçiyor?</h3>
        <div className="uni-bars uni-bars--stations">
          {stationWork.map((item) => (
            <UniBar key={item.name} label={`${item.name} · ${item.runs} koşu`} value={item.boxes} max={maxStationBoxes} suffix="kutu" tone="river" />
          ))}
        </div>
      </article>

      <UniResultMeta shown={visible.length} total={filtered.length} unit="koşu" />

      {filtered.length === 0 ? (
        <UniEmpty title="Koşu bulunamadı" text="İstasyon veya tempo filtresini genişleterek tekrar dene." />
      ) : (
        <div className="uni-split">
          <div>
            <div className="uni-card-grid uni-card-grid--packing">
              {visible.map((run) => (
                <article key={run.id} className={`uni-card${selected?.id === run.id ? " is-selected" : ""}`}>
                  <div className="uni-card__topline"><span>{run.runCode}</span><em>{run.pace}</em></div>
                  <h3>{run.product}</h3>
                  <p>{run.lotCode} · {run.station}</p>
                  <dl className="uni-mini-dl">
                    <div><dt>Kutu</dt><dd>{run.boxCount}</dd></div>
                    <div><dt>Süre</dt><dd>{run.durationMinutes} dk</dd></div>
                    <div><dt>Pasaport</dt><dd>{run.passportCards}</dd></div>
                  </dl>
                  <p className="uni-card__hint">{run.boxType} · {run.completionState}</p>
                  <button type="button" className="btn btn--small btn--ghost" onClick={() => setSelectedId(run.id)}>
                    Koşuyu aç
                  </button>
                </article>
              ))}
            </div>
            <UniPagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>

          {selected && (
            <aside className="uni-detail" aria-labelledby="uni-packing-title">
              <p className="uni-widget__kicker">{selected.startedAtLabel} · temsilî koşu</p>
              <h3 id="uni-packing-title">{selected.runCode}</h3>
              <p>{selected.product} · {selected.lotCode}</p>
              <dl className="uni-detail-dl">
                <div><dt>İstasyon</dt><dd>{selected.station}</dd></div>
                <div><dt>Kutu tipi</dt><dd>{selected.boxType}</dd></div>
                <div><dt>Kutu / etiket</dt><dd>{selected.boxCount} / {selected.labelCount}</dd></div>
                <div><dt>Pasaport</dt><dd>{selected.passportCards} kart</dd></div>
                <div><dt>Süre</dt><dd>{selected.durationMinutes} dakika · {selected.pace} tempo</dd></div>
                <div><dt>Durum</dt><dd>{selected.completionState}</dd></div>
              </dl>
              <h4>Koşu kontrolleri</h4>
              <ul>{selected.checks.map((item) => <li key={item}>{item}</li>)}</ul>
              <p className="uni-note"><strong>Not:</strong> {selected.issueNote}</p>
              <p className="uni-note"><strong>Sıradaki:</strong> {selected.nextStep}</p>
              <Simulation key={selected.id} run={selected} />
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
