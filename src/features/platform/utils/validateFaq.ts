import { z } from "zod";

export const FAQ_SCHEMA = z.object({
  question: z.string().trim().min(1, "Vui lòng nhập câu hỏi.").max(300, "Câu hỏi tối đa 300 ký tự."),
  answer: z.string().trim().min(1, "Vui lòng nhập câu trả lời.").max(10000, "Câu trả lời tối đa 10.000 ký tự."),
  topic: z.enum(["COURSE_RULES", "ASSIGNMENTS", "INSTRUMENTS", "PLATFORM"]),
  instrumentId: z.string(),
  displayOrder: z.number().int("Thứ tự phải là số nguyên.").min(0).max(9999),
  isActive: z.boolean(),
});
export type FaqFormValues = z.infer<typeof FAQ_SCHEMA>;
