export type LlmProvider = "gemini" | "openrouter";

export const LLM_PROVIDER_LABELS: Record<LlmProvider, string> = {
  gemini: "Google Gemini",
  openrouter: "OpenRouter",
};

export type LlmKeyStatus = "active" | "disabled" | "invalid";

// Không có trường chứa giá trị key: BE không bao giờ trả key về.
export interface LlmKeyItem {
  id: string;
  name: string;
  provider: LlmProvider;
  status: LlmKeyStatus;
  cooldownUntil: string | null;
  lastUsedAt: string | null;
  lastErrorCode: string | null;
  successCount: number;
  failCount: number;
  createdAt: string;
}

export interface LlmKeyCreateInput {
  name: string;
  key: string;
  provider: LlmProvider;
}

export interface LlmKeyUpdateInput {
  name?: string;
  status?: "active" | "disabled";
  key?: string;
}
