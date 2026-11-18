import { type AssignmentListItem } from "@/features/classes/types/assignmentTypes";
import { describeTimeLeft, formatShortDeadline } from "@/features/classes/utils/assignmentFormat";

export type AssignmentBucket = "todo" | "submitted" | "overdue";
export type AssignmentSort = "deadline" | "title";

export function getAssignmentBucket(item: AssignmentListItem, now: Date): AssignmentBucket {
  if (item.status === "OVERDUE") return "overdue";
  if (item.status === "PASSED") return "submitted";
  const isOpen = new Date(item.deadline).getTime() >= now.getTime();
  const hasAttemptsLeft = item.maxSubmissions === null || item.usedSubmissions < item.maxSubmissions;
  return isOpen && hasAttemptsLeft ? "todo" : "submitted";
}

export function formatDeadlineLine(deadline: string, isOpen: boolean, now: Date): string {
  const date = formatShortDeadline(deadline);
  if (!isOpen) return `Hạn ${date}`;
  const left = describeTimeLeft(deadline, now);
  return `${left.charAt(0).toUpperCase()}${left.slice(1)} · ${date}`;
}

function compareBy(sort: AssignmentSort, direction: 1 | -1) {
  return (first: AssignmentListItem, second: AssignmentListItem) =>
    sort === "title"
      ? first.title.localeCompare(second.title, "vi")
      : (new Date(first.deadline).getTime() - new Date(second.deadline).getTime()) * direction;
}

export function groupAssignments(items: AssignmentListItem[], now: Date, sort: AssignmentSort) {
  const inBucket = (bucket: AssignmentBucket) => items.filter((item) => getAssignmentBucket(item, now) === bucket);
  return {
    todo: inBucket("todo").sort(compareBy(sort, 1)),
    submitted: inBucket("submitted").sort(compareBy(sort, -1)),
    overdue: inBucket("overdue").sort(compareBy(sort, -1)),
  };
}
