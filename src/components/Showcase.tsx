import { useEffect, useRef, useState } from "react";

const SCENES = [
  {
    eyebrow: "01 · Köken",
    title: "Fırat'a bakan\ndalda başlar.",
    text: "Baskil'in teras bahçelerinde olgunlaşan kayısı, bekletilmeden kasaya girer. Patik'te her kutunun hikâyesi bahçe adıyla başlar.",
    meta: "Çavuşlu · Karakaya kıyısı · Temmuz",
    img: "/img/firat-orchard.jpg",
    alt: "Gün doğumunda Fırat vadisine bakan kayısı dalı ve teras bahçeler",
  },
  {
    eyebrow: "02 · Dönüşüm",
    title: "Güneş çalışır.\nEller tamamlar.",
    text: "Sergide kıvam bulan kayısının çekirdeği patikte tek tek çıkarılır. Aynı anda her meyve gözden geçer; lotun kaydı da burada yazılır.",
    meta: "Sergi · Patik · Çir",
    img: "/img/patik.jpg",
    alt: "Yarı kuru kayısıların çekirdeklerini elle çıkaran üretici elleri",
  },
  {
    eyebrow: "03 · Kimlik",
    title: "Kutu kapanır.\nYolculuk görünür olur.",
    text: "Bahçe, hasat haftası ve kurutma yolu kapağın altındaki pasaporta işlenir. Kodu yazarsın; kayısının geldiği yere gidersin.",
    meta: "PT-26-047 · Lot Pasaportu",
    img: "/img/studio-pack.jpg",
    alt: "Açık premium kutudan dökülen kuru kayısılar ve yanında kapalı kutular",
  },
];

export default function Showcase() {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const items = itemRefs.current.filter(Boolean) as HTMLElement[];
    if (!items.length || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.index ?? 0));
          }
        }
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );

    items.forEach((item) => io.observe(item));
    return () => io.disconnect();
  }, []);

  function jump(index: number) {
    setActive(index);
    itemRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section className="showcase" id="film" aria-labelledby="film-baslik">
      <div className="showcase__inner">
        <div className="showcase__head">
          <p className="kicker kicker--dark">Patik filmi · Üç sahne</p>
          <h2 id="film-baslik">
            Bir kayısının
            <span>yolculuğunu izle.</span>
          </h2>
          <p>
            Kaydırmaya devam et. Dal, sergi ve kutu aynı sahnede birbirine dönüşsün.
          </p>
        </div>

        <div className="showcase__layout">
          <div className="showcase__stage">
            {SCENES.map((scene, i) => (
              <img
                key={scene.img}
                src={scene.img}
                alt=""
                width={1600}
                height={1100}
                loading={i === 0 ? "eager" : "lazy"}
                className={`showcase__image${i === active ? " is-active" : ""}`}
              />
            ))}
            <div className="showcase__caption" key={active}>
              <span>{SCENES[active].eyebrow}</span>
              <strong>{SCENES[active].meta}</strong>
            </div>
            <div className="showcase__controls">
              {SCENES.map((scene, i) => (
                <button
                  key={scene.eyebrow}
                  type="button"
                  tabIndex={-1}
                  className={i === active ? "is-active" : ""}
                  onClick={() => jump(i)}
                  aria-label={`${scene.eyebrow} sahnesine git`}
                >
                  <span />
                </button>
              ))}
            </div>
          </div>

          <div className="showcase__steps">
            {SCENES.map((scene, i) => (
              <article
                key={scene.eyebrow}
                data-index={i}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={`showcase__step${i === active ? " is-active" : ""}`}
                aria-label={`${scene.eyebrow}: ${scene.title.replace("\n", " ")}`}
              >
                <span className="showcase__number" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="showcase__eyebrow">{scene.eyebrow}</p>
                <h3>
                  {scene.title.split("\n").map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h3>
                <p>{scene.text}</p>
                <img
                  src={scene.img}
                  alt={scene.alt}
                  width={1200}
                  height={800}
                  loading="lazy"
                  className="showcase__mobile-image"
                />
              </article>
            ))}
          </div>
        </div>

        <p className="showcase__note">
          Görseller yapay zekâ ile üretilmiş temsilî çekimlerdir; gerçek bahçe veya paket fotoğrafı değildir.
        </p>
      </div>
    </section>
  );
}
