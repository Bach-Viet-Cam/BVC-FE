export type LlmKeyStatus = "active" | "disabled" | "invalid";

// Không có trường chứa giá trị key: BE không bao giờ trả key về.
export interface LlmKeyItem {
  id: string;
  name: string;
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
}

export interface LlmKeyUpdateInput {
  name?: string;
  status?: "active" | "disabled";
  key?: string;
}
