import { type SortDirection } from "@/shared/types/commonTypes";

export interface InstrumentTune {
  id: string;
  instrumentId: string;
  tuneName: string;
  pitch: number;
  displayOrder: number;
}

export interface InstrumentTuneInput {
  tuneName: string;
  pitch: number;
  displayOrder?: number;
}

export interface InstrumentItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  tunesCount?: number;
  tunes?: InstrumentTune[];
}


export type InstrumentStatusFilter = "active" | "inactive" | "all";
export type InstrumentSortKey = "code" | "name";

export interface InstrumentListParams {
  q?: string;
  status: InstrumentStatusFilter;
  sortBy: InstrumentSortKey;
  sortDir: SortDirection;
}

export interface InstrumentCreateRequest {
  code: string;
  name: string;
  description?: string;
}

export interface InstrumentUpdateRequest {
  name?: string;
  description?: string | null;
}

export type ConfigValueType = "STRING" | "NUMBER" | "BOOLEAN" | "JSON";
export type ConfigGroup = "FILE_LIMIT" | "SCORING" | "PRACTICE_RULE";

export interface SystemConfigItem {
  id: string;
  key: string;
  value: string;
  valueType: ConfigValueType;
  group: ConfigGroup;
  label: string;
  description: string | null;
}

export interface SystemConfigListParams {
  group?: ConfigGroup;
  q?: string;
  sortBy: "label" | "group";
  sortDir: SortDirection;
}
