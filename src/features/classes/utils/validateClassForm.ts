import { z } from "zod";
import { parseVietnameseDate, todayInVietnam } from "@/features/classes/utils/classFormat";

const required = (field: string) => `${field} không được để trống.`;
const tooLong = (field: string, max: number) => `${field} không được vượt quá ${max} ký tự.`;

const baseClassSchema = z.object({
  name: z.string().trim().min(1, required("Tên lớp")).max(100, tooLong("Tên lớp", 100)),
  cohort: z.string().trim().min(1, required("Khóa")).max(50, tooLong("Khóa", 50)),
  instrumentId: z.string().min(1, required("Nhạc cụ")),
  description: z.string().trim().max(500, tooLong("Mô tả", 500)),
  // Typed as dd/MM/yyyy (UI language), converted to yyyy-MM-dd before it is sent.
  startDate: z
    .string()
    .min(1, required("Ngày bắt đầu"))
    .refine((value) => parseVietnameseDate(value) !== null, "Ngày bắt đầu không hợp lệ. Nhập theo dạng dd/mm/yyyy."),
});

// The past-date rule only applies when creating; when editing a started class the date is locked.
export function buildClassFormSchema(isCreate: boolean) {
  return baseClassSchema.refine(
    (values) => {
      const isoDate = parseVietnameseDate(values.startDate);
      return !isCreate || !isoDate || isoDate >= todayInVietnam();
    },
    { message: "Ngày bắt đầu không được ở quá khứ.", path: ["startDate"] }
  );
}

export type ClassFormValues = z.infer<typeof baseClassSchema>;
