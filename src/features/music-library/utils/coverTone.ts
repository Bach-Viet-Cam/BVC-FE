import type { CoverTone } from "@/features/music-library/types/musicLibraryTypes";

const COVER_TONES: CoverTone[] = ["ink", "accent", "tint", "muted", "bar", "gold"];

// BE không lưu tông màu; suy từ id để ảnh bìa mặc định của một bài luôn cùng màu
export function coverToneOf(id: string): CoverTone {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COVER_TONES[hash % COVER_TONES.length];
}
