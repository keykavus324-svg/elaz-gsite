/**
 * public/ altındaki dosyaları Vite base yoluyla çözer.
 * Böylece aynı derleme hem kök dizinde (Replit) hem de
 * GitHub Pages proje alt dizininde (/elaz-gsite/) çalışır.
 */
export function publicAsset(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path.replace(/^\/+/, "")}`;
}
