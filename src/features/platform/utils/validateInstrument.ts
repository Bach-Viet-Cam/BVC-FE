import { z } from "zod";

export const instrumentSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã nhạc cụ")
    .max(30, "Mã tối đa 30 ký tự")
    .regex(/^[A-Za-z0-9_-]+$/, "Mã gồm các ký tự chữ cái, số viết tắt (ví dụ DTR, DBA, DNH, DSA)"),
  name: z.string().trim().min(1, "Vui lòng nhập tên nhạc cụ").max(100, "Tên tối đa 100 ký tự"),
  description: z.string().trim().max(255, "Mô tả tối đa 255 ký tự"),
});

export type InstrumentFormValues = z.infer<typeof instrumentSchema>;
