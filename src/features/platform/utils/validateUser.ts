import { z } from "zod";

export const userSchema = z.object({
  email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ").max(100, "Email tối đa 100 ký tự"),
  username: z.string().trim().min(1, "Vui lòng nhập họ tên").max(100, "Họ tên tối đa 100 ký tự"),
  role: z.enum(["1", "2", "3"], { message: "Vui lòng chọn vai trò" }),
  studentCode: z.string().trim().max(20, "Mã sinh viên tối đa 20 ký tự"),
});

export type UserFormValues = z.infer<typeof userSchema>;
