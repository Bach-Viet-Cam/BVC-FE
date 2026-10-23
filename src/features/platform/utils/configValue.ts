import { type SystemConfigItem } from "@/features/platform/types/configTypes";

// Semesters are stored as a JSON array of { name, startDate, endDate }, edited as table rows (validated by BE).
export const SEMESTERS_CONFIG_KEY = "class.semesters";

export interface SemesterValue {
  name: string;
  startDate: string;
  endDate: string;
}

export function parseSemesters(value: string): SemesterValue[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as SemesterValue[]) : [];
  } catch {
    return [];
  }
}

export const formatConfigDate = (isoDate: string) => isoDate.split("-").reverse().join("/");

function parseList(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function formatConfigValue(config: SystemConfigItem): string {
  if (config.valueType === "BOOLEAN") return config.value === "true" ? "Bật" : "Tắt";
  if (config.key === SEMESTERS_CONFIG_KEY) {
    return parseSemesters(config.value)
      .map((semester) => `${semester.name} (${formatConfigDate(semester.startDate)} - ${formatConfigDate(semester.endDate)})`)
      .join(", ");
  }
  if (config.valueType === "JSON") return parseList(config.value).join(", ");
  return config.value;
}

export function toFormValue(config: SystemConfigItem): string {
  if (config.valueType === "JSON") return parseList(config.value).join(", ");
  return config.value;
}

export function fromFormValue(config: SystemConfigItem, text: string): string {
  if (config.valueType !== "JSON" || config.key === SEMESTERS_CONFIG_KEY) return text.trim();
  const items = text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return JSON.stringify(items);
}
