import { z } from "zod";

export const settingSchema = z.object({
  value: z.string().trim().min(1, "Vui lòng nhập giá trị"),
});

export type SettingFormValues = z.infer<typeof settingSchema>;
