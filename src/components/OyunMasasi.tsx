import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { PROCESS } from "../data";
import { isSoundOn, setSoundOn, sfx } from "../sfx";

/* Ağır oyunlar (204 lot kaydı, 144 bilgi sorusu) yalnızca oynanırken
   ayrı paketten gelir; ana sayfa ilk açılışta şişmez. */
const LotPusulasi = lazy(() => import("./oyun/LotPusulasi"));
const PatikLigi = lazy(() => import("./oyun/PatikLigi"));

/* ------------------------------------------------------------------ */
/*  Ortak parçalar                                                     */
/* ------------------------------------------------------------------ */

/** Geriye sayan saat. Bittiğinde `onEnd` bir kez çağrılır. */
function useCountdown(seconds: number, running: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useEffect(() => {
    if (!running) return;
    setLeft(seconds);
    const started = Date.now();
    const timer = window.setInterval(() => {
      const remaining = seconds - (Date.now() - started) / 1000;
      if (remaining <= 0) {
        setLeft(0);
        window.clearInterval(timer);
        endRef.current();
      } else {
        setLeft(remaining);
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [running, seconds]);

  return left;
}

function GameShell({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="oyun__shell">
      <p className="oyun__shell-label">{label}</p>
      {children}
    </div>
  );
}

function ResultCard({
  title,
  note,
  rows,
  onRestart,
  restartLabel = "Tekrar oyna",
}: {
  title: string;
  note: string;
  rows: Array<[string, string]>;
  onRestart: () => void;
  restartLabel?: string;
}) {
  return (
    <div className="oyun__result">
      <p className="oyun__result-kicker">Sonuç</p>
      <h4 className="oyun__result-title">{title}</h4>
      <p className="oyun__result-note">{note}</p>
      <dl className="oyun__result-rows">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="btn btn--primary oyun__restart" onClick={onRestart}>
        {restartLabel} <span aria-hidden="true">↻</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  1) İslim mi Gün mü — Düello                                       */
/* ------------------------------------------------------------------ */

type Side = "gun" | "islim";
type DuelRound = { text: string; answer: Side; note: string };

const DUEL: DuelRound[] = [
  { text: "İslim damı görmeden, doğrudan güneşte kurur.", answer: "gun", note: "Gün kurusu: islim uygulanmadan sergide kurutulur." },
  { text: "Kükürt odasında yaklaşık bir gün bekler, rengi korunur.", answer: "islim", note: "İslimli: önce islim damı, sonra sergi." },
  { text: "Tadı yoğun ve karamelimsi; çayın yanına gider.", answer: "gun", note: "Gün kurusunun tat profili yoğunlaşır." },
  { text: "Dokusu daha diri; hediye kutusunda öne çıkar.", answer: "islim", note: "İslimli: diri doku ve canlı renk." },
  { text: "Rengi taze kayısının rengine en yakın hâldir.", answer: "islim", note: "İslim damı rengi korur." },
  { text: "Saklaması daha zordur; önce bu kutuyu tüketin.", answer: "gun", note: "Gün kurusu serin, kuru, ağzı kapalı ister." },
  { text: "İlk kuruma yaklaşık iki gün sürer.", answer: "islim", note: "İslim damından çıkan kayısı sergide iki gün kurur." },
  { text: "Elde yumuşayıp lokum gibi kolayca kopar.", answer: "gun", note: "Gün kurusunun dokusu yumuşaktır." },
  { text: "Kutuya girdiği andan itibaren parlak turuncu kalır.", answer: "islim", note: "İslimli: canlı turuncu renk." },
  { text: "Baskil'de üretimin büyük kısmı bu yolla yapılır.", answer: "islim", note: "İslim damı, üretimin ağırlıklı yoludur." },
  { text: "Koyu kahve-amber rengi beklenen sonuçtur.", answer: "gun", note: "Gün kurusunun koyulaşması doğasındandır." },
  { text: "Yumuşak, lokum gibi; elinizde kolayca kopar.", answer: "gun", note: "Gün kurusu: yumuşak doku." },
];

const DUEL_SECONDS = 16;

function Duel() {
  const [phase, setPhase] = useState<"idle" | "play" | "done">("idle");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [picked, setPicked] = useState<Side | null>(null);
  const [shake, setShake] = useState(false);

  const finish = useCallback(() => {
    setPhase("done");
    sfx("win");
  }, []);

  const left = useCountdown(DUEL_SECONDS, phase === "play", finish);
  const round = DUEL[index % DUEL.length];

  const start = () => {
    setPhase("play");
    setIndex(0);
    setScore(0);
    setCombo(0);
    setBest(0);
    setWrong(0);
    setPicked(null);
    sfx("click");
  };

  const answer = useCallback(
    (side: Side) => {
      if (phase !== "play" || picked) return;
      setPicked(side);
      if (side === round.answer) {
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        setBest((b) => Math.max(b, nextCombo));
        setScore((s) => s + (nextCombo >= 3 ? 2 : 1));
        sfx("good");
      } else {
        setWrong((w) => w + 1);
        setCombo(0);
        setShake(true);
        sfx("bad");
        window.setTimeout(() => setShake(false), 420);
      }
      window.setTimeout(() => {
        setPicked(null);
        setIndex((i) => i + 1);
      }, 620);
    },
    [phase, picked, round.answer, combo]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (phase !== "play") return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        answer("gun");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        answer("islim");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, answer]);

  if (phase === "idle") {
    return (
      <GameShell label="Düello · 16 saniye">
        <div className="oyun__intro">
          <h3 className="oyun__intro-title">İslim mi, Gün mü?</h3>
          <p className="oyun__intro-text">
            Ekrandaki cümle hangi kayısıya ait? <kbd>←</kbd> gün kurusu, <kbd>→</kbd> islimli.
            Üç üst üste doğru cevap, bonus puan.
          </p>
          <button type="button" className="btn btn--primary btn--large" onClick={start}>
            Düelloyu başlat <span aria-hidden="true">→</span>
          </button>
        </div>
      </GameShell>
    );
  }

  if (phase === "done") {
    const accuracy = score + wrong === 0 ? 0 : Math.round((score / (score + wrong)) * 100);
    const title =
      score >= 12 ? "Mükemmel ayrım" : score >= 8 ? "Koku ustası" : score >= 4 ? "Patik çırağı" : "Patik yeni";
    return (
      <GameShell label="Düello · bitti">
        <ResultCard
          title={title}
          note={`${DUEL.length} iddianın hepsini birbirinden ayırdın. Jüri ekrana bakarken bu ayrımı bir cümlede anlatabilmelisin.`}
          rows={[
            ["Puan", String(score)],
            ["Doğruluk", `%${accuracy}`],
            ["En uzun seri", String(best)],
            ["Yanlış", String(wrong)],
          ]}
          onRestart={start}
        />
      </GameShell>
    );
  }

  const right = picked === round.answer;
  return (
    <GameShell label="Düello · 16 saniye">
      <div className="oyun__hud">
        <div className="oyun__stat">
          <span>Skor</span>
          <strong>{score}</strong>
        </div>
        <div className="oyun__stat">
          <span>Seri</span>
          <strong>{combo > 0 ? `×${combo}` : "—"}</strong>
        </div>
        <div className="oyun__stat oyun__stat--time">
          <span>Kalan</span>
          <strong>{left.toFixed(1)} sn</strong>
        </div>
      </div>
      <div className="oyun__timebar" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(0, left / DUEL_SECONDS)})` }} />
      </div>

      <div className={`duel${shake ? " is-shake" : ""}`}>
        <p className="duel__claim">“{round.text}”</p>
        <div className="duel__choices">
          <button
            type="button"
            className={`duel__choice duel__choice--gun${picked === "gun" ? (right ? " is-right" : " is-wrong") : ""}`}
            onClick={() => answer("gun")}
            disabled={Boolean(picked)}
          >
            <span className="duel__key" aria-hidden="true">←</span>
            <span className="duel__name">Gün kurusu</span>
          </button>
          <button
            type="button"
            className={`duel__choice duel__choice--islim${picked === "islim" ? (right ? " is-right" : " is-wrong") : ""}`}
            onClick={() => answer("islim")}
            disabled={Boolean(picked)}
          >
            <span className="duel__name">İslimli</span>
            <span className="duel__key" aria-hidden="true">→</span>
          </button>
        </div>
        {picked && (
          <p className={`duel__note${right ? " is-right" : " is-wrong"}`}>
            {right ? "Doğru — " : "Doğru cevap: "}
            {round.answer === "gun" ? "Gün kurusu. " : "İslimli. "}
            {round.note}
          </p>
        )}
      </div>
    </GameShell>
  );
}

/* ------------------------------------------------------------------ */
/*  2) Patik Yolu — altı durak                                        */
/* ------------------------------------------------------------------ */

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function PatikYolu() {
  const [order, setOrder] = useState<number[]>(() => shuffle(PROCESS.map((_, i) => i)));
  const [step, setStep] = useState(0);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const start = () => {
    setOrder(shuffle(PROCESS.map((_, i) => i)));
    setStep(0);
    setDone(false);
    setWrongIdx(null);
    sfx("click");
  };

  const choose = (i: number) => {
    if (done || wrongIdx !== null) return;
    if (i === step) {
      setWrongIdx(null);
      if (step + 1 >= PROCESS.length) {
        setDone(true);
        sfx("win");
      } else {
        sfx("good");
        setStep((s) => s + 1);
      }
    } else {
      setWrongIdx(i);
      sfx("bad");
      window.setTimeout(() => setWrongIdx(null), 460);
    }
  };

  if (done) {
    return (
      <GameShell label="Patik Yolu · tamamlandı">
        <ResultCard
          title="Yol boyunca oturdu"
          note="Altı durak, altı gün: hasattan kutuya. Patik'in adı da bu yolun ortasında doğdu."
          rows={PROCESS.map((p) => [p.no, p.title])}
          onRestart={start}
          restartLabel="Yolu yeniden kur"
        />
      </GameShell>
    );
  }

  return (
    <GameShell label="Patik Yolu · altı durak">
      <div className="oyun__hud">
        <div className="oyun__stat">
          <span>Durak</span>
          <strong>
            {step + 1} / {PROCESS.length}
          </strong>
        </div>
        <div className="oyun__stat">
          <span>Sıradaki</span>
          <strong className="oyun__stat--text">{PROCESS[step].title}</strong>
        </div>
      </div>

      <ol className="yol__track" aria-label="Doğru sıra">
        {PROCESS.map((p, i) => (
          <li key={p.no} className={i < step ? "is-done" : i === step ? "is-now" : ""}>
            <span>{p.no}</span>
            <strong>{p.title}</strong>
          </li>
        ))}
      </ol>

      <p className="yol__prompt">
        Sıradaki durak hangisi? <span>({PROCESS[step].chip} ipucu)</span>
      </p>

      <div className="yol__cards">
        {order.map((processIndex, position) => {
          const p = PROCESS[processIndex];
          const isNext = processIndex === step;
          return (
            <button
              key={`${p.no}-${position}`}
              type="button"
              className={`yol__card${wrongIdx === position ? " is-wrong" : ""}${isNext ? " is-hint" : ""}`}
              onClick={() => choose(processIndex)}
              disabled={wrongIdx !== null}
            >
              <span className="yol__card-no">{p.no}</span>
              <span className="yol__card-title">{p.title}</span>
              <span className="yol__card-kicker">{p.kicker}</span>
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Bölüm kabuğu                                                       */
/* ------------------------------------------------------------------ */

type GameId = "duel" | "yol" | "pusula" | "ligi";

const GAMES: Array<{ id: GameId; label: string; hint: string }> = [
  { id: "duel", label: "İslim mi Gün mü", hint: "16 sn · ← → tuşları" },
  { id: "yol", label: "Patik Yolu", hint: "6 durak · sıralama" },
  { id: "pusula", label: "Lot Pusulası", hint: "204 kayıttan bul" },
  { id: "ligi", label: "Patik Ligi", hint: "60 sn · skor tablosu" },
];

export default function OyunMasasi() {
  const [game, setGame] = useState<GameId>("duel");
  const [sound, setSound] = useState(isSoundOn());

  const switchGame = (id: GameId) => {
    setGame(id);
    sfx("click");
  };

  const stage = useMemo(() => {
    switch (game) {
      case "duel":
        return <Duel />;
      case "yol":
        return <PatikYolu />;
      case "pusula":
        return (
          <Suspense fallback={<p className="oyun__loading">204 lot kaydı yükleniyor…</p>}>
            <LotPusulasi />
          </Suspense>
        );
      case "ligi":
        return (
          <Suspense fallback={<p className="oyun__loading">144 bilgi sorusu yükleniyor…</p>}>
            <PatikLigi />
          </Suspense>
        );
      default:
        return null;
    }
  }, [game]);

  return (
    <section className="section night oyun" id="oyun-masasi" aria-labelledby="oyun-baslik">
      <div className="section__head">
        <p className="kicker">Gece sergisi · oyun masası</p>
        <h2 id="oyun-baslik">Kutuyu anlamanın en eğlenceli yolu</h2>
        <p className="section__lede">
          Dört oyun, dört ayrı ders — hepsi sitedeki gerçek veriyle çalışır: altı üretim durağı,
          204 lot kaydı, 144 bilgi sorusu. Klavye de çalışır, fare de.
        </p>
      </div>

      <div className="oyun__bar">
        <div className="oyun__tabs" role="group" aria-label="Oyun seçimi">
          {GAMES.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`oyun__tab${game === g.id ? " is-active" : ""}`}
              aria-pressed={game === g.id}
              onClick={() => switchGame(g.id)}
            >
              <span className="oyun__tab-name">{g.label}</span>
              <span className="oyun__tab-hint">{g.hint}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="oyun__sound"
          aria-pressed={sound}
          onClick={() => {
            const next = !sound;
            setSound(next);
            setSoundOn(next);
            if (next) sfx("click");
          }}
        >
          <span aria-hidden="true">{sound ? "♪" : "♪̸"}</span> Ses {sound ? "açık" : "kapalı"}
        </button>
      </div>

      <div className="oyun__stage">{stage}</div>
    </section>
  );
}
