import { z } from "zod";
import {
  type AssignmentBase,
  type AssignmentContentPayload,
  type CreateAssignmentPayload,
} from "@/features/classes/types/teacherAssignmentTypes";

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 1000;
export const BPM_RANGE_MESSAGE = "BPM yêu cầu phải nằm trong khoảng từ 1 đến 300.";

function isValidBpm(value: string): boolean {
  if (!value.trim()) return true;
  if (!/^\d+$/.test(value.trim())) return false;
  const bpm = Number(value);
  return bpm >= 1 && bpm <= 300;
}

// Same rules and wording as the server (AssignmentValidation). BPM is typed as text so "1.5" can be rejected.
export const assignmentFormSchema = z.object({
  classId: z.string().min(1, "Lớp không được để trống."),
  title: z
    .string()
    .trim()
    .min(1, "Tiêu đề không được để trống.")
    .max(TITLE_MAX, `Tiêu đề không được vượt quá ${TITLE_MAX} ký tự.`),
  kind: z.string().min(1, "Loại bài không được để trống."),
  description: z.string().trim().max(DESCRIPTION_MAX, `Mô tả không được vượt quá ${DESCRIPTION_MAX} ký tự.`),
  sheetMusicId: z.string(),
  requiredBpm: z.string().refine(isValidBpm, BPM_RANGE_MESSAGE),
});

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

export const ASSIGNMENT_TITLE_MAX = TITLE_MAX;
export const ASSIGNMENT_DESCRIPTION_MAX = DESCRIPTION_MAX;

export const EMPTY_ASSIGNMENT_FORM: AssignmentFormValues = {
  classId: "",
  title: "",
  kind: "",
  description: "",
  sheetMusicId: "",
  requiredBpm: "",
};

export function toAssignmentFormValues(assignment: AssignmentBase): AssignmentFormValues {
  return {
    classId: assignment.classId,
    title: assignment.title,
    kind: assignment.kind,
    description: assignment.description ?? "",
    sheetMusicId: assignment.sheetMusic?.id ?? "",
    requiredBpm: assignment.requiredBpm === null ? "" : String(assignment.requiredBpm),
  };
}

export function toAssignmentContent(values: AssignmentFormValues): AssignmentContentPayload {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    kind: values.kind as AssignmentContentPayload["kind"],
    sheetMusicId: values.sheetMusicId || null,
    requiredBpm: values.requiredBpm.trim() ? Number(values.requiredBpm) : null,
  };
}

export function toCreatePayload(values: AssignmentFormValues, publish: boolean): CreateAssignmentPayload {
  return { classId: values.classId, ...toAssignmentContent(values), publish };
}
