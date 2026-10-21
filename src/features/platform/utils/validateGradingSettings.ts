import { z } from "zod";

const percentField = (label: string) =>
  z
    .string()
    .refine(
      (value) => /^\d+$/.test(value.trim()) && Number(value) >= 0 && Number(value) <= 100,
      `${label} phải nằm trong khoảng từ 0 đến 100.`
    );

// Same rules as the server: integers 0–100 and the at-risk margin may not exceed the minimum.
export const gradingSettingsSchema = z
  .object({ minAccuracy: percentField("Độ chính xác tối thiểu"), atRiskMargin: percentField("Biên có nguy cơ") })
  .refine((values) => Number(values.atRiskMargin) <= Number(values.minAccuracy), {
    message: "Biên có nguy cơ không được lớn hơn độ chính xác tối thiểu.",
    path: ["atRiskMargin"],
  });

export type GradingSettingsFormValues = z.infer<typeof gradingSettingsSchema>;

// "≥ 70%: Đúng tiến độ · 30–69%: Có nguy cơ · < 30%: Chậm tiến độ"
export function describeGradingBands(minAccuracyText: string, atRiskMarginText: string): string | null {
  const minAccuracy = Number(minAccuracyText);
  const margin = Number(atRiskMarginText);
  if (
    !/^\d+$/.test(minAccuracyText.trim()) ||
    !/^\d+$/.test(atRiskMarginText.trim()) ||
    margin > minAccuracy ||
    minAccuracy > 100
  ) {
    return null;
  }
  const lowerBound = minAccuracy - margin;
  const bands = [`≥ ${minAccuracy}%: Đúng tiến độ`];
  if (margin > 0) bands.push(`${lowerBound}–${minAccuracy - 1}%: Có nguy cơ`);
  if (lowerBound > 0) bands.push(`< ${lowerBound}%: Chậm tiến độ`);
  return bands.join(" · ");
}
