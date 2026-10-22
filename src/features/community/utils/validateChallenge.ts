import { z } from "zod";
import {
  type Challenge,
  type ChallengePayload,
  type CreateChallengePayload,
} from "@/features/community/types/challenge";

export const CHALLENGE_TITLE_MAX = 100;
export const CHALLENGE_DESCRIPTION_MAX = 2000;
export const CHALLENGE_BPM_MIN = 30;
export const CHALLENGE_BPM_MAX = 240;
export const CHALLENGE_ACCURACY_MIN = 0;
export const CHALLENGE_ACCURACY_MAX = 100;
// Mirrors the server maxSubmissionsCap.
export const CHALLENGE_MAX_SUBMISSIONS_CAP = 10;
export const CHALLENGE_MAX_SUBMISSIONS_DEFAULT = 3;

const TITLE_LABEL = "Tên thử thách";

function rangeMessage(field: string, min: number, max: number): string {
  return `${field} phải nằm trong khoảng từ ${min} đến ${max}.`;
}

function isIntInRange(value: string, min: number, max: number): boolean {
  const text = value.trim();
  if (!/^\d+$/.test(text)) return false;
  const number = Number(text);
  return number >= min && number <= max;
}

// Numbers are typed as text so "1.5" and "abc" can be rejected; empty is allowed when optional.
function optionalInt(field: string, min: number, max: number) {
  return z.string().refine((value) => !value.trim() || isIntInRange(value, min, max), rangeMessage(field, min, max));
}

function requiredInt(field: string, min: number, max: number) {
  return z.string().refine((value) => isIntInRange(value, min, max), rangeMessage(field, min, max));
}

// Same rules and wording as the server (ChallengeValidation). Draft mode: only the title is required.
export const challengeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, `${TITLE_LABEL} không được để trống.`)
    .max(CHALLENGE_TITLE_MAX, `${TITLE_LABEL} không được vượt quá ${CHALLENGE_TITLE_MAX} ký tự.`),
  description: z
    .string()
    .trim()
    .max(CHALLENGE_DESCRIPTION_MAX, `Mô tả không được vượt quá ${CHALLENGE_DESCRIPTION_MAX} ký tự.`),
  instrumentId: z.string(),
  pieceId: z.string(),
  // Display only, so the selected-song card does not need a lookup.
  pieceTitle: z.string(),
  pieceBpm: z.string(),
  classIds: z.array(z.string()),
  // Monday of the chosen week, yyyy-MM-dd.
  weekStart: z.string(),
  minAccuracy: optionalInt("Độ chính xác tối thiểu", CHALLENGE_ACCURACY_MIN, CHALLENGE_ACCURACY_MAX),
  requiredBpm: optionalInt("BPM yêu cầu", CHALLENGE_BPM_MIN, CHALLENGE_BPM_MAX),
  maxSubmissions: requiredInt("Số lần nộp tối đa", 1, CHALLENGE_MAX_SUBMISSIONS_CAP),
});

export type ChallengeFormValues = z.infer<typeof challengeSchema>;

// Publish mode: instrument, piece, at least one class and a week are required too.
export const publishChallengeSchema = challengeSchema.superRefine((values, context) => {
  const require = (path: keyof ChallengeFormValues, isPresent: boolean, label: string) => {
    if (!isPresent)
      context.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: `${label} không được để trống.` });
  };
  require("instrumentId", Boolean(values.instrumentId), "Nhạc cụ");
  require("pieceId", Boolean(values.pieceId), "Bài nhạc");
  require("classIds", values.classIds.length > 0, "Lớp");
  require("weekStart", Boolean(values.weekStart), "Tuần");
});

export const EMPTY_CHALLENGE_FORM: ChallengeFormValues = {
  title: "",
  description: "",
  instrumentId: "",
  pieceId: "",
  pieceTitle: "",
  pieceBpm: "",
  classIds: [],
  weekStart: "",
  minAccuracy: "",
  requiredBpm: "",
  maxSubmissions: String(CHALLENGE_MAX_SUBMISSIONS_DEFAULT),
};

export function toChallengeFormValues(challenge: Challenge): ChallengeFormValues {
  return {
    title: challenge.title,
    description: challenge.description ?? "",
    instrumentId: challenge.instrument?.id ?? "",
    pieceId: challenge.piece?.id ?? "",
    pieceTitle: challenge.piece?.title ?? "",
    pieceBpm: "",
    classIds: challenge.classes.map((item) => item.id),
    weekStart: challenge.weekStart ?? "",
    minAccuracy: challenge.minAccuracy === null ? "" : String(challenge.minAccuracy),
    requiredBpm: challenge.requiredBpm === null ? "" : String(challenge.requiredBpm),
    maxSubmissions: String(challenge.maxSubmissions),
  };
}

function toNumberOrNull(value: string): number | null {
  return value.trim() ? Number(value) : null;
}

export function toChallengePayload(values: ChallengeFormValues): ChallengePayload {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    instrumentId: values.instrumentId || null,
    pieceId: values.pieceId || null,
    classIds: values.classIds,
    weekStart: values.weekStart || null,
    minAccuracy: toNumberOrNull(values.minAccuracy),
    requiredBpm: toNumberOrNull(values.requiredBpm),
    maxSubmissions: Number(values.maxSubmissions),
  };
}

export function toCreatePayload(values: ChallengeFormValues, publish: boolean): CreateChallengePayload {
  return { ...toChallengePayload(values), publish };
}
