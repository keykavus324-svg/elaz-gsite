import { useEffect, useState } from "react";
import { LOTS, findLot, type Lot } from "../data";
import LotPassport from "./LotPassport";

export default function LotLookup() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Lot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  function search(raw: string) {
    const q = raw.trim();
    setSearched(true);
    if (!q) {
      setError("Önce bir lot kodu yaz. Örnek: PT-26-047");
      setResult(null);
      return;
    }
    const found = findLot(q);
    if (found) {
      setResult(found);
      setError(null);
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
    return () => window.removeEventListener("patik:lot", onLot);
  }, []);

  return (
    <section className="section lot-lookup" id="lot-sorgula" aria-labelledby="lot-baslik">
      <div className="lot-lookup__inner">
        <div className="lot-lookup__text">
          <p className="kicker">İzlenebilirlik</p>
          <h2 id="lot-baslik">Kutundaki kodu sorgula, bahçeye git</h2>
          <p className="section__lede">
            Her Patik kutusunun kapağında bir lot kodu olur. Kodu yaz; o kutunun bahçesini,
            hasat haftasını, kurutma yolunu ve patik gününü gör. Bu, "nereden geldi bu kayısı?"
            sorusunun tek tıkla cevabı.
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
