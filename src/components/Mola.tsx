import { useCallback, useEffect, useRef, useState } from "react";

/* ================================================================== */
/*  ÇAY MOLASI — Elazığ radyosu + iki mini oyun                       */
/*  Yayın adresleri ve kaynakları: KAYNAKLAR.md § Radyo               */
/* ================================================================== */

interface Station {
  id: string;
  name: string;
  tag: string;
  note: string;
  src: string | null; // null = yalnızca resmî siteden
  hls?: boolean;
  site: string;
}

const STATIONS: Station[] = [
  {
    id: "trt-turku",
    name: "TRT Türkü",
    tag: "Türküler · canlı yayın",
    note: "Harput'tan da eserler çalan, TRT'nin halk müziği kanalı",
    src: "https://rd-trtturku.medya.trt.com.tr/master_128.m3u8",
    hls: true,
    site: "https://www.trtdinle.com/channel/trt-turku-turk-halk-muzigi",
  },
  {
    id: "fm23",
    name: "Radyo FM 23",
    tag: "Elazığ yerel · 88.8 / 93.5 FM",
    note: "Doruk Medya'nın Elazığ radyosu (plaka gibi ismi var: 23!)",
    src: "http://radyofm23.canliyayinda.com:8280/",
    site: "https://www.radyofm23.com/",
  },
  {
    id: "firat",
    name: "Radyo Fırat",
    tag: "Fırat Üniversitesi · 89.2 · 06.00–24.00",
    note: "Üniversitenin radyosu; gömülü akışı olmadığı için resmî siteden açıyoruz",
    src: null,
    site: "https://radyo.firat.edu.tr/",
  },
];

type RadioStatus = "idle" | "loading" | "playing" | "paused" | "error";

function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);
  const sessionRef = useRef(0); // istasyon degisiminde eski play() hatalarinin yenisini ezmesini engeller
  const [stationId, setStationId] = useState<string>("trt-turku");
  const [status, setStatus] = useState<RadioStatus>("idle");
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const station = STATIONS.find((s) => s.id === stationId) ?? STATIONS[0];

  const teardown = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    hlsRef.current?.destroy();
    hlsRef.current = null;
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
      a.load();
    }
  }, []);

  useEffect(() => teardown, [teardown]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  async function play(st: Station) {
    const a = audioRef.current;
    if (!a || !st.src) return;
    const session = ++sessionRef.current;
    teardown();
    setStationId(st.id);
    setStatus("loading");
    setErrorMsg("");
    a.volume = muted ? 0 : volume;

    timeoutRef.current = window.setTimeout(() => {
      setStatus((s) => {
        if (s === "loading") {
          setErrorMsg("Yayına bağlanmak uzun sürdü. İnternetini kontrol et ya da resmî siteden dinle — o her zaman çalışır.");
          return "error";
        }
        return s;
      });
    }, 14000);

    try {
      if (st.hls && !a.canPlayType("application/vnd.apple.mpegurl")) {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          const hls = new Hls({ maxBufferLength: 30 });
          hlsRef.current = hls;
          hls.loadSource(st.src);
          hls.attachMedia(a);
          hls.on(Hls.Events.ERROR, (_evt, data) => {
            if (data?.fatal && session === sessionRef.current) onError(st);
          });
        } else {
          a.src = st.src;
        }
      } else {
        a.src = st.src;
      }
      await a.play();
      try {
        if ("mediaSession" in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: st.name,
            artist: "Patik · Çay Molası",
            album: "Baskil'den canlı",
          });
        }
      } catch { /* medya oturumu opsiyonel */ }
    } catch {
      if (session === sessionRef.current) onError(st);
    }
  }

  function onError(st: Station) {
    window.clearTimeout(timeoutRef.current);
    setStatus("error");
    setErrorMsg(
      st.id === "fm23"
        ? "Tarayıcı bu yayını güvenli bağlantı (HTTPS) politikası yüzünden burada açamadı. Aşağıdaki 'resmî sitede dinle' düğmesi her zaman çalışır."
        : "Yayın şu anda açılamadı. İstasyonun resmî sitesinden dinleyebilirsin; sitenin geri kalanı çevrimdışı da çalışır."
    );
  }

  function toggle(st: Station) {
    if (!st.src) return;
    if (stationId === st.id && status === "playing") {
      audioRef.current?.pause();
      setStatus("paused");
    } else if (stationId === st.id && status === "paused") {
      audioRef.current?.play().catch(() => onError(st));
      setStatus("playing");
    } else {
      void play(st);
    }
  }

  return (
    <div className="radio">
      <img src="/img/mola.jpg" alt="Ahşap radyolu masada çay bardağı ve kuru kayısı kasesi, arkada kilim asılı duvar" width={1200} height={800} loading="lazy" className="radio__img" />
      <div className="radio__body">
        <p className="radio__live">
          <span className={`radio__dot${status === "playing" ? " is-on" : ""}`} aria-hidden="true" />
          {status === "playing" ? `Canlı: ${station.name}` : status === "loading" ? "Bağlanıyor…" : "Radyoyu sen aç, çay bizden"}
        </p>

        <ul className="radio__stations">
          {STATIONS.map((st) => {
            const isCurrent = st.id === stationId;
            const isPlaying = isCurrent && status === "playing";
            return (
              <li key={st.id} className={`radio__station${isCurrent ? " is-current" : ""}`}>
                {st.src ? (
                  <button
                    type="button"
                    className="radio__play"
                    onClick={() => toggle(st)}
                    aria-label={isPlaying ? `${st.name} yayınını duraklat` : `${st.name} yayınını başlat`}
                    aria-pressed={isPlaying}
                  >
                    {isCurrent && status === "loading" ? "…" : isPlaying ? "❚❚" : "▶"}
                  </button>
                ) : (
                  <a className="radio__play radio__play--link" href={st.site} target="_blank" rel="noreferrer" aria-label={`${st.name} resmî sitesinde dinle (yeni sekme)`}>↗</a>
                )}
                <div className="radio__meta">
                  <p className="radio__name">{st.name} <span>{st.tag}</span></p>
                  <p className="radio__note">{st.note}</p>
                </div>
                <a className="radio__site" href={st.site} target="_blank" rel="noreferrer">Resmî site</a>
              </li>
            );
          })}
        </ul>

        <div className="radio__controls">
          <button type="button" className="radio__mute" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
            {muted ? "Sessizde — sesi aç" : "Sessize al"}
          </button>
          <label className="radio__volume">
            Ses
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => { setVolume(Number(e.target.value) / 100); setMuted(false); }}
              aria-label="Ses seviyesi"
            />
          </label>
        </div>

        {status === "error" && <p className="radio__error" role="alert">{errorMsg}</p>}
        <p className="radio__disclaimer">
          Yayınlar istasyonların resmî internet yayınlarıdır; Patik bu yayınların sahibi değildir
          ve internet bağlantısı + mobil veri kullanır. Bilgi kartı: Elazığ'ın dünyada "Mumlu Dans"
          olarak bilinen halk oyunu <strong>Çayda Çıra</strong>, mani ve "nanay" denen türküler
          eşliğinde oynanır — belki radyoda denk gelirsin.
        </p>
      </div>
      <audio
        ref={audioRef}
        preload="none"
        onPlaying={() => { window.clearTimeout(timeoutRef.current); setStatus("playing"); }}
      />
    </div>
  );
}

/* ------------------------- Oyun 1: Patik Ustası ------------------------- */

function ApricotSvg({ kind }: { kind: "normal" | "jumbo" | "ham" }) {
  const fill = kind === "ham" ? "#9db45c" : kind === "jumbo" ? "#f6a609" : "#e8762c";
  const edge = kind === "ham" ? "#73873a" : "#b5501b";
  return (
    <svg viewBox="0 0 64 64" className={`apricot-svg${kind === "jumbo" ? " is-jumbo" : ""}`} aria-hidden="true">
      <path d="M32 8c10 0 18 9.5 18 22 0 13.5-8.5 22-18 22S14 43.5 14 30c0-12.5 8-22 18-22Z" fill={fill} stroke={edge} strokeWidth="2.5" />
      <path d="M32 9c-2.5 7-2.5 36 0 42" fill="none" stroke={edge} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="32" cy="32" rx="6" ry="8.5" fill="#5a3a22" />
      {kind === "jumbo" && <circle cx="32" cy="30" r="26" fill="none" stroke="#f2a93b" strokeWidth="3" strokeDasharray="5 5" />}
    </svg>
  );
}

type TargetKind = "normal" | "jumbo" | "ham";
interface Target { cell: number; kind: TargetKind; key: number }

function PatikUstasi() {
  const [phase, setPhase] = useState<"idle" | "running" | "ended">("idle");
  const [target, setTarget] = useState<Target | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [best, setBest] = useState<number>(() => {
    try { return Number(localStorage.getItem("patik-usta-best") ?? 0) || 0; } catch { return 0; }
  });
  const [lastHit, setLastHit] = useState<string>("");

  const spawnTimer = useRef<number | undefined>(undefined);
  const tickTimer = useRef<number | undefined>(undefined);
  const endAtRef = useRef(0);
  const targetRef = useRef<Target | null>(null);
  targetRef.current = target;
  const scoreRef = useRef(0);
  const streakRef = useRef(0);

  const spawn = useCallback(() => {
    const prev = targetRef.current?.cell ?? -1;
    let cell = Math.floor(Math.random() * 9);
    if (cell === prev) cell = (cell + 3) % 9;
    const r = Math.random();
    const kind: TargetKind = r < 0.16 ? "jumbo" : r < 0.38 ? "ham" : "normal";
    setTarget({ cell, kind, key: Date.now() + Math.random() });
    const elapsed = 30 - Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
    const ms = Math.max(460, 820 - elapsed * 13);
    window.clearTimeout(spawnTimer.current);
    spawnTimer.current = window.setTimeout(spawn, ms);
  }, []);

  const finish = useCallback(() => {
    window.clearTimeout(spawnTimer.current);
    window.clearInterval(tickTimer.current);
    setTarget(null);
    setPhase("ended");
    setBest((b) => {
      const nb = Math.max(b, scoreRef.current);
      try { localStorage.setItem("patik-usta-best", String(nb)); } catch { /* yoksay */ }
      return nb;
    });
  }, []);

  const start = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setStreak(0);
    setLastHit("");
    setTimeLeft(30);
    endAtRef.current = Date.now() + 30000;
    setPhase("running");
    window.clearInterval(tickTimer.current);
    tickTimer.current = window.setInterval(() => {
      const left = Math.ceil((endAtRef.current - Date.now()) / 1000);
      setTimeLeft(Math.max(0, left));
      if (left <= 0) finish();
    }, 200);
    spawn();
  }, [spawn, finish]);

  useEffect(() => () => {
    window.clearTimeout(spawnTimer.current);
    window.clearInterval(tickTimer.current);
  }, []);

  function hit(cell: number) {
    if (phase !== "running" || !targetRef.current || targetRef.current.cell !== cell) return;
    const kind = targetRef.current.kind;
    let delta = 0;
    if (kind === "normal") delta = 10;
    if (kind === "jumbo") delta = 25;
    if (kind === "ham") delta = -15;
    const newStreak = delta > 0 ? streakRef.current + 1 : 0;
    if (delta > 0 && newStreak > 0 && newStreak % 5 === 0) delta += 15;
    const next = Math.max(0, scoreRef.current + delta);
    scoreRef.current = next;
    setScore(next);
    streakRef.current = delta > 0 ? newStreak : 0;
    setStreak(streakRef.current);
    setLastHit(kind === "ham" ? "Ham kayısı! −15 (onu dalında bırak)" : kind === "jumbo" ? "Jumbo! +25" : "+10");
    spawn();
  }

  const title = score >= 450 ? "Efsane Patikçi" : score >= 320 ? "Kayısı Kaptanı" : score >= 200 ? "Sergi Ustası" : score >= 100 ? "Patik Kalfası" : "Patik Çırağı";

  return (
    <div className="game">
      <div className="game__hud">
        <p className="game__stat">Skor <strong>{score}</strong></p>
        <p className="game__stat">Süre <strong>{timeLeft} sn</strong></p>
        <p className="game__stat">Seri <strong>{streak}</strong></p>
        <p className="game__stat">Rekor <strong>{best}</strong></p>
      </div>
      <div className="game__timebar" aria-hidden="true"><span style={{ width: `${(timeLeft / 30) * 100}%` }} /></div>

      <div className="game__grid" role="group" aria-label="Kayısı tepsileri">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`game__cell${target?.cell === i && phase === "running" ? " has-target" : ""}`}
            onClick={() => hit(i)}
            disabled={phase !== "running"}
            aria-label={target?.cell === i && phase === "running" ? `Tepsi ${i + 1}: kayısı var, patik yap` : `Tepsi ${i + 1}`}
          >
            {target?.cell === i && phase === "running" && <ApricotSvg key={target.key} kind={target.kind} />}
          </button>
        ))}
      </div>

      <p className="game__feedback" aria-live="polite">{phase === "running" ? lastHit || "Ampul… pardon, kayısı belirince üstüne dokun!" : " "}</p>

      {phase === "idle" && (
        <div className="game__intro">
          <p><strong>Nasıl oynanır?</strong> 30 saniyen var. Tepside beliren kayısının üstüne hızlıca dokun: normal <strong>+10</strong>, altın halkalı jumbo <strong>+25</strong>. Yeşil hama dokunma, <strong>−15</strong>! Her 5'li seriye +15 bonus.</p>
          <button type="button" className="btn btn--primary" onClick={start}>Oyuna başla — 30 saniye</button>
        </div>
      )}
      {phase === "ended" && (
        <div className="game__intro" aria-live="polite">
          <p className="game__result">Skorun <strong>{score}</strong> — Unvanın: <strong>{title}</strong>{score >= best && score > 0 ? " · Yeni rekor!" : ""}</p>
          <p>Gerçek patikte hız değil özen kazanır ama maşallahın var. Bir de gerçek ustanın işine bak:</p>
          <div className="game__actions">
            <button type="button" className="btn btn--primary" onClick={start}>Bir daha oyna</button>
            <a href="#surec" className="btn btn--ghost">Gerçek patik nasıl yapılır?</a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------- Oyun 2: Baskil Bilgisi ------------------------- */

const QUIZ = [
  {
    q: "Baskil'de 'patik' ne demektir?",
    options: ["Kayısının güneşte serilmesi", "Yarı kuru kayısının çekirdeğinin elle çıkarılması", "Kayısı kasalarının tartılması"],
    correct: 1,
    why: "Markamızın adı buradan gelir: her kayısı tek tek elden geçer, çekirdek de ziyan olmaz.",
  },
  {
    q: "Gün kurusunun rengi neden koyudur?",
    options: ["Fırında yakıldığı için", "Şeker şurubuna batırıldığı için", "İslim görmeden doğrudan güneşte kuruduğu için"],
    correct: 2,
    why: "Kükürt odasına girmeyen kayısı güneşle koyulaşır; bu bir kusur değil, gün kurusunun imzasıdır.",
  },
  {
    q: "İslim damı (kükürt odası) ne işe yarar?",
    options: ["Kayısının rengini ve dayanıklılığını korur", "Kayısıyı tatlandırır", "Çekirdeği yumuşatır"],
    correct: 0,
    why: "İslimli kayısı bu yüzden parlak turuncu ve daha uzun ömürlüdür; üretimin büyük kısmı bu yolla yapılır.",
  },
  {
    q: "'Çir' nedir?",
    options: ["Kayısı reçelinin adı", "Son kurutmadan sonra kutuya hazır kuru kayısı", "Kurutma bezinin adı"],
    correct: 1,
    why: "Çekirdeği çıkan kayısı son kez güneşe serilir, yaklaşık üç günde çir hâline gelir.",
  },
  {
    q: "Baskil kayısının coğrafi işaret durumu hangisidir?",
    options: ["Kendi adına müstakil tescili vardır", "Bugün Malatya Kayısısı işaretinin sınırları içinde anılır; Patik izlenebilirlik sunar", "Hiçbir yöreyle bağı yoktur"],
    correct: 1,
    why: "Biz rozet iddiası satmıyoruz; bahçeyi ve hasadı gösteren lot pasaportunu sunuyoruz.",
  },
];

function BilgiYarismasi() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [dogru, setDogru] = useState(0);
  const [bitti, setBitti] = useState(false);
  const q = QUIZ[i];

  function sec(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.correct) setDogru((d) => d + 1);
  }

  function sonraki() {
    if (i + 1 >= QUIZ.length) setBitti(true);
    else { setI(i + 1); setPicked(null); }
  }

  function basaDon() { setI(0); setPicked(null); setDogru(0); setBitti(false); }

  if (bitti) {
    const unvan = dogru === 5 ? "Baskil Bilgesi" : dogru >= 4 ? "Sergi Gönüllüsü" : dogru >= 3 ? "Kayısı Meraklısı" : "Taze Gakko";
    return (
      <div className="quizgame" aria-live="polite">
        <p className="game__result">{QUIZ.length} soruda <strong>{dogru}</strong> doğru — Unvanın: <strong>{unvan}</strong></p>
        <p>{dogru === 5 ? "Beşte beş! Lot pasaportunu kaptın demektir." : "Cevapların hepsi sitede yazıyor; süreci ve karşılaştırmayı gezince tam puan cepte."}</p>
        <div className="game__actions">
          <button type="button" className="btn btn--primary" onClick={basaDon}>Baştan oyna</button>
          <a href="#lotunu-kur" className="btn btn--ghost">Şimdi gerçek lotunu kur →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="quizgame">
      <p className="quizgame__progress">Soru {i + 1} / {QUIZ.length} · Doğru: {dogru}</p>
      <h3 className="quizgame__q">{q.q}</h3>
      <div className="quizgame__options">
        {q.options.map((o, idx) => {
          const cls = picked === null ? "" : idx === q.correct ? " is-correct" : idx === picked ? " is-wrong" : "";
          return (
            <button key={o} type="button" className={`quizgame__opt${cls}`} onClick={() => sec(idx)} disabled={picked !== null} aria-pressed={picked === idx}>
              {o}
              {picked !== null && idx === q.correct && <span className="quizgame__mark">Doğru</span>}
              {picked !== null && idx === picked && idx !== q.correct && <span className="quizgame__mark">Senin seçimin</span>}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="quizgame__why" aria-live="polite">
          <p>{q.why}</p>
          <button type="button" className="btn btn--primary btn--small" onClick={sonraki}>
            {i + 1 >= QUIZ.length ? "Sonucu gör" : "Sıradaki soru →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Bölüm ------------------------------ */

export default function Mola() {
  const [tab, setTab] = useState<"usta" | "bilgi">("usta");

  return (
    <section className="section mola" id="mola" aria-labelledby="mola-baslik">
      <div className="section__head">
        <p className="kicker">Çay molası · Elazığ'dan sesler, sergi başı oyunlar</p>
        <h2 id="mola-baslik">Radyoyu aç, tepsinin başına geç</h2>
        <p className="section__lede">
          Baskil'de patik mesaisi radyosuz olmaz. Aşağıda gerçek istasyonların canlı yayınları
          ve 30 saniyelik iki küçük oyun var. Önce türküyü aç, sonra ustalaş.
        </p>
      </div>

      <div className="mola__grid">
        <div className="mola__card">
          <h3 className="mola__card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 20h.01"/><path d="M8.5 16.4a5 5 0 0 1 7 0"/><path d="M5 13a10 10 0 0 1 14 0"/><path d="M2.5 9.5a15 15 0 0 1 19 0"/></svg>
            Harput'tan Kulağa — canlı radyo</h3>
          <RadioPlayer />
        </div>

        <div className="mola__card mola__card--game">
          <div className="mola__tabs" role="group" aria-label="Oyun seçimi">
            <button type="button" aria-pressed={tab === "usta"} className={`mola__tab${tab === "usta" ? " is-active" : ""}`} onClick={() => setTab("usta")}>
              Patik Ustası <span>30 sn refleks</span>
            </button>
            <button type="button" aria-pressed={tab === "bilgi"} className={`mola__tab${tab === "bilgi" ? " is-active" : ""}`} onClick={() => setTab("bilgi")}>
              Baskil Bilgisi <span>5 soru</span>
            </button>
          </div>
          {tab === "usta" ? <PatikUstasi /> : <BilgiYarismasi />}
        </div>
      </div>
    </section>
  );
}
