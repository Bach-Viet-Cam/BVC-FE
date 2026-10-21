import { z } from "zod";

export const instrumentSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã nhạc cụ")
    .max(30, "Mã tối đa 30 ký tự")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Mã chỉ gồm chữ thường, số và dấu gạch ngang, ví dụ dan-bau"),
  name: z.string().trim().min(1, "Vui lòng nhập tên nhạc cụ").max(100, "Tên tối đa 100 ký tự"),
  description: z.string().trim().max(255, "Mô tả tối đa 255 ký tự"),
});

export type InstrumentFormValues = z.infer<typeof instrumentSchema>;
