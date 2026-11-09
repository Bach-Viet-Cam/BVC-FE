export type TrackKey = "bau" | "nhi" | "sao" | "trong" | "other";

export interface TrackTheme {
  key: TrackKey;
  /** Màu waveform chưa phát. */
  light: string;
  /** Màu waveform đã phát. */
  dark: string;
  /** Nền làn. */
  bg: string;
}

const THEMES: Record<TrackKey, TrackTheme> = {
  bau: { key: "bau", light: "#9ED394", dark: "#3E8C45", bg: "#E5F3DF" },
  nhi: { key: "nhi", light: "#9DBFEF", dark: "#2F6DC2", bg: "#E1EBF9" },
  sao: { key: "sao", light: "#F4C685", dark: "#CF7F1C", bg: "#FBEED8" },
  trong: { key: "trong", light: "#E8B7C7", dark: "#B24D6D", bg: "#F8E6EC" },
  other: { key: "other", light: "#E3CC8A", dark: "#8A6A12", bg: "#FBF3DE" },
};

/** Làn bản thu của người học nối ở cuối timeline. */
export const TAKE_THEME: TrackTheme = THEMES.other;

const FALLBACK_ORDER: TrackKey[] = ["bau", "nhi", "sao", "trong"];

function normalize(name: string): string {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();
}

/** Chọn màu/biểu tượng theo tên nhạc cụ; tên lạ thì xoay vòng theo thứ tự làn. */
export function getTrackTheme(instrumentName: string, index: number): TrackTheme {
  const name = normalize(instrumentName);
  if (name.includes("bau")) return THEMES.bau;
  if (name.includes("nhi")) return THEMES.nhi;
  if (name.includes("sao")) return THEMES.sao;
  if (name.includes("nguyet") || name.includes("trong")) return THEMES.trong;
  return THEMES[FALLBACK_ORDER[index % FALLBACK_ORDER.length]];
}
