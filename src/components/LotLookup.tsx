import { useEffect, useState } from "react";
import { LOTS, buildPassportPrintHtml, findLot, type Lot } from "../data";
import LotPassport from "./LotPassport";

export default function LotLookup() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Lot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  function search(raw: string) {
    const q = raw.trim();
    setSearched(true);
    setCopied(false);
    if (!q) {
      setError("Önce bir lot kodu yaz. Örnek: PT-26-047");
      setResult(null);
      return;
    }
    const found = findLot(q);
    if (found) {
      setResult(found);
      setError(null);
      // URL'yi paylaşılabilir hâle getir: ?lot=KOD (sayfayı yenilemeden)
      const url = new URL(window.location.href);
      url.searchParams.set("lot", found.code);
      window.history.replaceState(null, "", url);
    } else {
      setResult(null);
      setError(`"${q.toLocaleUpperCase("tr-TR")}" koduna ait demo lot bulunamadı. Aşağıdaki örnek kodlardan birini dene.`);
    }
  }

  useEffect(() => {
    function onLot(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) {
        setCode(detail);
        search(detail);
      }
    }
    window.addEventListener("patik:lot", onLot);

    // Paylaşılan bağlantıyla gelen ziyaretçi: ?lot=PT-26-047
    const param = new URLSearchParams(window.location.search).get("lot");
    if (param) {
      setCode(param);
      search(param);
      window.setTimeout(() => {
        document.getElementById("lot-sorgula")?.scrollIntoView({ block: "start" });
      }, 400);
    }
    return () => window.removeEventListener("patik:lot", onLot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyLink() {
    if (!result) return;
    const url = `${window.location.origin}${window.location.pathname}?lot=${result.code}#lot-sorgula`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Pano izni yoksa adresi seçilebilir metin olarak göster
      window.prompt("Bağlantıyı kopyalayın:", url);
    }
  }

  function printPassport() {
    if (!result) return;
    const w = window.open("", "_blank", "width=760,height=900");
    if (!w) return;
    w.document.write(buildPassportPrintHtml(result));
    w.document.close();
    w.focus();
    window.setTimeout(() => w.print(), 350);
  }

  return (
    <section className="section lot-lookup" id="lot-sorgula" aria-labelledby="lot-baslik">
      <div className="lot-lookup__inner">
        <div className="lot-lookup__text">
          <p className="kicker">İzlenebilirlik</p>
          <h2 id="lot-baslik">Kutundaki kodu sorgula, bahçeye git</h2>
          <p className="section__lede">
            Her Patik kutusunun kapağında bir lot kodu olur. Kodu yaz; o kutunun bahçesini,
            hasat haftasını, kurutma yolunu ve patik gününü gör. Pasaportu istersen
            bağlantıyla paylaş, istersen basıp kutunun üstüne iliştir.
          </p>

          <form
            className="lot-form"
            onSubmit={(e) => {
              e.preventDefault();
              search(code);
            }}
          >
            <label htmlFor="lot-input">Lot kodu</label>
            <div className="lot-form__row">
              <input
                id="lot-input"
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="Örn. PT-26-047"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "lot-error" : "lot-hint"}
              />
              <button type="submit" className="btn btn--primary">Pasaportu Aç</button>
            </div>
            <p id="lot-hint" className="lot-form__hint">
              Demo kodlar:{" "}
              {LOTS.map((l, i) => (
                <span key={l.code}>
                  {i > 0 && " · "}
                  <button
                    type="button"
                    className="lot-link"
                    onClick={() => {
                      setCode(l.code);
                      search(l.code);
                    }}
                  >
                    {l.code}
                  </button>
                </span>
              ))}
            </p>
            {error && (
              <p id="lot-error" className="form-error" role="alert">
                {error}
              </p>
            )}
          </form>

          {result && (
            <div className="lot-actions">
              <button type="button" className="btn btn--ghost btn--small lot-actions__btn" onClick={copyLink}>
                {copied ? "Bağlantı kopyalandı ✓" : "Pasaport bağlantısını kopyala"}
              </button>
              <button type="button" className="btn btn--ghost btn--small lot-actions__btn" onClick={printPassport}>
                Pasaportu yazdır / PDF
              </button>
              <p className="lot-actions__note">
                Hediye ettiğiniz kişi bu bağlantıyı açtığında aynı pasaport karşısına gelir;
                baskısı da jüri masası (ve buzdolabı kapısı) içindir.
              </p>
            </div>
          )}
        </div>

        <div className="lot-lookup__result" aria-live="polite">
          {result ? (
            <LotPassport lot={result} />
          ) : (
            <div className="lot-lookup__empty">
              <p className="lot-lookup__empty-big">Pasaport burada açılacak</p>
              <p>
                {searched
                  ? "Sonuç bulunamadı; kodu kontrol edip yeniden dene."
                  : "Bir kod yaz ya da örnek kodlardan birine dokun. Gerçek üründe bu kod, kutunun kapağındaki baskıdan okutulur."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
