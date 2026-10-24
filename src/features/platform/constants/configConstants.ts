import { type LucideIcon, FileText, Target, GraduationCap } from "lucide-react";
import { type ConfigGroup, type InstrumentStatusFilter } from "@/features/platform/types/configTypes";

export const CONFIG_GROUP_OPTIONS: { value: ConfigGroup; label: string; icon: LucideIcon }[] = [
  { value: "FILE_LIMIT", label: "Giới hạn file", icon: FileText },
  { value: "SCORING", label: "Ngưỡng chấm", icon: Target },
  { value: "PRACTICE_RULE", label: "Quy tắc luyện tập", icon: GraduationCap },
];

export const CONFIG_GROUP_LABELS: Record<ConfigGroup, string> = {
  FILE_LIMIT: "Giới hạn file",
  SCORING: "Ngưỡng chấm",
  PRACTICE_RULE: "Quy tắc luyện tập",
};

export const INSTRUMENT_STATUS_OPTIONS: { value: InstrumentStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Ngừng hoạt động" },
];
