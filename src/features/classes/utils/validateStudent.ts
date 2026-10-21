import { z } from "zod";

const required = (field: string) => `${field} không được để trống.`;
const tooLong = (field: string, max: number) => `${field} không được vượt quá ${max} ký tự.`;

export const studentSchema = z.object({
  studentCode: z.string().trim().min(1, required("Mã sinh viên")).max(50, tooLong("Mã sinh viên", 50)),
  fullName: z.string().trim().min(1, required("Họ tên")).max(100, tooLong("Họ tên", 100)),
  email: z.string().trim().min(1, required("Email")).max(255, tooLong("Email", 255)).email("Email không hợp lệ."),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
