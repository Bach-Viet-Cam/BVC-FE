import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên danh mục").max(100, "Tên tối đa 100 ký tự"),
  parentId: z.string(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
