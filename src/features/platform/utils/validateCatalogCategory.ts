import { z } from "zod";

export const catalogCategorySchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên danh mục").max(100, "Tên tối đa 100 ký tự"),
  description: z.string().trim().max(255, "Mô tả tối đa 255 ký tự"),
  displayOrder: z
    .number({ invalid_type_error: "Vui lòng nhập thứ tự hiển thị" })
    .int("Thứ tự hiển thị phải là số nguyên")
    .min(0, "Thứ tự hiển thị không được âm")
    .max(9999, "Thứ tự hiển thị tối đa 9999"),
});

export type CatalogCategoryFormValues = z.infer<typeof catalogCategorySchema>;
