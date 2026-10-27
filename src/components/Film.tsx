import { useEffect, useRef, useState } from "react";
import { publicAsset } from "../assets";
import { useReducedMotion, useScrollFrame } from "../scrollEngine";
import { sfx } from "../sfx";

/* ==================================================================
   "YOLCULUK" FİLMİ — kaydırmayla oynayan bölüm
   ------------------------------------------------------------------
   Beş sahne, tek bir yapışkan sahne (stage) içinde üst üste durur.
   Sayfayı kaydırdıkça film karesi ilerler: sahneler birbirinin
   üstüne kayarak çapraz çözünür, dev kelime ölçeklenir, fotoğraf
   yavaşça yakınlaşır (Ken Burns). Altta zaman kodu ve tıklanabilir
   bir film şeridi var — sayfa "video" gibi kaydedilir.
   ================================================================== */

type Scene = {
  no: string;
  word: string;
  note: string;
  img: string;
  alt: string;
};

const SCENES: Scene[] = [
  {
    no: "01",
    word: "HASAT",
    note: "Temmuz–Ağustos. Olgun kayısı dalından toplanır, bekletilmeden kurutma alanına taşınır. Doğru gün, kutudaki tadın ilk kararıdır.",
    img: "img/hasat.jpg",
    alt: "Ağaçtan toplanan kayısıların ahşap kasaya yerleştirilmesi (temsilî görsel)",
  },
  {
    no: "02",
    word: "İSLİM",
    note: "Kükürt damında yaklaşık bir gün. Rengini korur, dokusu diri kalır — parlak islimli kayısı böyle doğar.",
    img: "img/islim.jpg",
    alt: "Taş islim odasında ahşap raflarda islim damına girmiş yarım kayısılar (temsilî görsel)",
  },
  {
    no: "03",
    word: "SERGİ",
    note: "Güneş iki gün işe başlar. Suyu kayısıdan alınır, tadı içinde kalır. Baskil'in yaz havası burada işe yarar.",
    img: "img/sergi.jpg",
    alt: "Göl kıyısındaki yamaçta bezler üzerine serilmiş kuruyan kayısılar (temsilî görsel)",
  },
  {
    no: "04",
    word: "PATİK",
    note: "Çekirdek tek tek elle çıkarılır. Baskil'de bu mesaiye patik denir — markanın adı buradan gelir.",
    img: "img/patik.jpg",
    alt: "Tepsi dolusu yarı kuru kayısının çekirdeklerini elle çıkaran üretici elleri (temsilî görsel)",
  },
  {
    no: "05",
    word: "PASAPORT",
    note: "Her kutu tek bir bahçeden dolar ve kapağında bir lot kodu olur. Kodu yazınca bahçe, hasat haftası ve kurutma yolu açılır.",
    img: "img/pasaport.jpg",
    alt: "Krem kâğıt üzerinde kraft kutu, boş lot kartı ve kalem ile pasaport hazırlığı (temsilî görsel)",
  },
];

/** Film süresi (saniye) — yalnızca zaman kodu için. */
const FILM_SECONDS = 96;

function timecode(progress: number): string {
  const total = Math.max(0, Math.round(progress * FILM_SECONDS));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function Film() {
  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);
  const timeRef = useRef<HTMLSpanElement | null>(null);
  const activeRef = useRef(0);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  /* Kaydırma motoruna bağlan: her karede sahne ağırlıklarını CSS
     değişkeni olarak yaz. React yeniden çizilmez; yalnızca sahne
     değiştiğinde (nadiren) state güncellenir. */
  useScrollFrame((vh) => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const rect = root.getBoundingClientRect();
    const docTop = rect.top + window.scrollY;
    const travel = Math.max(1, root.offsetHeight - vh);
    const p = Math.min(1, Math.max(0, (window.scrollY - docTop) / travel));

    const n = SCENES.length;
    for (let i = 0; i < n; i += 1) {
      const el = sceneRefs.current[i];
      if (!el) continue;
      const d = Math.abs(p * (n - 1) - i);
      // Keskin çözünme: film kesişine yakın bir "kadraj değişimi".
      const w = Math.max(0, 1 - d * 1.25);
      // Sahnenin kendi içindeki ilerleme (Ken Burns + yazı kayması).
      const local = Math.min(1, Math.max(0, p * (n - 1) - i + 0.5));
      el.style.setProperty("--w", w.toFixed(4));
      el.style.setProperty("--kb", (1.04 + local * 0.09).toFixed(4));
    }

    stage.style.setProperty("--p", p.toFixed(4));

    if (timeRef.current) {
      timeRef.current.textContent = timecode(p);
    }

    const idx = Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))));
    if (idx !== activeRef.current) {
      activeRef.current = idx;
      setActive(idx);
    }
  });

  /* Zaman kodu için sabit toplam süreyi de yaz. */
  useEffect(() => {
    if (timeRef.current) timeRef.current.textContent = timecode(0);
  }, []);

  /** Film şeridinden bir sahneye atla. */
  const jumpTo = (index: number) => {
    const root = rootRef.current;
    if (!root) return;
    const vh = window.innerHeight;
    const docTop = root.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(1, root.offsetHeight - vh);
    const p = SCENES.length > 1 ? index / (SCENES.length - 1) : 0;
    window.scrollTo({
      top: docTop + p * travel,
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
    sfx("click");
  };

  return (
    <section className="film" id="yolculuk" aria-labelledby="film-baslik" ref={rootRef}>
      <h2 className="sr-only" id="film-baslik">
        Kayısının yolculuğu: hasattan lot pasaportuna beş durak
      </h2>

      <div className="film__stage" ref={stageRef}>
        {SCENES.map((scene, i) => (
          <article
            className="film__scene"
            key={scene.no}
            ref={(el) => {
              sceneRefs.current[i] = el;
            }}
            aria-hidden={reduced ? undefined : i !== active}
          >
            <img className="film__img" src={publicAsset(scene.img)} alt={scene.alt} loading="lazy" decoding="async" />
            <div className="film__scrim" aria-hidden="true" />
            <div className="film__copy">
              <p className="film__no">
                <span>{scene.no}</span> / 05
              </p>
              <h3 className="film__word">{scene.word}</h3>
              <p className="film__note">{scene.note}</p>
            </div>
          </article>
        ))}

        <div className="film__hud">
          <span className="film__play" aria-hidden="true">
            ▶
          </span>
          <span className="film__tc" aria-hidden="true">
            <span ref={timeRef}>00:00</span> / {timecode(1)}
          </span>
          <span className="film__scrub" aria-hidden="true">
            <span className="film__scrub-fill" />
          </span>
        </div>

        <nav className="film__strip" aria-label="Kayısının yolculuğu durakları">
          <ol>
            {SCENES.map((scene, i) => (
              <li key={scene.no}>
                <button
                  type="button"
                  className={`film__jump${i === active ? " is-active" : ""}`}
                  onClick={() => jumpTo(i)}
                  aria-current={i === active ? "true" : undefined}
                >
                  <span className="film__jump-no">{scene.no}</span>
                  <span className="film__jump-word">{scene.word}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
