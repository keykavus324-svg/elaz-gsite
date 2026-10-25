import { useMemo, useState } from "react";
import {
  LEARNING_LESSONS,
  LEARNING_LEVELS,
  LEARNING_TRACKS,
  learningProgress,
  type LearningLesson,
} from "../../content/learningPaths";
import {
  UniEmpty,
  UniField,
  UniPagination,
  UniResultMeta,
  UniStat,
  universeMatches,
  universeNumber,
  useStoredStringList,
} from "./shared";

const STORAGE_KEY = "patik-school-completed-v1";

function LessonCard({
  lesson,
  done,
  selected,
  onOpen,
}: {
  lesson: LearningLesson;
  done: boolean;
  selected: boolean;
  onOpen: () => void;
}) {
  return (
    <article className={`uni-card uni-lesson-card${selected ? " is-selected" : ""}${done ? " is-done" : ""}`}>
      <div className="uni-card__topline">
        <span>{lesson.track}</span>
        <em>{done ? "Tamamlandı" : lesson.level}</em>
      </div>
      <h3>{lesson.title}</h3>
      <p>{lesson.objective}</p>
      <div className="uni-chip-row">
        <span>{lesson.estimatedMinutes} dk</span>
        <span>{lesson.badge}</span>
      </div>
      <button type="button" className="btn btn--small btn--ghost" onClick={onOpen}>
        {done ? "Dersi tekrar aç" : "Derse başla"}
      </button>
    </article>
  );
}

export default function LearningSchool() {
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("all");
  const [level, setLevel] = useState("all");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(LEARNING_LESSONS[0]?.id ?? "");
  const [showAnswer, setShowAnswer] = useState(false);
  const { items: completed, toggle: toggleCompleted, clear: clearCompleted } = useStoredStringList(STORAGE_KEY);

  const progress = useMemo(() => learningProgress(completed), [completed]);
  const totalMinutes = LEARNING_LESSONS.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);
  const completedMinutes = LEARNING_LESSONS
    .filter((lesson) => completed.includes(lesson.id))
    .reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);

  const filtered = useMemo(
    () =>
      LEARNING_LESSONS.filter((lesson) => {
        if (track !== "all" && lesson.track !== track) return false;
        if (level !== "all" && lesson.level !== level) return false;
        if (onlyOpen && completed.includes(lesson.id)) return false;
        return universeMatches(
          [lesson.title, lesson.track, lesson.objective, lesson.lessonText, lesson.badge].join(" "),
          query
        );
      }),
    [completed, level, onlyOpen, query, track]
  );

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const selected = filtered.find((lesson) => lesson.id === selectedId) ?? visible[0] ?? filtered[0];
  const selectedDone = selected ? completed.includes(selected.id) : false;

  const trackProgress = useMemo(
    () =>
      LEARNING_TRACKS.map((item) => {
        const lessons = LEARNING_LESSONS.filter((lesson) => lesson.track === item);
        const done = lessons.filter((lesson) => completed.includes(lesson.id)).length;
        return { track: item, done, total: lessons.length, percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
      }),
    [completed]
  );

  function updateFilter<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
      setShowAnswer(false);
    };
  }

  function openLesson(lesson: LearningLesson) {
    setSelectedId(lesson.id);
    setShowAnswer(false);
  }

  function nextOpenLesson() {
    const next = LEARNING_LESSONS.find((lesson) => !completed.includes(lesson.id) && lesson.id !== selected?.id)
      ?? LEARNING_LESSONS.find((lesson) => lesson.id !== selected?.id);
    if (next) {
      setTrack("all");
      setLevel("all");
      setOnlyOpen(false);
      setQuery("");
      setPage(0);
      openLesson(next);
    }
  }

  return (
    <div className="uni-panel">
      <div className="uni-school-hero">
        <div>
          <p className="uni-widget__kicker">Patik Okulu</p>
          <h3>Kayısıyı yalnız yeme, okumayı da öğren.</h3>
          <p>
            12 öğrenme yolunda 120 kısa ders: oku, sayfada uygula, kontrol sorusunun
            cevabını kendin söyle, sonra tamamla. İlerleme yalnızca bu tarayıcıda kalır.
          </p>
        </div>
        <div className="uni-progress-ring" role="img" aria-label={`Öğrenme ilerlemesi yüzde ${progress.percent}`}>
          <strong>%{progress.percent}</strong>
          <span>{progress.done}/{progress.total} ders</span>
        </div>
      </div>

      <div className="uni-stats">
        <UniStat value="12" label="öğrenme yolu" />
        <UniStat value={universeNumber.format(totalMinutes)} label="toplam ders dakikası" />
        <UniStat value={universeNumber.format(completedMinutes)} label="tamamlanan dakika" />
        <UniStat value={universeNumber.format(progress.badges.length)} label="açılan rozet yolu" />
      </div>

      <div className="uni-track-progress" aria-label="Yol bazında ilerleme">
        {trackProgress.map((item) => (
          <button
            key={item.track}
            type="button"
            className={track === item.track ? "is-active" : ""}
            onClick={() => updateFilter(setTrack)(item.track)}
            aria-pressed={track === item.track}
          >
            <span>{item.track}</span>
            <strong>{item.done}/{item.total}</strong>
            <i aria-hidden="true"><b style={{ width: `${item.percent}%` }} /></i>
          </button>
        ))}
      </div>

      <div className="uni-toolbar uni-toolbar--school">
        <UniField label="Ders ara">
          <input type="search" value={query} onChange={(event) => updateFilter(setQuery)(event.target.value)} placeholder="Örn. saklama, jüri, lot kodu" />
        </UniField>
        <UniField label="Öğrenme yolu">
          <select value={track} onChange={(event) => updateFilter(setTrack)(event.target.value)}>
            <option value="all">Tüm yollar</option>
            {LEARNING_TRACKS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </UniField>
        <UniField label="Düzey">
          <select value={level} onChange={(event) => updateFilter(setLevel)(event.target.value)}>
            <option value="all">Tüm düzeyler</option>
            {LEARNING_LEVELS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </UniField>
        <label className="uni-check">
          <input type="checkbox" checked={onlyOpen} onChange={(event) => { setOnlyOpen(event.target.checked); setPage(0); }} />
          Yalnızca açık dersler
        </label>
      </div>

      <UniResultMeta shown={visible.length} total={filtered.length} unit="ders" />

      {filtered.length === 0 || !selected ? (
        <UniEmpty title="Ders bulunamadı" text="Farklı bir yol seç, düzeyi kaldır veya tamamlananları da göster." />
      ) : (
        <div className="uni-split">
          <div>
            <div className="uni-card-grid uni-card-grid--lessons">
              {visible.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  done={completed.includes(lesson.id)}
                  selected={selected.id === lesson.id}
                  onOpen={() => openLesson(lesson)}
                />
              ))}
            </div>
            <UniPagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </div>

          <aside className="uni-detail uni-detail--lesson" aria-labelledby="uni-lesson-title">
            <p className="uni-widget__kicker">{selected.track} · {selected.level}</p>
            <h3 id="uni-lesson-title">{selected.title}</h3>
            <div className="uni-chip-row">
              <span>{selected.estimatedMinutes} dakika</span>
              <span>{selected.badge}</span>
              <span>{selectedDone ? "Tamamlandı" : "Açık ders"}</span>
            </div>

            <h4>Ders hedefi</h4>
            <p>{selected.objective}</p>
            <h4>Kısa ders</h4>
            <p>{selected.lessonText}</p>
            <h4>Sayfada uygula</h4>
            <p>{selected.practiceTask}</p>
            <a className="uni-inline-link" href={selected.anchor}>İlgili bölüme git →</a>

            <div className="uni-check-question">
              <p className="uni-widget__kicker">Kontrol sorusu</p>
              <h4>{selected.checkQuestion}</h4>
              {showAnswer ? (
                <p role="status"><strong>Cevap:</strong> {selected.checkAnswer}</p>
              ) : (
                <button type="button" className="btn btn--small btn--ghost" onClick={() => setShowAnswer(true)}>
                  Cevabı göster
                </button>
              )}
            </div>

            <div className="uni-button-row">
              <button type="button" className="btn btn--small btn--primary" onClick={() => toggleCompleted(selected.id)}>
                {selectedDone ? "Tamamlandı işaretini kaldır" : "Dersi tamamla"}
              </button>
              <button type="button" className="btn btn--small btn--ghost" onClick={nextOpenLesson}>
                Sıradaki açık ders
              </button>
            </div>

            {progress.badges.length > 0 && (
              <div className="uni-badges">
                <h4>Açılan rozet yolları</h4>
                <div>{progress.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>
              </div>
            )}

            <button type="button" className="uni-reset-link" onClick={clearCompleted}>
              Tüm öğrenme ilerlemesini sıfırla
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
