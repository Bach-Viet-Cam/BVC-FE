import { z } from "zod";

export const aiRatingSchema = z.object({
  accuracyStars: z.number().int().min(1).max(5),
  satisfactionStars: z.number().int().min(1).max(5),
  comment: z.string().max(2000),
});

export type AiRatingFormValues = z.infer<typeof aiRatingSchema>;
