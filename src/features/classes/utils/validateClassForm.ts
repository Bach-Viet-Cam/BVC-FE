import { z } from "zod";
import { CLASS_CODE_EXAMPLE, parseClassCode } from "@/features/classes/utils/classCode";

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

// New classes must follow the coded name so the subject can be derived from it.
export const createClassFormSchema = classFormSchema.extend({
  name: classFormSchema.shape.name.refine(
    (value) => parseClassCode(value) !== null,
    `Mã lớp phải có dạng Môn.Slot.Half, ví dụ ${CLASS_CODE_EXAMPLE}.`
  ),
  instrumentId: z.string().min(1, "Không tìm thấy môn học khớp với mã lớp. Kiểm tra lại mã môn."),
});
