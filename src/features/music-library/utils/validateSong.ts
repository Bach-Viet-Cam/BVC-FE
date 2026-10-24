import { z } from "zod";
import { FILE_RULES } from "@/features/music-library/constants/musicLibraryConstants";
import { validateFile } from "@/features/music-library/utils/mediaUtils";

export const songSchema = z.object({
  title: z.string().trim().min(1, "Nhập tiêu đề bài hát").max(200, "Tiêu đề tối đa 200 ký tự"),
  composer: z.string().trim().max(200, "Tác giả tối đa 200 ký tự"),
  description: z.string().trim().max(1000, "Mô tả tối đa 1.000 ký tự"),
  genreId: z.string().min(1, "Chọn thể loại"),
  visibility: z.enum(["PUBLIC", "HIDDEN"]),
  coverFile: z
    .instanceof(File)
    .nullable()
    .superRefine((file, context) => {
      const message = file && validateFile(file, FILE_RULES.cover);
      if (message) context.addIssue({ code: z.ZodIssueCode.custom, message });
    }),
  removeCover: z.boolean(),
});

export type SongFormValues = z.infer<typeof songSchema>;
