import { type SystemConfigItem } from "@/features/platform/types/configTypes";

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
  if (config.valueType === "JSON") return parseList(config.value).join(", ");
  return config.value;
}

export function toFormValue(config: SystemConfigItem): string {
  if (config.valueType === "JSON") return parseList(config.value).join(", ");
  return config.value;
}

export function fromFormValue(config: SystemConfigItem, text: string): string {
  if (config.valueType !== "JSON") return text.trim();
  const items = text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return JSON.stringify(items);
}
