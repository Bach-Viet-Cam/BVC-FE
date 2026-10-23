import type {
  CompareChartBand,
  CompareChartTick,
  CompareSegment,
  SubmissionAccuracyRange,
  SubmissionDatePreset,
  SubmissionAdvancedFilter,
  SubmissionFilter,
  SubmissionHistoryItem,
  SubmissionKind,
  SubmissionScope,
} from "@/features/practice/types/submissionHistoryTypes";

// Chỉ là mockup: dữ liệu cố định, chưa nối API. "Hôm nay" của mockup là 09/10/2026
export const MOCK_TODAY = "2026-10-09";

export const SUBMISSION_HISTORY_MOCK: SubmissionHistoryItem[] = [
  {
    id: "5",
    pieceId: "ly-ngua-o",
    sheetMusicId: "sheet-ly-ngua-o",
    pieceTitle: "Lý ngựa ô",
    title: "Lý ngựa ô #5",
    submittedAt: "2026-10-09T14:58:00",
    status: "COMPLETED",
    accuracy: 88,
    kind: "SOLO",
    segment: null,
  },
  {
    id: "6",
    pieceId: "mua-xuan-oi",
    sheetMusicId: "sheet-mua-xuan-oi",
    pieceTitle: "Mùa xuân ơi",
    title: "Mùa xuân ơi #2",
    submittedAt: "2026-10-09T08:20:00",
    status: "COMPLETED",
    accuracy: 91,
    kind: "PRACTICE",
    segment: { startSec: 72, endSec: 105 },
  },
  {
    id: "4",
    pieceId: "ly-ngua-o",
    sheetMusicId: "sheet-ly-ngua-o",
    pieceTitle: "Lý ngựa ô",
    title: "Lý ngựa ô #4",
    submittedAt: "2026-10-08T21:14:00",
    status: "COMPLETED",
    accuracy: 82,
    kind: "PRACTICE",
    segment: null,
  },
  {
    id: "3",
    pieceId: "ly-ngua-o",
    sheetMusicId: "sheet-ly-ngua-o",
    pieceTitle: "Lý ngựa ô",
    title: "Lý ngựa ô #3",
    submittedAt: "2026-10-08T09:40:00",
    status: "PROCESSING",
    accuracy: null,
    kind: "ENSEMBLE",
    segment: null,
  },
  {
    id: "2",
    pieceId: "ly-ngua-o",
    sheetMusicId: "sheet-ly-ngua-o",
    pieceTitle: "Lý ngựa ô",
    title: "Lý ngựa ô #2",
    submittedAt: "2026-10-06T20:05:00",
    status: "COMPLETED",
    accuracy: 71,
    kind: "BONUS",
    segment: null,
  },
  {
    id: "7",
    pieceId: "mua-xuan-oi",
    sheetMusicId: "sheet-mua-xuan-oi",
    pieceTitle: "Mùa xuân ơi",
    title: "Mùa xuân ơi #1",
    submittedAt: "2026-10-05T18:10:00",
    status: "COMPLETED",
    accuracy: 76,
    kind: "PRACTICE",
    segment: null,
  },
  {
    id: "1",
    pieceId: "ly-ngua-o",
    sheetMusicId: "sheet-ly-ngua-o",
    pieceTitle: "Lý ngựa ô",
    title: "Lý ngựa ô #1",
    submittedAt: "2026-10-04T19:32:00",
    status: "COMPLETED",
    accuracy: 64,
    kind: "PRACTICE",
    segment: { startSec: 72, endSec: 105 },
  },
];

export const EMPTY_ADVANCED_FILTER: SubmissionAdvancedFilter = {
  title: "",
  fromDate: "",
  toDate: "",
  minAccuracy: "",
  maxAccuracy: "",
  kinds: [],
  scopes: [],
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

export const ADVANCED_SCOPE_OPTIONS: { value: SubmissionScope; label: string }[] = [
  { value: "FULL", label: "Cả bài" },
  { value: "PART", label: "Một đoạn" },
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

export const MSG_25 = "Vui lòng chọn 2 bài nộp khác nhau để so sánh.";
export const MSG_28 = "Đoạn này vẫn sai giống lần trước - nên luyện lại trước.";

// SCR-02: đường cao độ và các đoạn lỗi mẫu của cặp bài #2 và #5
export const COMPARE_TOTAL_BARS = 36;

export const COMPARE_SEGMENTS: CompareSegment[] = [
  { id: "s18", barLabel: "Ô nhịp 18-24", status: "REPEATED" },
  { id: "s31", barLabel: "Ô nhịp 31-34", status: "REPEATED" },
  { id: "s9", barLabel: "Ô nhịp 9-12", status: "IMPROVED" },
  { id: "s27", barLabel: "Ô nhịp 27", status: "NEW" },
];

export const COMPARE_CHART_BANDS: CompareChartBand[] = [
  { id: "b9", status: "IMPROVED", x: 112.7, width: 39.3 },
  { id: "b18", status: "REPEATED", x: 201.2, width: 68.8 },
  { id: "b31", status: "REPEATED", x: 329, width: 39.3 },
];

export const COMPARE_CHART_NOTES = [
  { label: "Do", y: 156 },
  { label: "Re", y: 126 },
  { label: "Mi", y: 96 },
  { label: "Sol", y: 66 },
  { label: "La", y: 36 },
];

export const COMPARE_CHART_TICKS: CompareChartTick[] = [
  { x: 38.9, label: "1" },
  { x: 88.1, label: "6" },
  { x: 147.1, label: "12" },
  { x: 206.1, label: "18" },
  { x: 265.1, label: "24" },
  { x: 324.1, label: "30" },
  { x: 383.1, label: "36" },
];

export const COMPARE_OLDER_PATH =
  "M38.9 71.5 C40.6 72.3 45.5 75.3 48.8 75.9 C52.0 76.5 55.3 76.7 58.6 75.0 C61.9 73.2 65.1 67.0 68.4 65.6 C71.7 64.1 75.0 61.0 78.2 66.2 C81.5 71.3 84.8 86.1 88.1 96.4 C91.4 106.6 94.6 120.6 97.9 127.6 C101.2 134.6 104.5 143.5 107.8 138.4 C111.0 133.3 114.3 101.2 117.6 96.9 C120.9 92.6 124.1 106.9 127.4 112.7 C130.7 118.4 134.0 132.8 137.2 131.3 C140.5 129.9 143.8 112.1 147.1 103.9 C150.4 95.7 153.6 89.7 156.9 81.9 C160.2 74.0 163.5 61.0 166.8 56.8 C170.0 52.5 173.3 52.6 176.6 56.3 C179.9 59.9 183.1 73.2 186.4 78.6 C189.7 83.9 193.0 90.6 196.2 88.4 C199.5 86.2 202.8 66.0 206.1 65.5 C209.4 65.0 212.6 73.1 215.9 85.3 C219.2 97.5 222.5 126.1 225.8 138.5 C229.0 150.9 232.3 161.9 235.6 159.7 C238.9 157.4 242.1 137.9 245.4 125.0 C248.7 112.0 252.0 89.2 255.2 81.9 C258.5 74.6 261.8 79.2 265.1 81.0 C268.4 82.9 271.6 93.0 274.9 93.0 C278.2 92.9 281.5 86.4 284.8 80.9 C288.0 75.4 291.3 64.9 294.6 60.1 C297.9 55.2 301.1 49.0 304.4 51.8 C307.7 54.7 311.0 68.2 314.2 77.3 C317.5 86.5 320.8 101.2 324.1 106.9 C327.4 112.6 330.6 107.8 333.9 111.4 C337.2 115.0 340.5 122.2 343.8 128.5 C347.0 134.7 350.3 147.6 353.6 148.9 C356.9 150.1 360.1 138.1 363.4 135.8 C366.7 133.5 370.0 140.7 373.2 135.0 C376.5 129.3 381.4 107.3 383.1 101.8";

export const COMPARE_NEWER_PATH =
  "M38.9 71.7 C40.6 72.3 45.5 74.9 48.8 75.6 C52.0 76.2 55.3 77.2 58.6 75.4 C61.9 73.7 65.1 66.3 68.4 64.9 C71.7 63.5 75.0 61.9 78.2 66.9 C81.5 72.0 84.8 85.2 88.1 95.5 C91.4 105.8 94.6 121.6 97.9 128.6 C101.2 135.6 104.5 137.8 107.8 137.3 C111.0 136.8 114.3 128.6 117.6 125.6 C120.9 122.7 124.1 119.8 127.4 119.4 C130.7 118.9 134.0 123.9 137.2 123.0 C140.5 122.1 143.8 120.5 147.1 113.9 C150.4 107.2 153.6 92.7 156.9 83.0 C160.2 73.3 163.5 59.9 166.8 55.7 C170.0 51.4 173.3 53.6 176.6 57.3 C179.9 61.0 183.1 72.3 186.4 77.7 C189.7 83.0 193.0 87.3 196.2 89.2 C199.5 91.1 202.8 88.0 206.1 89.2 C209.4 90.5 212.6 88.8 215.9 96.7 C219.2 104.6 222.5 128.1 225.8 136.5 C229.0 145.0 232.3 148.7 235.6 147.6 C238.9 146.5 242.1 135.6 245.4 129.9 C248.7 124.3 252.0 119.8 255.2 113.6 C258.5 107.4 261.8 96.3 265.1 92.8 C268.4 89.2 271.6 94.4 274.9 92.5 C278.2 90.6 281.5 89.0 284.8 81.5 C288.0 74.1 291.3 52.7 294.6 47.9 C297.9 43.1 301.1 48.0 304.4 52.7 C307.7 57.5 311.0 67.2 314.2 76.4 C317.5 85.6 320.8 101.5 324.1 108.0 C327.4 114.4 330.6 112.3 333.9 115.0 C337.2 117.6 340.5 122.6 343.8 123.9 C347.0 125.2 350.3 121.3 353.6 122.8 C356.9 124.4 360.1 131.3 363.4 133.1 C366.7 134.9 370.0 138.9 373.2 133.8 C376.5 128.8 381.4 108.1 383.1 102.9";
