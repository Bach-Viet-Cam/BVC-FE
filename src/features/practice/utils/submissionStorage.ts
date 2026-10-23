// Nhớ bản nộp gần nhất của từng bài để quay lại màn tiến trình sau khi rời đi (UC-01 step 14).
// sessionStorage có thể bị chặn (chế độ riêng tư) nên mọi thao tác đều bọc try/catch.
function keyOf(userId: string, pieceId: string): string {
  return `practice-submission:${userId}:${pieceId}`;
}

export function rememberSubmission(userId: string, pieceId: string, submissionId: string): void {
  try {
    sessionStorage.setItem(keyOf(userId, pieceId), submissionId);
  } catch {
    // Không lưu được thì vẫn còn submissionId trên URL
  }
}

export function recallSubmission(userId: string, pieceId: string): string {
  try {
    return sessionStorage.getItem(keyOf(userId, pieceId)) ?? "";
  } catch {
    return "";
  }
}

export function forgetSubmission(userId: string, pieceId: string): void {
  try {
    sessionStorage.removeItem(keyOf(userId, pieceId));
  } catch {
    // Bỏ qua: chỉ là ghi nhớ phụ
  }
}
