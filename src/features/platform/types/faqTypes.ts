export const FAQ_TOPICS = {
  COURSE_RULES: "Quy định môn học",
  ASSIGNMENTS: "Bài tập",
  INSTRUMENTS: "Nhạc cụ",
  PLATFORM: "Hướng dẫn nền tảng",
} as const;
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  topic: keyof typeof FAQ_TOPICS;
  instrumentId: string | null;
  displayOrder: number;
  isActive: boolean;
}
export type FaqInput = Omit<FaqItem, "id">;
export interface FaqList {
  items: FaqItem[];
  total: number;
  page: number;
  pageSize: number;
}
