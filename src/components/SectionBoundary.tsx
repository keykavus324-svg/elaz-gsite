import { Component, type ErrorInfo, type ReactNode } from "react";

/* ================================================================== */
/*  BÖLÜM SINIRI (Error Boundary)                                     */
/*                                                                     */
/*  Atlas ve Evren ayrı paketlerden tembel yüklenir. Salon interneti  */
/*  kesildiğinde bu paketler alınamayabiliyor ve React, hatayı       */
/*  yakalanmayan bir istisna olarak yukarı fırlatıyor — o zaman       */
/*  sayfanın tamamı boş kalıyordu. Bu sınıf hatayı yakalar: bölüm     */
/*  yerine anlaşılır bir açıklama gösterilir, sitenin geri kalanı    */
/*  çalışmaya devam eder.                                              */
/* ================================================================== */

interface Props {
  children: ReactNode;
  /** Hata durumunda gösterilecek bölüm adı. */
  title: string;
  /** Bölümün kısa tanımı — hata metninde kullanılır. */
  note?: string;
}

interface State {
  error: Error | null;
}

export default class SectionBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Konsola düşürüyoruz ki sahnede olursa sebebi hemen görülebilsin.
    console.error("Patik — bölüm yüklenemedi:", error, info.componentStack);
  }

  private retry = () => {
    this.setState({ error: null });
    // Parça yeniden istenmeden önce sayfayı tazelemek gerekir: tarayıcı
    // başarısız modül isteğini önbelleğe alır.
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <section className="section boundary" aria-live="polite">
        <div className="boundary__box">
          <p className="kicker">Bölüm yüklenemedi</p>
          <h2>{this.props.title}</h2>
          {this.props.note && <p className="section__lede">{this.props.note}</p>}
          <p className="boundary__text">
            Bu bölüm ağ üzerinden gelen ayrı bir paket olduğu için yüklenemedi — bağlantı kesilmiş
            ya da sunucuya ulaşılamamış olabilir.{" "}
            <strong>Sitenin geri kalanı çalışmaya devam ediyor.</strong> Bu bölümü atlayıp kanonik
            akışa (Lotunu Kur → Sepet → Lot Pasaportu) devam edebilirsin; ya da bağlantı gelince
            sayfayı yenile.
          </p>
          <p>
            <button type="button" className="btn btn--primary" onClick={this.retry}>
              Sayfayı yenile
            </button>
          </p>
        </div>
      </section>
    );
  }
}
