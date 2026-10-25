import { useMemo, useState } from "react";
import {
  QUALITY_CHECKS,
  QUALITY_CHECKPOINTS,
  QUALITY_DECISIONS,
  summarizeQualityChecks,
  type QualityCheck,
} from "../../content/qualityChecks";
import {
  UniBar,
  UniEmpty,
  UniField,
  UniPagination,
  UniResultMeta,
  UniStat,
  percent,
  universeMatches,
  universeNumber,
} from "./shared";

const METHOD_LABELS: Record<QualityCheck["method"], string> = {
  gun: "Gün kurusu",
  islimli: "İslimli",
  cekirdek: "Çekirdek",
};

function DecisionBadge({ decision }: { decision: QualityCheck["decision"] }) {
  const className = decision === "Kutulabilir" ? "is-good" : decision === "Yeniden ele" ? "is-warn" : "is-kitchen";
  return <span className={`uni-decision ${className}`}>{decision}</span>;
}

function ShareBar({ check }: { check: QualityCheck }) {
  return (
    <div className="uni-sharebar" role="img" aria-label={`Ana sınıf yüzde ${check.primaryShare}, ikinci sınıf yüzde ${check.secondaryShare}, ayrılan yüzde ${check.reserveShare}`}>
      <span className="is-primary" style={{ width: `${check.primaryShare}%` }} />
      <span className="is-secondary" style={{ width: `${check.secondaryShare}%` }} />
      <span className="is-reserve" style={{ width: `${check.reserveShare}%` }} />
    </div>
  );
}

export default function QualityLab() {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("all");
  const [checkpoint, setCheckpoint] = useState("all");
  const [decision, setDecision] = useState("all");
  const [minimumPrimary, setMinimumPrimary] = useState(55);
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(QUALITY_CHECKS[2]?.id ?? "");

  const filtered = useMemo(
    () =>
      QUALITY_CHECKS.filter((check) => {
        if (method !== "all" && check.method !== method) return false;
        if (checkpoint !== "all" && check.checkpoint !== checkpoint) return false;
        if (decision !== "all" && check.decision !== decision) return false;
        if (check.primaryShare < minimumPrimary) return false;
        return universeMatches(
          [check.id, check.lotCode, check.product, check.colorBand, check.textureBand, check.decision].join(" "),
          query
        );
      }).sort((a, b) => b.primaryShare - a.primaryShare || a.lotCode.localeCompare(b.lotCode)),
    [checkpoint, decision, method, minimumPrimary, query]
  );

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const selected = filtered.find((check) => check.id === selectedId) ?? visible[0] ?? filtered[0];
  const summary = summarizeQualityChecks(filtered);
  const maxDecision = Math.max(1, summary.packable, summary.rework, summary.kitchen);

  function resetToFirstPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  return (
    <div className="uni-panel">
      <div className="uni-stats">
        <UniStat value={universeNumber.format(summary.count)} label="kontrol kaydı" />
        <UniStat value={`%${percent(summary.packable, summary.count)}`} label="kutulanabilir kararı" hint={`${summary.packable} kayıt`} />
        <UniStat value={`%${summary.averagePrimary}`} label="ortalama ana sınıf" />
        <UniStat value={universeNumber.format(summary.rework + summary.kitchen)} label="yeniden işlenecek" hint="temsilî karar" />
      </div>

      <div className="uni-toolbar uni-toolbar--quality">
        <UniField label="Lot veya kontrol ara">
          <input type="search" value={query} onChange={(event) => resetToFirstPage(setQuery)(event.target.value)} placeholder="Örn. PT-26-287, canlı turuncu" />
        </UniField>
        <UniField label="Yöntem">
          <select value={method} onChange={(event) => resetToFirstPage(setMethod)(event.target.value)}>
            <option value="all">Tümü</option>
            <option value="gun">Gün kurusu</option>
            <option value="islimli">İslimli</option>
            <option value="cekirdek">Çekirdek</option>
          </select>
        </UniField>
        <UniField label="Kontrol noktası">
          <select value={checkpoint} onChange={(event) => resetToFirstPage(setCheckpoint)(event.target.value)}>
            <option value="all">Tümü</option>
            {QUALITY_CHECKPOINTS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </UniField>
        <UniField label="Karar">
          <select value={decision} onChange={(event) => resetToFirstPage(setDecision)(event.target.value)}>
            <option value="all">Tümü</option>
            {QUALITY_DECISIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </UniField>
        <UniField label={`En az ana sınıf: %${minimumPrimary}`}>
          <input
            type="range"
            min={55}
            max={85}
            step={5}
            value={minimumPrimary}
            onChange={(event) => resetToFirstPage(setMinimumPrimary)(Number(event.target.value))}
          />
        </UniField>
      </div>

      <div className="uni-widget uni-widget--wide">
        <p className="uni-widget__kicker">Karar dağılımı</p>
        <h3>Kontrol masasından çıkan temsilî kararlar</h3>
        <div className="uni-bars uni-bars--three">
          <UniBar label="Kutulabilir" value={summary.packable} max={maxDecision} suffix="kayıt" tone="leaf" />
          <UniBar label="Yeniden ele" value={summary.rework} max={maxDecision} suffix="kayıt" tone="sun" />
          <UniBar label="Mutfak denemesi" value={summary.kitchen} max={maxDecision} suffix="kayıt" tone="river" />
        </div>
      </div>

      <UniResultMeta shown={visible.length} total={filtered.length} unit="kontrol" />

      {filtered.length === 0 ? (
        <UniEmpty title="Bu eşikte kontrol bulunamadı" text="Ana sınıf yüzdesini düşür veya karar filtresini genişlet." />
      ) : (
        <div className="uni-split">
          <div>
            <div className="uni-card-grid uni-card-grid--quality">
              {visible.map((check) => (
                <article key={check.id} className={`uni-card${selected?.id === check.id ? " is-selected" : ""}`}>
                  <div className="uni-card__topline">
                    <span>{check.lotCode}</span>
                    <DecisionBadge decision={check.decision} />
                  </div>
                  <h3>{check.product}</h3>
                  <p>{check.checkpoint} · {check.sampleGrams} g numune</p>
                  <ShareBar check={check} />
                  <div className="uni-share-legend">
                    <span>Ana %{check.primaryShare}</span>
                    <span>İkinci %{check.secondaryShare}</span>
                    <span>Ayrılan %{check.reserveShare}</span>
                  </div>
                  <p className="uni-card__hint">{check.colorBand} · {check.textureBand}</p>
                  <button type="button" className="btn btn--small btn--ghost" onClick={() => setSelectedId(check.id)}>
                    Kontrolü aç
                  </button>
                </article>
              ))}
            </div>
            <UniPagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>

          {selected && (
            <aside className="uni-detail" aria-labelledby="uni-quality-title">
              <p className="uni-widget__kicker">{selected.id.toLocaleUpperCase("tr-TR")} · {selected.checkedAtLabel}</p>
              <h3 id="uni-quality-title">{selected.lotCode}</h3>
              <p>{selected.product} · {METHOD_LABELS[selected.method]}</p>
              <div className="uni-detail-decision"><DecisionBadge decision={selected.decision} /></div>
              <ShareBar check={selected} />
              <dl className="uni-detail-dl">
                <div><dt>Kontrol noktası</dt><dd>{selected.checkpoint}</dd></div>
                <div><dt>Numune</dt><dd>{selected.sampleGrams} g</dd></div>
                <div><dt>Renk bandı</dt><dd>{selected.colorBand}</dd></div>
                <div><dt>Doku bandı</dt><dd>{selected.textureBand}</dd></div>
                <div><dt>Ana sınıf</dt><dd>%{selected.primaryShare}</dd></div>
                <div><dt>İkinci sınıf</dt><dd>%{selected.secondaryShare}</dd></div>
                <div><dt>Ayrılan</dt><dd>%{selected.reserveShare}</dd></div>
                <div><dt>Ağırlık</dt><dd>{selected.weightStatus}</dd></div>
                <div><dt>Etiket</dt><dd>{selected.labelStatus}</dd></div>
                <div><dt>Pasaport</dt><dd>{selected.passportStatus}</dd></div>
              </dl>
              <p className="uni-note"><strong>Kontrol notu:</strong> {selected.inspectorNote}</p>
              <p className="uni-note"><strong>Düzeltici adım:</strong> {selected.correctiveAction}</p>
              <p className="uni-note uni-note--soft">Bu yüzdeler laboratuvar sonucu değil, temsilî eleme kararını arayüzde göstermenin yoludur.</p>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
