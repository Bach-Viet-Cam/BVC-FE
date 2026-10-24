import { z } from "zod";

const KIND_VALUES = ["PRACTICE", "BONUS", "SOLO", "ENSEMBLE"] as const;

const accuracy = z.string().regex(/^(100|[1-9]?\d)?$/, "Nhập số từ 0 đến 100");

export const submissionFilterSchema = z
  .object({
    title: z.string(),
    fromDate: z.string(),
    toDate: z.string(),
    minAccuracy: accuracy,
    maxAccuracy: accuracy,
    kinds: z.array(z.enum(KIND_VALUES)),
  })
  .refine((value) => !value.fromDate || !value.toDate || value.fromDate <= value.toDate, {
    path: ["toDate"],
    message: "Ngày kết thúc phải sau ngày bắt đầu",
  })
  .refine(
    (value) =>
      value.minAccuracy === "" || value.maxAccuracy === "" || Number(value.minAccuracy) <= Number(value.maxAccuracy),
    { path: ["maxAccuracy"], message: "Mức đến phải lớn hơn mức từ" }
  );

export type SubmissionFilterValues = z.infer<typeof submissionFilterSchema>;
