import { type Semester } from "@/features/classes/types/classTypes";
import { todayInVietnam } from "@/features/classes/utils/classFormat";

export type SemesterHalf = 1 | 2;

// Admin configures each half as its own semester entry: "FA26-H1", "Fall2026_H2", "SP27-H1", ...
// Both "-" and "_" are accepted before the half suffix.
const HALF_NAME_PATTERN = /^(.+)[-_]H([12])$/i;

export function halfOfSemesterName(name: string): SemesterHalf | null {
  const match = HALF_NAME_PATTERN.exec(name.trim());
  return match ? (Number(match[2]) as SemesterHalf) : null;
}

// "H1" / "1" -> 1, "H2" / "2" -> 2; anything else is not a half.
export function toSemesterHalf(half: string | null | undefined): SemesterHalf | null {
  return half === "1" ? 1 : half === "2" ? 2 : null;
}

export type SemesterTarget = { kind: "found"; semester: Semester } | { kind: "missing"; half: SemesterHalf };

// The class goes into the earliest configured entry of that half that has not ended yet:
// during FA26-H2, H2 keeps FA26-H2 and H1 jumps to SP27-H1; during FA26-H1, H2 moves to FA26-H2.
export function resolveSemesterForHalf(
  semesters: Semester[],
  half: SemesterHalf,
  today: string = todayInVietnam()
): SemesterTarget {
  const semester = semesters
    .filter((item) => halfOfSemesterName(item.name) === half && item.endDate >= today)
    .reduce<Semester | null>(
      (earliest, item) => (!earliest || item.startDate < earliest.startDate ? item : earliest),
      null
    );
  return semester ? { kind: "found", semester } : { kind: "missing", half };
}
