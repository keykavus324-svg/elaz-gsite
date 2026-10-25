import { useMemo, useState } from "react";
import { LOT_LEDGER, summarizeLedger, type LedgerLot } from "../../content/lotLedger";
import {
  PARCEL_CLUSTERS,
  PARCEL_METHOD_LABELS,
  PARCEL_PROFILES,
  type ParcelProfile,
} from "../../content/parcelProfiles";
import {
  UniBar,
  UniField,
  UniStat,
  formatUniverseKg,
  percent,
  universeNumber,
} from "./shared";

type MethodFilter = "all" | LedgerLot["method"];
type WeekBand = "all" | "early" | "late";

const METHOD_META: Record<LedgerLot["method"], { label: string; color: string; tone: "sun" | "leaf" | "river" }> = {
  gun: { label: "Gün kurusu", color: "#b5501b", tone: "sun" },
  islimli: { label: "İslimli", color: "#e8762c", tone: "leaf" },
  cekirdek: { label: "Çekirdek", color: "#2e6e6a", tone: "river" },
};

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function groupBy<T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

function Donut({ lots }: { lots: LedgerLot[] }) {
  const total = Math.max(1, lots.length);
  const counts = (Object.keys(METHOD_META) as LedgerLot["method"][]).map((method) => ({
    method,
    count: lots.filter((lot) => lot.method === method).length,
  }));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="uni-donut-wrap">
      <svg className="uni-donut" viewBox="0 0 160 160" role="img" aria-labelledby="uni-donut-title uni-donut-desc">
        <title id="uni-donut-title">Yöntem dağılımı</title>
        <desc id="uni-donut-desc">Filtrelenen temsilî lotların gün, islimli ve çekirdek yöntemlerine dağılımı</desc>
        <circle cx="80" cy="80" r={radius} className="uni-donut__track" />
        {counts.map(({ method, count }) => {
          const fraction = count / total;
          const dash = fraction * circumference;
          const rotation = -90 + cumulative * 360;
          cumulative += fraction;
          return (
            <circle
              key={method}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={METHOD_META[method].color}
              strokeWidth="20"
              strokeDasharray={`${Math.max(0, dash - 2)} ${Math.max(0, circumference - dash + 2)}`}
              transform={`rotate(${rotation} 80 80)`}
            />
          );
        })}
        <text x="80" y="76" textAnchor="middle" className="uni-donut__number">{lots.length}</text>
        <text x="80" y="96" textAnchor="middle" className="uni-donut__label">lot</text>
      </svg>
      <ul className="uni-legend">
        {counts.map(({ method, count }) => (
          <li key={method}>
            <span style={{ background: METHOD_META[method].color }} aria-hidden="true" />
            <strong>{METHOD_META[method].label}</strong>
            <em>{count} · %{percent(count, total)}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OperationsDashboard() {
  const [method, setMethod] = useState<MethodFilter>("all");
  const [weekBand, setWeekBand] = useState<WeekBand>("all");
  const [selectedParcelId, setSelectedParcelId] = useState(PARCEL_PROFILES[0]?.id ?? "");
  const [cluster, setCluster] = useState("all");

  const filteredLots = useMemo(
    () =>
      LOT_LEDGER.filter((lot) => {
        if (method !== "all" && lot.method !== method) return false;
        if (weekBand === "early" && lot.harvestWeek > 30) return false;
        if (weekBand === "late" && lot.harvestWeek < 31) return false;
        return true;
      }),
    [method, weekBand]
  );

  const summary = summarizeLedger(filteredLots);
  const conversion = summary.inputKg ? (summary.outputKg / summary.inputKg) * 100 : 0;

  const weekly = useMemo(() => {
    const groups = groupBy(filteredLots, (lot) => String(lot.harvestWeek));
    return [...groups.entries()]
      .map(([week, lots]) => ({
        week: Number(week),
        lots: lots.length,
        outputKg: sum(lots.map((lot) => lot.outputKg)),
        boxes: sum(lots.map((lot) => lot.boxCount)),
      }))
      .sort((a, b) => a.week - b.week);
  }, [filteredLots]);

  const parcelRanking = useMemo(() => {
    const groups = groupBy(filteredLots, (lot) => lot.parcel);
    return [...groups.entries()]
      .map(([parcel, lots]) => ({
        parcel,
        lots: lots.length,
        outputKg: sum(lots.map((lot) => lot.outputKg)),
        boxes: sum(lots.map((lot) => lot.boxCount)),
      }))
      .sort((a, b) => b.outputKg - a.outputKg)
      .slice(0, 7);
  }, [filteredLots]);

  const methodRows = useMemo(
    () =>
      (Object.keys(METHOD_META) as LedgerLot["method"][]).map((item) => {
        const lots = filteredLots.filter((lot) => lot.method === item);
        const methodSummary = summarizeLedger(lots);
        return {
          method: item,
          label: METHOD_META[item].label,
          tone: METHOD_META[item].tone,
          count: lots.length,
          outputKg: methodSummary.outputKg,
          boxes: methodSummary.boxCount,
          conversion: methodSummary.inputKg ? (methodSummary.outputKg / methodSummary.inputKg) * 100 : 0,
        };
      }),
    [filteredLots]
  );

  const visibleProfiles = useMemo(
    () => PARCEL_PROFILES.filter((profile) => cluster === "all" || profile.cluster === cluster),
    [cluster]
  );
  const selectedProfile: ParcelProfile =
    visibleProfiles.find((profile) => profile.id === selectedParcelId) ?? visibleProfiles[0] ?? PARCEL_PROFILES[0];

  const busiestWeek = weekly.reduce((best, item) => (item.boxes > (best?.boxes ?? -1) ? item : best), weekly[0]);
  const maxWeeklyOutput = Math.max(1, ...weekly.map((item) => item.outputKg));
  const maxParcelOutput = Math.max(1, ...parcelRanking.map((item) => item.outputKg));
  const maxMethodOutput = Math.max(1, ...methodRows.map((item) => item.outputKg));

  return (
    <div className="uni-panel">
      <div className="uni-toolbar uni-toolbar--dashboard">
        <UniField label="Yöntem görünümü">
          <select value={method} onChange={(event) => setMethod(event.target.value as MethodFilter)}>
            <option value="all">Tüm yöntemler</option>
            <option value="gun">Gün kurusu</option>
            <option value="islimli">İslimli</option>
            <option value="cekirdek">Çekirdek</option>
          </select>
        </UniField>
        <UniField label="Hasat penceresi">
          <select value={weekBand} onChange={(event) => setWeekBand(event.target.value as WeekBand)}>
            <option value="all">28–34. haftalar</option>
            <option value="early">Erken pencere · 28–30</option>
            <option value="late">Geç pencere · 31–34</option>
          </select>
        </UniField>
        <div className="uni-callout">
          <strong>Bu pano temsilî defterden hesaplanır.</strong>
          <p>Gerçek üretim iddiası değildir; arayüzün ölçekte nasıl karar destekleyebileceğini gösterir.</p>
        </div>
      </div>

      <div className="uni-stats">
        <UniStat value={universeNumber.format(summary.count)} label="filtrelenen lot" />
        <UniStat value={formatUniverseKg(summary.inputKg)} label="temsili girdi" />
        <UniStat value={formatUniverseKg(summary.outputKg)} label="temsili çıktı" hint={`dönüşüm %${conversion.toFixed(1).replace(".", ",")}`} />
        <UniStat value={universeNumber.format(summary.boxCount)} label="kutu karşılığı" />
      </div>

      <div className="uni-dashboard-grid">
        <article className="uni-widget">
          <p className="uni-widget__kicker">Yöntem karması</p>
          <h3>Lotlar nasıl dağılıyor?</h3>
          <Donut lots={filteredLots} />
        </article>

        <article className="uni-widget">
          <p className="uni-widget__kicker">Hasat ritmi</p>
          <h3>Haftalara göre çıktı</h3>
          <div className="uni-bars">
            {weekly.map((item) => (
              <UniBar key={item.week} label={`${item.week}. hafta · ${item.lots} lot`} value={item.outputKg} max={maxWeeklyOutput} suffix="kg" />
            ))}
          </div>
          {busiestWeek && (
            <p className="uni-insight">
              En yoğun kutu karşılığı <strong>{busiestWeek.week}. haftada</strong> görünüyor:
              {universeNumber.format(busiestWeek.boxes)} kutu.
            </p>
          )}
        </article>

        <article className="uni-widget">
          <p className="uni-widget__kicker">Yöntem çıktısı</p>
          <h3>Hangi yol ne taşıyor?</h3>
          <div className="uni-bars">
            {methodRows.map((row) => (
              <UniBar key={row.method} label={`${row.label} · ${row.count} lot`} value={row.outputKg} max={maxMethodOutput} suffix="kg" tone={row.tone} />
            ))}
          </div>
          <ul className="uni-compact-list">
            {methodRows.map((row) => (
              <li key={row.method}>
                <strong>{row.label}:</strong> {universeNumber.format(row.boxes)} kutu · dönüşüm %{row.conversion.toFixed(1).replace(".", ",")}
              </li>
            ))}
          </ul>
          <p className="uni-insight">Çekirdek dönüşümü meyve kurusuyla aynı anlamı taşımaz; ürün tipi farklı olduğu için yan yana kalite sıralaması yapılmamalıdır.</p>
        </article>

        <article className="uni-widget">
          <p className="uni-widget__kicker">Parsel sıralaması</p>
          <h3>Defterde öne çıkan parseller</h3>
          <div className="uni-bars">
            {parcelRanking.map((item) => (
              <UniBar key={item.parcel} label={`${item.parcel} · ${item.lots} lot`} value={item.outputKg} max={maxParcelOutput} suffix="kg" tone="pit" />
            ))}
          </div>
        </article>
      </div>

      <div className="uni-section-head">
        <div>
          <p className="uni-widget__kicker">Teras haritası · 48 temsilî blok</p>
          <h3>Parseli haritadan seç</h3>
          <p>Bu soyut teras ızgarası gerçek arazi haritası değildir; blok kodu, hasat sırası ve tercih edilen yöntemi birlikte okumak için tasarlandı.</p>
        </div>
        <UniField label="Küme">
          <select value={cluster} onChange={(event) => setCluster(event.target.value)}>
            <option value="all">Tüm kümeler</option>
            {PARCEL_CLUSTERS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </UniField>
      </div>

      <div className="uni-split">
        <div className="uni-terrace-map" role="group" aria-label="Temsilî parsel blokları">
          {visibleProfiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              className={`uni-terrace-cell is-${profile.preferredMethod}${selectedProfile.id === profile.id ? " is-selected" : ""}`}
              onClick={() => setSelectedParcelId(profile.id)}
              aria-pressed={selectedProfile.id === profile.id}
              aria-label={`${profile.name}, hasat sırası ${profile.harvestOrder}`}
            >
              <strong>{profile.code}</strong>
              <span>{profile.cluster}</span>
              <small>Sıra {profile.harvestOrder} · {profile.rowCount} hat</small>
            </button>
          ))}
        </div>

        <aside className="uni-detail" aria-labelledby="uni-parcel-title">
          <p className="uni-widget__kicker">{selectedProfile.code} · temsilî blok profili</p>
          <h3 id="uni-parcel-title">{selectedProfile.name}</h3>
          <p>{selectedProfile.location}</p>
          <dl className="uni-detail-dl">
            <div><dt>Teras</dt><dd>{selectedProfile.terraceLevel}. basamak · {selectedProfile.slope}</dd></div>
            <div><dt>Sıra / yaş</dt><dd>{selectedProfile.rowCount} sıra · {selectedProfile.treeAgeBand}</dd></div>
            <div><dt>Güneş</dt><dd>{selectedProfile.sunExposure}</dd></div>
            <div><dt>Erişim</dt><dd>{selectedProfile.access}</dd></div>
            <div><dt>Su notu</dt><dd>{selectedProfile.waterNote}</dd></div>
            <div><dt>Zemin notu</dt><dd>{selectedProfile.soilNote}</dd></div>
            <div><dt>Yöntem eğilimi</dt><dd>{PARCEL_METHOD_LABELS[selectedProfile.preferredMethod]}</dd></div>
            <div><dt>Hasat sırası</dt><dd>{selectedProfile.harvestOrder}. grup</dd></div>
          </dl>
          <h4>Güçlü taraflar</h4>
          <ul>{selectedProfile.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
          <h4>İzlenecekler</h4>
          <ul>{selectedProfile.watchouts.map((item) => <li key={item}>{item}</li>)}</ul>
          <p className="uni-note"><strong>Kayıt odağı:</strong> {selectedProfile.recordFocus}</p>
          <p className="uni-note"><strong>İstasyon:</strong> {selectedProfile.stationNote}</p>
        </aside>
      </div>
    </div>
  );
}
