import { z } from "zod";
import { FILE_RULES, LIBRARY_MESSAGES } from "@/features/music-library/constants/musicLibraryConstants";
import { validateFile } from "@/features/music-library/utils/mediaUtils";
import { normalizeText } from "@/features/music-library/utils/searchUtils";

interface SheetSchemaContext {
  // Tên các bản khác trong cùng bài (không tính bản đang sửa)
  siblingNames: string[];
  hasExistingSheetFile: boolean;
  hasExistingRecording: boolean;
}

function optionalFile(rule: (typeof FILE_RULES)[keyof typeof FILE_RULES]) {
  return z
    .instanceof(File)
    .nullable()
    .superRefine((file, context) => {
      const message = file && validateFile(file, rule);
      if (message) context.addIssue({ code: z.ZodIssueCode.custom, message });
    });
}

export function createSheetSchema({ siblingNames, hasExistingSheetFile, hasExistingRecording }: SheetSchemaContext) {
  const takenNames = new Set(siblingNames.map(normalizeText));

  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Nhập tên bản")
        .max(100, "Tên bản tối đa 100 ký tự")
        .refine((name) => !takenNames.has(normalizeText(name)), "Tên bản đã có trong bài hát này"),
      description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự"),
      instrumentId: z.string().min(1, "Chọn nhạc cụ"),
      levelId: z.string().min(1, "Chọn trình độ"),
      isMain: z.boolean(),
      visibility: z.enum(["PUBLIC", "HIDDEN"]),
      sheetFile: optionalFile(FILE_RULES.sheet),
      referenceRecording: optionalFile(FILE_RULES.recording),
      tutorialVideo: optionalFile(FILE_RULES.video),
    })
    .superRefine((values, context) => {
      if (!values.sheetFile && !hasExistingSheetFile) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["sheetFile"], message: "Chọn file bản nhạc" });
      }
      if (values.isMain && values.visibility === "PUBLIC" && !values.referenceRecording && !hasExistingRecording) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["referenceRecording"],
          message: LIBRARY_MESSAGES.mainNeedsRecording,
        });
      }
    });
}

export type SheetFormValues = z.infer<ReturnType<typeof createSheetSchema>>;
