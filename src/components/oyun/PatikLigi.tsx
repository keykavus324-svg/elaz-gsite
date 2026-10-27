import { useCallback, useEffect, useRef, useState } from "react";
import { QUIZ_BANK } from "../../content/quizBank";
import { sfx } from "../../sfx";

/**
 * Patik Ligi — 60 saniyelik bilgi blitzi + kalıcı skor tablosu.
 *
 * Sorular src/content/quizBank.ts'teki 145 soruluk gerçek bankadan gelir.
 * Skor tablosu yalnızca tarayıcının kendi deposunda tutulur; sunucuya
 * hiçbir veri gitmez (demo sitesi olduğu için de uygun).
 */

const LIGI_SECONDS = 60;
const STORAGE_KEY = "patik-ligi-v1";
const TOP_N = 8;

type Score = { name: string; score: number; at: number };

function loadBoard(): Score[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row): row is Score => typeof row?.name === "string" && typeof row?.score === "number")
      .slice(0, TOP_N);
  } catch {
    return [];
  }
}

function saveBoard(rows: Score[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, TOP_N)));
  } catch {
    /* yoksay */
  }
}

function shuffled<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const POINTS: Record<string, number> = { Kolay: 10, Orta: 15, Zor: 20 };

export default function PatikLigi() {
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState(() => shuffled(QUIZ_BANK).slice(0, 40));
  const [qIndex, setQIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [left, setLeft] = useState(LIGI_SECONDS);
  const [board, setBoard] = useState<Score[]>([]);
  const [saved, setSaved] = useState(false);
  const advanceRef = useRef<number | null>(null);

  const finish = useCallback(() => {
    setPhase("over");
    setBoard(loadBoard());
    sfx("win");
  }, []);

  const start = useCallback(() => {
    setQuestions(shuffled(QUIZ_BANK).slice(0, 40));
    setQIndex(0);
    setChosen(null);
    setScore(0);
    setCombo(0);
    setBest(0);
    setCorrectCount(0);
    setLeft(LIGI_SECONDS);
    setSaved(false);
    setPhase("play");
    sfx("click");
  }, []);

  useEffect(() => {
    if (phase !== "play") return;
    const timer = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 0.1) {
          window.clearInterval(timer);
          finish();
          return 0;
        }
        return v - 0.1;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, finish]);

  useEffect(
    () => () => {
      if (advanceRef.current) window.clearTimeout(advanceRef.current);
    },
    []
  );

  const answer = (index: number) => {
    if (phase !== "play" || chosen !== null) return;
    const q = questions[qIndex];
    if (!q) return;
    setChosen(index);
    if (index === q.answerIndex) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setBest((b) => Math.max(b, nextCombo));
      setCorrectCount((c) => c + 1);
      setScore((s) => s + (POINTS[q.difficulty] ?? 10) + Math.min(10, (nextCombo - 1) * 2));
      sfx("good");
    } else {
      setCombo(0);
      sfx("bad");
    }
    advanceRef.current = window.setTimeout(() => {
      setChosen(null);
      setQIndex((i) => i + 1);
    }, 1150);
  };

  const register = () => {
    const clean = name.trim().slice(0, 18) || "Misafir";
    const rows = loadBoard();
    rows.push({ name: clean, score, at: Date.now() });
    rows.sort((a, b) => b.score - a.score || a.at - b.at);
    saveBoard(rows);
    setBoard(loadBoard());
    setSaved(true);
    sfx("stamp");
  };

  if (phase === "idle") {
    return (
      <div className="oyun__shell">
        <p className="oyun__shell-label">Patik Ligi · 60 saniye</p>
        <div className="oyun__intro">
          <h3 className="oyun__intro-title">Altmış saniyede Patik</h3>
          <p className="oyun__intro-text">
            {QUIZ_BANK.length} soruluk gerçek bilgi bankasından gelen sorular; zorluk seviyesi
            puanı belirler, seri puanı büyütür. En yüksek 8 skor bu tarayıcıda kalır.
          </p>
          <label className="oyun__field">
            <span>Takma adın</span>
            <input
              type="text"
              value={name}
              maxLength={18}
              placeholder="Örn. Jüri 1"
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <button type="button" className="btn btn--primary btn--large" onClick={start}>
            Ligi başlat <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    );
  }

  if (phase === "over") {
    const title =
      score >= 400 ? "Efsane" : score >= 260 ? "Patik ustası" : score >= 140 ? "Bilgi avcısı" : "Çırak";
    return (
      <div className="oyun__shell">
        <p className="oyun__shell-label">Patik Ligi · bitti</p>
        <div className="oyun__result">
          <p className="oyun__result-kicker">Final skoru</p>
          <h4 className="oyun__result-title">{title}</h4>
          <p className="oyun__result-note">
            {correctCount} doğru cevap, en uzun seri {best}. Skor tablosu yalnızca bu tarayıcıda
            saklanır; sunucuya hiçbir şey gitmez.
          </p>
          <dl className="oyun__result-rows">
            <div>
              <dt>Skor</dt>
              <dd>{score}</dd>
            </div>
            <div>
              <dt>Doğru</dt>
              <dd>{correctCount}</dd>
            </div>
            <div>
              <dt>En uzun seri</dt>
              <dd>{best}</dd>
            </div>
          </dl>

          {!saved ? (
            <div className="ligi__save">
              <label className="oyun__field">
                <span>Takma adın</span>
                <input
                  type="text"
                  value={name}
                  maxLength={18}
                  placeholder="Örn. Jüri 1"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <button type="button" className="btn btn--primary" onClick={register}>
                Skoru tabloya yaz
              </button>
            </div>
          ) : (
            <p className="ligi__saved">Skorun tabloya yazıldı. Sıralama aşağıda.</p>
          )}

          {board.length > 0 && (
            <ol className="ligi__board" aria-label="Patik Ligi skor tablosu">
              {board.map((row, i) => (
                <li key={`${row.name}-${row.at}`} className={row.score === score && row.at === board[0]?.at ? "" : ""}>
                  <span className="ligi__rank">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ligi__who">{row.name}</span>
                  <span className="ligi__points">{row.score}</span>
                </li>
              ))}
            </ol>
          )}

          <button type="button" className="btn btn--primary oyun__restart" onClick={start}>
            Yeni tur <span aria-hidden="true">↻</span>
          </button>
        </div>
      </div>
    );
  }

  const q = questions[qIndex];
  if (!q) return <p className="oyun__loading">Sorular hazırlanıyor…</p>;

  return (
    <div className="oyun__shell">
      <p className="oyun__shell-label">
        Patik Ligi · soru {Math.min(qIndex + 1, questions.length)} / {questions.length}
      </p>

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
          <strong>{Math.ceil(left)} sn</strong>
        </div>
      </div>
      <div className="oyun__timebar" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(0, left / LIGI_SECONDS)})` }} />
      </div>

      <div className="ligi__q">
        <p className="ligi__meta">
          <span className="ligi__cat">{q.category}</span>
          <span className="ligi__diff">{q.difficulty}</span>
          <span className="ligi__points-hint">+{POINTS[q.difficulty] ?? 10}</span>
        </p>
        <h4 className="ligi__question">{q.question}</h4>
        <div className="ligi__options">
          {q.options.map((option, i) => {
            const stateClass =
              chosen === null
                ? ""
                : i === q.answerIndex
                  ? " is-right"
                  : chosen === i
                    ? " is-wrong"
                    : "";
            return (
              <button
                key={option}
                type="button"
                className={`ligi__option${stateClass}`}
                onClick={() => answer(i)}
                disabled={chosen !== null}
              >
                <span className="ligi__option-key" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
        {chosen !== null && (
          <p className={`ligi__explain${chosen === q.answerIndex ? " is-right" : " is-wrong"}`}>
            {chosen === q.answerIndex ? "Doğru. " : "Doğru cevap: "}
            {q.explanation}
          </p>
        )}
      </div>
    </div>
  );
}
