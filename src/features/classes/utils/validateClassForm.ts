import { z } from "zod";

const required = (field: string) => `${field} không được để trống.`;
const tooLong = (field: string, max: number) => `${field} không được vượt quá ${max} ký tự.`;

// "Mã lớp" maps to name, "Tên môn học" to instrumentId, "Học kỳ" to cohort.
// Start and end dates come from the chosen semester, so they are not part of the form.
export const classFormSchema = z.object({
  name: z.string().trim().min(1, required("Mã lớp")).max(100, tooLong("Mã lớp", 100)),
  instrumentId: z.string().min(1, required("Tên môn học")),
  cohort: z.string().min(1, required("Học kỳ")),
  description: z.string().trim().max(500, tooLong("Mô tả", 500)),
});

export type ClassFormValues = z.infer<typeof classFormSchema>;
