import { TUNER_TOLERANCE_CENTS } from "@/features/practice/constants/practiceConstants";

export function centsColor(cents: number, live: boolean): string {
  if (!live) return "var(--color-bvc-faint)";
  if (Math.abs(cents) <= TUNER_TOLERANCE_CENTS) return "var(--color-bvc-ok)";
  return "var(--color-bvc-error)";
}
