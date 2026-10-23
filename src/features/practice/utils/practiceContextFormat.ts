import type { PracticeContext } from "@/features/practice/types/practiceContextTypes";

export const DEADLINE_NOTE =
  "Hạn nộp chỉ dùng để tính vào bài tập của lớp. Khi lớp kết thúc hoặc quá hạn, luyện tập bản chính này được tính như luyện tập thường và không còn tính vào bài tập.";

// Câu giải thích lần luyện này có tính vào bài tập không; trung tính, không phải cảnh báo
export function assignmentStatusText(context: PracticeContext): string {
  const { assignment } = context;
  if (context.enrollment === "NO_CLASS") return "Bạn chưa thuộc lớp nào nên lần luyện tập này không tính vào bài tập.";
  if (!assignment) {
    return context.sheet.isMain
      ? "Bản nhạc này chưa được giao cho lớp của bạn nên lần luyện tập này không tính vào bài tập."
      : "Chỉ bản chính của nhạc cụ trong lớp mới được giao làm bài tập, nên lần luyện tập này không tính vào bài tập.";
  }
  if (assignment.state === "ENDED")
    return "Bài tập đã hết hạn hoặc đã đóng, lần luyện tập này không còn tính vào bài tập.";
  if (assignment.state === "EXHAUSTED")
    return "Bạn đã dùng hết lượt nộp, lần luyện tập này không còn tính vào bài tập.";
  return "Mỗi lần gửi bản thu sẽ tính một lượt nộp của bài tập.";
}
