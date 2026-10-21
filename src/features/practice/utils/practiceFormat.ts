function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}

export function mbText(mb: number): string {
  return `${(Math.round(mb * 10) / 10).toFixed(1).replace(".", ",")} MB`;
}

// Dùng dấu trừ U+2212 cho số âm như bản thiết kế
export function signed(n: number): string {
  const r = Math.round(n);
  return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r)}`;
}
