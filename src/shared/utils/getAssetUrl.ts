export function getAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined; // khai báo kiểu ở vite-env.d.ts không bắt buộc
  const origin = apiBase ? new URL(apiBase).origin : window.location.origin;
  return `${origin}${path}`;
}
