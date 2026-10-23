// Dữ liệu mẫu cho màn Kết quả phân tích: BE mới trả trạng thái bài nộp, chưa trả các số liệu dưới đây.
// TODO(BE): thay bằng dữ liệu thật khi có API điểm chi tiết, pitch contour, xếp hạng lớp và lịch sử lần nộp.
export interface SegmentSuggestion {
  id: string;
  label: string;
  start: number;
  end: number;
  dot: "star" | "orange" | "grey";
}

export const RESULT_MOCK = {
  pieceTitle: "Lý ngựa ô",
  recordedAt: "14:32",
  durationLabel: "2 phút 41",
  durationSec: 161,
  totalBars: 36,
  scores: { overall: 82, pitch: 91, rhythm: 74, tempo: 86 },
  classRank: {
    classCode: "TRD301",
    topPercent: 22,
    betterThanPercent: 78,
    classAverage: 71,
    myScore: 82,
    // Số sinh viên trong lớp theo mốc điểm (mẫu), vẽ thành đường phân bố điểm
    distribution: [
      { score: 0, count: 0 },
      { score: 10, count: 1 },
      { score: 20, count: 2 },
      { score: 30, count: 3 },
      { score: 40, count: 5 },
      { score: 50, count: 8 },
      { score: 60, count: 12 },
      { score: 70, count: 15 },
      { score: 80, count: 10 },
      { score: 90, count: 4 },
      { score: 100, count: 1 },
    ],
  },
  history: {
    songTitle: "Lý ngựa ô",
    growthLabel: "+8% (Tăng trưởng)",
    attempts: [
      { label: "Lần 1", when: "Hôm qua 10:15", score: 68 },
      { label: "Lần 2", when: "Hôm nay 11:20", score: 74 },
      { label: "Lần 3 (Hiện tại)", when: "Hiện tại 14:32", score: 82 },
    ],
  },
  aiFeedback: {
    version: "AI v2.4",
    paragraphs: [
      {
        lead: "Bài thể hiện kỹ thuật gảy tương đối chuẩn xác ở các phân đoạn đầu, tuy nhiên từ ",
        strong: "ô nhịp 18 đến 24",
        tail: " nhịp phách còn bị đẩy nhanh so với bản mẫu (khoảng 14%).",
      },
      {
        lead: "Nốt Sol ở ",
        strong: "ô nhịp 9",
        tail: " hơi non khoảng 24¢ do độ căng của dây chưa đạt chuẩn. Hãy chú ý kiểm soát tempo ổn định ở phân đoạn cao trào và thả lỏng ngón tay khi chuyển nhịp.",
      },
    ],
  },
  segments: {
    defaultRange: { start: 18, end: 24 },
    suggestions: [
      { id: "worst", label: "Đoạn lỗi nhiều nhất: Bar 18–24", start: 18, end: 24, dot: "star" },
      { id: "tempo", label: "Bar 31–34 (Lỗi tempo)", start: 31, end: 34, dot: "orange" },
      { id: "warmup", label: "Bar 1–12 (Khởi động)", start: 1, end: 12, dot: "grey" },
    ] satisfies SegmentSuggestion[],
    // Số lỗi nhịp & tempo trong khoảng đang chọn (mẫu)
    issuesInRange: 6,
  },
};
