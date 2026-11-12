// Giới hạn số ô hiển thị, không giới hạn số lượt sinh viên được nộp.
export function visibleAssignmentAttempts(lastAttempt: number, limit: number | null): number[] {
  const last = limit === null ? lastAttempt : Math.min(limit, Math.max(3, lastAttempt + 1));
  const first = Math.max(1, last - 11);
  return Array.from({ length: Math.max(0, last - first + 1) }, (_, index) => first + index);
}
