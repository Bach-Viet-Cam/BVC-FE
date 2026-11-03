import type {
  SubmissionAccuracyRange,
  SubmissionDatePreset,
  SubmissionAdvancedFilter,
  SubmissionFilter,
  SubmissionKind,
} from "@/features/practice/types/submissionHistoryTypes";

export const EMPTY_ADVANCED_FILTER: SubmissionAdvancedFilter = {
  title: "",
  fromDate: "",
  toDate: "",
  minAccuracy: "",
  maxAccuracy: "",
  kinds: [],
};

export const EMPTY_SUBMISSION_FILTER: SubmissionFilter = {
  pieceIds: [],
  datePreset: null,
  accuracyRanges: [],
  advanced: EMPTY_ADVANCED_FILTER,
};

export const ADVANCED_KIND_OPTIONS: { value: SubmissionKind; label: string }[] = [
  { value: "PRACTICE", label: "Luyện tập" },
  { value: "BONUS", label: "Bonus" },
  { value: "SOLO", label: "Độc tấu" },
  { value: "ENSEMBLE", label: "Hòa tấu" },
];

// Mốc nhanh trong popup lọc nâng cao
export const ADVANCED_DATE_PRESETS = [
  { label: "7 ngày qua", days: 7 },
  { label: "30 ngày qua", days: 30 },
  { label: "Tất cả", days: null },
] as const;

export const ADVANCED_ACCURACY_PRESETS = [
  { label: "Tất cả", min: "", max: "" },
  { label: "≥ 85%", min: "85", max: "100" },
  { label: "70-84%", min: "70", max: "84" },
  { label: "< 70%", min: "0", max: "69" },
] as const;

export const DATE_PRESET_OPTIONS: { value: SubmissionDatePreset; label: string }[] = [
  { value: "TODAY", label: "Hôm nay" },
  { value: "LAST_3_DAYS", label: "3 ngày gần đây" },
  { value: "LAST_7_DAYS", label: "7 ngày gần đây" },
  { value: "THIS_MONTH", label: "Tháng này" },
];

export const ACCURACY_RANGE_OPTIONS: { value: SubmissionAccuracyRange; label: string }[] = [
  { value: "ABOVE_90", label: "> 90%" },
  { value: "70_90", label: "70 - 90%" },
  { value: "50_70", label: "50 - 70%" },
  { value: "BELOW_50", label: "< 50%" },
];
